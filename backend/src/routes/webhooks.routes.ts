import { Router } from "express";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "../db/client";
import { orders, invoices, users, appointments, services } from "../db/schema";
import { verifyWebhookSignature } from "../services/stripe.service";
import { sendOrderReceiptEmail, sendAppointmentPaymentReceiptEmail } from "../services/email.service";

export const webhooksRouter = Router();

/**
 * Cette route doit recevoir le corps brut de la requête (pas du JSON déjà
 * parsé) car Stripe signe le corps exact envoyé sur le fil. Le middleware
 * express.raw() est appliqué spécifiquement à cette route dans app.ts,
 * avant le middleware express.json() global.
 */
webhooksRouter.post("/stripe", async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (typeof signature !== "string") {
    res.status(400).json({ error: "Signature Stripe manquante." });
    return;
  }

  let event: Stripe.Event;
  try {
    event = verifyWebhookSignature(req.body as Buffer, signature);
  } catch (err) {
    console.error("Signature Stripe invalide :", err);
    res.status(400).json({ error: "Signature invalide." });
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    const appointmentId = session.metadata?.appointmentId;

    if (orderId) {
      await db
        .update(orders)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      await db
        .update(invoices)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(invoices.orderId, orderId));

      const [invoice] = await db.select().from(invoices).where(eq(invoices.orderId, orderId));
      if (invoice) {
        const [user] = await db.select().from(users).where(eq(users.id, invoice.userId));
        if (user) {
          void sendOrderReceiptEmail(user.email, {
            invoiceNumber: invoice.number,
            totalCents: invoice.totalCents,
          });
        }
      }
    }

    if (appointmentId) {
      await db
        .update(invoices)
        .set({ status: "paid", updatedAt: new Date() })
        .where(eq(invoices.appointmentId, appointmentId));

      await db
        .update(appointments)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(appointments.id, appointmentId));

      const [invoice] = await db
        .select()
        .from(invoices)
        .where(eq(invoices.appointmentId, appointmentId));
      const [appointment] = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId));

      if (invoice && appointment) {
        const [user] = await db.select().from(users).where(eq(users.id, invoice.userId));
        const [service] = await db.select().from(services).where(eq(services.id, appointment.serviceId));
        if (user && service) {
          void sendAppointmentPaymentReceiptEmail(user.email, {
            invoiceNumber: invoice.number,
            totalCents: invoice.totalCents,
            serviceTitle: service.title,
          });
        }
      }
    }
  }

  res.json({ received: true });
});
