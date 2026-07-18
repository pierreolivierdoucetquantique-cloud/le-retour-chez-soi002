import { Router } from "express";
import { and, eq, gte, lte, ne, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import { appointments, services, availabilities, blockedDates, users, invoices } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { requireAuth } from "../middleware/auth";
import { pstr } from "../utils/params";
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from "../validators/appointments.validators";
import {
  sendAppointmentConfirmationEmail,
  sendAppointmentCancellationEmail,
} from "../services/email.service";
import { createCalendarEvent, deleteCalendarEvent } from "../services/google-calendar.service";
import { createAppointmentCheckoutSession, isStripeConfigured } from "../services/stripe.service";
import { nextInvoiceNumber } from "../services/invoice.service";
import { GST_RATE, QST_RATE } from "../config/tax";
import { DEFAULT_DEPOSIT_PERCENT } from "../config/payment";

export const appointmentsRouter = Router();

/** Liste des rendez-vous de la personne connectée, ou de tous si membre du personnel. */
appointmentsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const isStaff = ["super_admin", "admin", "employee", "practitioner"].includes(
      req.user!.role
    );
    const rows = isStaff
      ? await db.select().from(appointments)
      : await db.select().from(appointments).where(eq(appointments.userId, req.user!.sub));

    const paidInvoices = await db
      .select({ appointmentId: invoices.appointmentId })
      .from(invoices)
      .where(eq(invoices.status, "paid"));
    const paidAppointmentIds = new Set(paidInvoices.map((i) => i.appointmentId));

    res.json({
      appointments: rows.map((a) => ({ ...a, isPaid: paidAppointmentIds.has(a.id) })),
    });
  })
);

appointmentsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createAppointmentSchema.parse(req.body);

    const [service] = await db.select().from(services).where(eq(services.id, data.serviceId));
    if (!service || !service.isActive) throw Errors.notFound("Service introuvable.");

    const startsAt = new Date(data.startsAt);
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
    const dateStr = startsAt.toISOString().slice(0, 10);

    // Bloqué (vacances, jour férié...) ?
    const [blocked] = await db.select().from(blockedDates).where(eq(blockedDates.date, dateStr));
    if (blocked) {
      throw Errors.badRequest("Cette date n'est pas disponible pour une réservation.");
    }

    // Dans les heures d'ouverture définies pour ce jour de la semaine ?
    const dayOfWeek = startsAt.getUTCDay();
    const [dayAvailability] = await db
      .select()
      .from(availabilities)
      .where(eq(availabilities.dayOfWeek, dayOfWeek));

    if (dayAvailability) {
      const [startH, startM] = dayAvailability.startTime.split(":").map(Number);
      const [endH, endM] = dayAvailability.endTime.split(":").map(Number);
      const dayStart = new Date(startsAt);
      dayStart.setUTCHours(startH, startM, 0, 0);
      const dayEnd = new Date(startsAt);
      dayEnd.setUTCHours(endH, endM, 0, 0);

      if (startsAt < dayStart || endsAt > dayEnd) {
        throw Errors.badRequest("Ce créneau est en dehors des heures d'ouverture.");
      }
    }

    // Chevauchement avec un rendez-vous existant (avec tampon) ?
    const bufferMs = (dayAvailability?.bufferMinutes ?? 15) * 60_000;
    const windowStart = new Date(startsAt.getTime() - bufferMs);
    const windowEnd = new Date(endsAt.getTime() + bufferMs);

    const conflicting = await db
      .select()
      .from(appointments)
      .where(
        and(
          ne(appointments.status, "cancelled"),
          or(
            and(gte(appointments.startsAt, windowStart), lte(appointments.startsAt, windowEnd)),
            and(gte(appointments.endsAt, windowStart), lte(appointments.endsAt, windowEnd))
          )
        )
      );

    if (conflicting.length > 0) {
      throw Errors.conflict("Ce créneau vient d'être réservé. Merci d'en choisir un autre.");
    }

    const appointment = {
      id: newId(),
      userId: req.user!.sub,
      serviceId: service.id,
      startsAt,
      endsAt,
      status: "pending" as const,
      notes: data.notes ?? null,
    };

    const [created] = await db.insert(appointments).values(appointment).returning();

    void sendAppointmentConfirmationEmail(req.user!.email, {
      serviceTitle: service.title,
      startsAt: created.startsAt.toISOString(),
    });

    try {
      const googleEventId = await createCalendarEvent({
        summary: `${service.title} — ${req.user!.email}`,
        description: data.notes,
        startsAt,
        endsAt,
        attendeeEmail: req.user!.email,
      });
      if (googleEventId) {
        await db
          .update(appointments)
          .set({ googleEventId })
          .where(eq(appointments.id, created.id));
      }
    } catch (err) {
      // Un problème de synchronisation calendrier ne doit jamais faire
      // perdre la réservation, déjà enregistrée avec succès à ce stade.
      console.error("Erreur de synchronisation Google Calendar :", err);
    }

    res.status(201).json({ appointment: created });
  })
);

