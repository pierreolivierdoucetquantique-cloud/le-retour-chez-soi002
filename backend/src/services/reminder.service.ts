import { and, eq, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "../db/client";
import { appointments, services, users } from "../db/schema";
import { sendAppointmentReminderEmail } from "./email.service";

const REMINDER_LEAD_HOURS = 24;
// Fenêtre de tolérance autour de la cible de 24h, pour couvrir l'intervalle
// entre deux exécutions du planificateur sans envoyer deux fois le même rappel.
const WINDOW_HOURS = 1;

/**
 * Cherche les rendez-vous confirmés ou en attente qui débutent entre 23h et
 * 25h à partir de maintenant, et n'ont pas encore reçu leur rappel, puis
 * envoie le courriel et marque `reminderSentAt`.
 *
 * Conçu pour être appelé à répétition (toutes les 15-30 minutes) par un
 * planificateur ; idempotent grâce à `reminderSentAt`.
 */
export async function sendDueReminders(): Promise<{ sent: number; errors: number }> {
  const now = Date.now();
  const windowStart = new Date(now + (REMINDER_LEAD_HOURS - WINDOW_HOURS) * 3_600_000);
  const windowEnd = new Date(now + (REMINDER_LEAD_HOURS + WINDOW_HOURS) * 3_600_000);

  const due = await db
    .select()
    .from(appointments)
    .where(
      and(
        or(eq(appointments.status, "pending"), eq(appointments.status, "confirmed")),
        isNull(appointments.reminderSentAt),
        gte(appointments.startsAt, windowStart),
        lte(appointments.startsAt, windowEnd)
      )
    );

  let sent = 0;
  let errors = 0;

  for (const appt of due) {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, appt.userId));
      const [service] = await db.select().from(services).where(eq(services.id, appt.serviceId));
      if (!user || !service) continue;

      await sendAppointmentReminderEmail(user.email, {
        serviceTitle: service.title,
        startsAt: appt.startsAt.toISOString(),
      });

      await db
        .update(appointments)
        .set({ reminderSentAt: new Date() })
        .where(eq(appointments.id, appt.id));

      sent++;
    } catch (err) {
      console.error(`Échec de l'envoi du rappel pour le rendez-vous ${appt.id} :`, err);
      errors++;
    }
  }

  if (sent > 0 || errors > 0) {
    console.log(`Rappels de rendez-vous : ${sent} envoyé(s), ${errors} échec(s).`);
  }

  return { sent, errors };
}
