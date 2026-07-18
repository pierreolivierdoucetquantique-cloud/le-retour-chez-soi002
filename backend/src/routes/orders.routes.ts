import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import { orders, orderItems, products, invoices } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { requireAuth } from "../middleware/auth";
import { nextInvoiceNumber } from "../services/invoice.service";
import { GST_RATE, QST_RATE } from "../config/tax";
import { createOrderCheckoutSession, isStripeConfigured } from "../services/stripe.service";

export const ordersRouter = Router();

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().default(1),
      })
    )
    .min(1),
  paymentMethod: z.enum(["stripe", "interac"]),
});

ordersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await db.select().from(orders).where(eq(orders.userId, req.user!.sub));
    res.json({ orders: rows });
  })
);

ordersRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createOrderSchema.parse(req.body);

    let subtotalCents = 0;
    const resolvedItems: {
      productId: string;
      title: string;
      quantity: number;
      unitPriceCents: number;
    }[] = [];

    for (const item of data.items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (!product || !product.isActive) {
        throw Errors.notFound(`Produit introuvable : ${item.productId}`);
      }
      if (product.stock !== null && product.stock < item.quantity) {
        throw Errors.badRequest(`Stock insuffisant pour « ${product.title} ».`);
      }
      subtotalCents += product.priceCents * item.quantity;
      resolvedItems.push({
        productId: product.id,
        title: product.title,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
      });
    }

    const gstCents = Math.round(subtotalCents * GST_RATE);
    const qstCents = Math.round(subtotalCents * QST_RATE);
    const totalCents = subtotalCents + gstCents + qstCents;

    const orderId = newId();
    await db.insert(orders).values({
      id: orderId,
      userId: req.user!.sub,
      totalCents,
      status: "pending",
      paymentMethod: data.paymentMethod,
    });

    for (const item of resolvedItems) {
      await db.insert(orderItems).values({
        id: newId(),
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
      });

      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product?.stock !== null && product?.stock !== undefined) {
        await db
          .update(products)
          .set({ stock: product.stock - item.quantity })
          .where(eq(products.id, item.productId));
      }
    }

    const invoiceId = newId();
    const invoiceNumber = await nextInvoiceNumber();
    await db.insert(invoices).values({
      id: invoiceId,
      number: invoiceNumber,
      userId: req.user!.sub,
      orderId,
      subtotalCents,
      gstCents,
      qstCents,
      totalCents,
      paymentMethod: data.paymentMethod,
      status: "pending",
    });

    if (data.paymentMethod === "interac") {
      res.status(201).json({
        order: { id: orderId, totalCents, status: "pending" },
        invoice: { id: invoiceId, number: invoiceNumber, subtotalCents, gstCents, qstCents, totalCents },
        payment: {
          method: "interac",
          redirectUrl: null,
          instructions:
            "Un courriel Interac contenant les instructions de virement vous sera envoyé sous peu.",
        },
      });
      return;
    }

    // paymentMethod === "stripe"
    if (!isStripeConfigured()) {
      res.status(201).json({
        order: { id: orderId, totalCents, status: "pending" },
        invoice: { id: invoiceId, number: invoiceNumber, subtotalCents, gstCents, qstCents, totalCents },
        payment: {
          method: "stripe",
          redirectUrl: null,
          instructions:
            "Le paiement par carte n'est pas encore actif sur ce site (clé Stripe manquante). Contactez-nous pour finaliser votre commande.",
        },
      });
      return;
    }

    let session: { url: string; sessionId: string } | null = null;
    try {
      session = await createOrderCheckoutSession({
        orderId,
        customerEmail: req.user!.email,
        items: resolvedItems.map((i) => ({
          title: i.title,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
        })),
        taxCents: gstCents + qstCents,
      });
    } catch (err) {
      // La commande et la facture sont déjà enregistrées ; un problème Stripe
      // ne doit jamais faire perdre la commande, seulement le lien de paiement.
      console.error("Erreur Stripe lors de la création de la session de paiement :", err);
    }

    res.status(201).json({
      order: { id: orderId, totalCents, status: "pending" },
      invoice: { id: invoiceId, number: invoiceNumber, subtotalCents, gstCents, qstCents, totalCents },
      payment: {
        method: "stripe",
        redirectUrl: session?.url ?? null,
        instructions: session
          ? "Vous allez être redirigé·e vers la page de paiement sécurisée Stripe."
          : "Impossible de créer la session de paiement pour le moment.",
      },
    });
    return;
  })
);
