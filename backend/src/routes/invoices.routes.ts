import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import PDFDocument from "pdfkit";
import { db } from "../db/client";
import { invoices, appointments, services, orderItems, products } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { Errors } from "../utils/AppError";
import { requireAuth } from "../middleware/auth";
import { pstr } from "../utils/params";
import { formatPriceCents } from "../utils/format";

export const invoicesRouter = Router();

invoicesRouter.use(requireAuth);

/** Retourne un libellé lisible pour une facture (nom du service ou des produits achetés). */
async function describeInvoice(invoice: typeof invoices.$inferSelect): Promise<string> {
  if (invoice.appointmentId) {
    const [row] = await db
      .select({ title: services.title })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .where(eq(appointments.id, invoice.appointmentId));
    return row?.title ?? "Séance";
  }
  if (invoice.orderId) {
    const rows = await db
      .select({ title: products.title, quantity: orderItems.quantity })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, invoice.orderId));
    if (rows.length === 0) return "Commande boutique";
    return rows.map((r) => (r.quantity > 1 ? `${r.title} ×${r.quantity}` : r.title)).join(", ");
  }
  return "Facture";
}

/** Liste des factures de la personne connectée, les plus récentes en premier. */
invoicesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const rows = await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, req.user!.sub))
      .orderBy(desc(invoices.createdAt));

    const withDescriptions = await Promise.all(
      rows.map(async (invoice) => ({
        ...invoice,
        description: await describeInvoice(invoice),
      }))
    );

    res.json({ invoices: withDescriptions });
  })
);

/** Génère et retourne un reçu PDF pour une facture donnée, appartenant à la personne connectée. */
invoicesRouter.get(
  "/:id/pdf",
  asyncHandler(async (req, res) => {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, pstr(req.params.id)));
    if (!invoice) throw Errors.notFound("Facture introuvable.");

    const isStaff = ["super_admin", "admin", "employee", "practitioner"].includes(req.user!.role);
    if (invoice.userId !== req.user!.sub && !isStaff) throw Errors.forbidden();

    const description = await describeInvoice(invoice);
    const statusLabel =
      { pending: "En attente", paid: "Payée", refunded: "Remboursée", partial: "Partielle" }[
        invoice.status
      ] ?? invoice.status;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.number}.pdf"`);

    const doc = new PDFDocument({ size: "LETTER", margin: 56 });
    doc.pipe(res);

    doc
      .fontSize(20)
      .text("Le Retour Chez Soi", { continued: false })
      .fontSize(10)
      .fillColor("#666")
      .text("Coaching, accompagnement énergétique et retraites")
      .moveDown(1.5);

    doc
      .fillColor("#000")
      .fontSize(16)
      .text(`Facture ${invoice.number}`)
      .fontSize(10)
      .fillColor("#666")
      .text(`Émise le ${invoice.createdAt.toLocaleDateString("fr-CA")}`)
      .text(`Statut : ${statusLabel}`)
      .moveDown(1.5);

    doc.fillColor("#000").fontSize(11).text(description);
    doc.moveDown(1);

    const line = (label: string, value: string) => {
      doc.fontSize(11).text(label, { continued: true, width: 400 });
      doc.text(value, { align: "right" });
    };

    line("Sous-total", formatPriceCents(invoice.subtotalCents));
    if (invoice.gstCents > 0) line("TPS", formatPriceCents(invoice.gstCents));
    if (invoice.qstCents > 0) line("TVQ", formatPriceCents(invoice.qstCents));
    doc.moveDown(0.3);
    doc.fontSize(13).text("Total", { continued: true, width: 400 });
    doc.fontSize(13).text(formatPriceCents(invoice.totalCents), { align: "right" });

    doc.moveDown(2);
    doc
      .fontSize(9)
      .fillColor("#999")
      .text("Méthode de paiement : " + (invoice.paymentMethod === "stripe" ? "Carte (Stripe)" : "Virement Interac"));

    doc.end();
  })
);