appointmentsRouter.post(
  "/:id/checkout",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { payInFull } = z.object({ payInFull: z.boolean().optional() }).parse(req.body ?? {});

    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, pstr(req.params.id)));
    if (!appointment) throw Errors.notFound("Rendez-vous introuvable.");
    if (appointment.userId !== req.user!.sub) throw Errors.forbidden();
    if (appointment.status === "cancelled") {
      throw Errors.badRequest("Ce rendez-vous est annulé.");
    }

    const [existingPaidInvoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.appointmentId, appointment.id), eq(invoices.status, "paid")));
    if (existingPaidInvoice) {
      throw Errors.conflict("Ce rendez-vous a déjà été payé.");
    }

    const [service] = await db.select().from(services).where(eq(services.id, appointment.serviceId));
    if (!service) throw Errors.notFound("Service introuvable.");

    const subtotalCents = payInFull
      ? service.priceCents
      : Math.round(service.priceCents * DEFAULT_DEPOSIT_PERCENT);
    const gstCents = Math.round(subtotalCents * GST_RATE);
    const qstCents = Math.round(subtotalCents * QST_RATE);
    const totalCents = subtotalCents + gstCents + qstCents;

    const invoiceId = newId();
    const invoiceNumber = await nextInvoiceNumber();
    await db.insert(invoices).values({
      id: invoiceId,
      number: invoiceNumber,
      userId: req.user!.sub,
      appointmentId: appointment.id,
      subtotalCents,
      gstCents,
      qstCents,
      totalCents,
      paymentMethod: "stripe",
      status: "pending",
    });

    if (!isStripeConfigured()) {
      res.status(201).json({
        invoice: { id: invoiceId, number: invoiceNumber, subtotalCents, gstCents, qstCents, totalCents },
        payment: {
          redirectUrl: null,
          instructions:
            "Le paiement par carte n'est pas encore actif sur ce site (clé Stripe manquante). Contactez-nous pour finaliser le paiement.",
        },
      });
      return;
    }

    let session: { url: string; sessionId: string } | null = null;
    try {
      session = await createAppointmentCheckoutSession({
        appointmentId: appointment.id,
        customerEmail: req.user!.email,
        serviceTitle: `${service.title}${payInFull ? "" : " (dépôt)"}`,
        amountCents: totalCents,
      });
    } catch (err) {
      console.error("Erreur Stripe lors de la création de la session de paiement :", err);
    }

    res.status(201).json({
      invoice: { id: invoiceId, number: invoiceNumber, subtotalCents, gstCents, qstCents, totalCents },
      payment: {
        redirectUrl: session?.url ?? null,
        instructions: session
          ? "Vous allez être redirigé·e vers la page de paiement sécurisée Stripe."
          : "Impossible de créer la session de paiement pour le moment.",
      },
    });
  })
);

appointmentsRouter.patch(
  "/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [existing] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Rendez-vous introuvable.");

    const isOwner = existing.userId === req.user!.sub;
    const isStaff = ["super_admin", "admin", "employee", "practitioner"].includes(
      req.user!.role
    );
    if (!isOwner && !isStaff) throw Errors.forbidden();

    const { status } = updateAppointmentStatusSchema.parse(req.body);

    // Un·e client·e ne peut qu'annuler son propre rendez-vous, pas le confirmer/compléter.
    if (isOwner && !isStaff && status !== "cancelled") {
      throw Errors.forbidden("Seul le personnel peut modifier ce statut.");
    }

    const [updated] = await db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointments.id, pstr(req.params.id)))
      .returning();

    if (status === "cancelled") {
      const [owner] = await db.select().from(users).where(eq(users.id, existing.userId));
      const [service] = await db.select().from(services).where(eq(services.id, existing.serviceId));
      if (owner && service) {
        void sendAppointmentCancellationEmail(owner.email, {
          serviceTitle: service.title,
          startsAt: existing.startsAt.toISOString(),
        });
      }
      if (existing.googleEventId) {
        deleteCalendarEvent(existing.googleEventId).catch((err) => {
          console.error("Erreur lors de la suppression de l'événement Google Calendar :", err);
        });
      }
    }

    res.json({ appointment: updated });
  })
);

/** Créneaux disponibles pour un service donné, sur une date donnée. */
appointmentsRouter.get(
  "/availability",
  asyncHandler(async (req, res) => {
    const { serviceId, date } = req.query as { serviceId?: string; date?: string };
    if (!serviceId || !date) {
      throw Errors.badRequest("Les paramètres serviceId et date sont requis.");
    }

    const [service] = await db.select().from(services).where(eq(services.id, serviceId));
    if (!service) throw Errors.notFound("Service introuvable.");

    const [blocked] = await db.select().from(blockedDates).where(eq(blockedDates.date, date));
    if (blocked) {
      res.json({ slots: [] });
      return;
    }

    const dayOfWeek = new Date(`${date}T12:00:00Z`).getUTCDay();
    const [dayAvailability] = await db
      .select()
      .from(availabilities)
      .where(eq(availabilities.dayOfWeek, dayOfWeek));
    if (!dayAvailability) {
      res.json({ slots: [] });
      return;
    }

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEndBoundary = new Date(`${date}T23:59:59.999Z`);

    const existing = await db
      .select()
      .from(appointments)
      .where(
        and(
          ne(appointments.status, "cancelled"),
          gte(appointments.startsAt, dayStart),
          lte(appointments.startsAt, dayEndBoundary)
        )
      );

    const [startH, startM] = dayAvailability.startTime.split(":").map(Number);
    const [endH, endM] = dayAvailability.endTime.split(":").map(Number);
    const step = service.durationMinutes + dayAvailability.bufferMinutes;

    const slots: string[] = [];
    let cursor = startH * 60 + startM;
    const dayEndMinutes = endH * 60 + endM;

    while (cursor + service.durationMinutes <= dayEndMinutes) {
      const slotStart = new Date(`${date}T00:00:00.000Z`);
      slotStart.setUTCMinutes(cursor);
      const slotEnd = new Date(slotStart.getTime() + service.durationMinutes * 60_000);

      const overlaps = existing.some((a) => {
        const aStart = a.startsAt.getTime();
        const aEnd = a.endsAt.getTime();
        return slotStart.getTime() < aEnd && slotEnd.getTime() > aStart;
      });

      if (!overlaps) slots.push(slotStart.toISOString());
      cursor += step;
    }

    res.json({ slots });
  })
);
