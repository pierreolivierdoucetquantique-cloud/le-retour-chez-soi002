import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireStaff } from "../middleware/auth";
import { sendDueReminders } from "../services/reminder.service";

export const adminRouter = Router();

/**
 * Déclenche manuellement la vérification des rappels de rendez-vous.
 * Utile pour tester sans attendre le prochain passage du planificateur
 * (toutes les 15 minutes), ou pour un déclenchement à la demande.
 */
adminRouter.post(
  "/reminders/run",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    const result = await sendDueReminders();
    res.json(result);
  })
);
