import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireStaff } from "../middleware/auth";
import { Errors } from "../utils/AppError";
import { env } from "../config/env";
import {
  isGoogleConfigured,
  getGoogleAuthUrl,
  connectGoogleCalendar,
  getGoogleConnectionStatus,
  disconnectGoogleCalendar,
} from "../services/google-calendar.service";

export const calendarRouter = Router();

calendarRouter.get(
  "/google/status",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    res.json({ configured: isGoogleConfigured(), ...(await getGoogleConnectionStatus()) });
  })
);

calendarRouter.get(
  "/google/connect",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    if (!isGoogleConfigured()) {
      throw Errors.badRequest(
        "La connexion Google Calendar n'est pas configurée sur ce serveur (GOOGLE_CLIENT_ID/SECRET manquants)."
      );
    }
    res.redirect(getGoogleAuthUrl());
  })
);

/**
 * Google redirige la personne ici après consentement. Cette route est
 * appelée par le navigateur de la personne (pas par notre frontend), donc
 * elle redirige à la fin vers une page du site plutôt que de renvoyer du JSON.
 */
calendarRouter.get(
  "/google/callback",
  asyncHandler(async (req, res) => {
    const code = req.query.code;
    if (typeof code !== "string") {
      res.redirect(`${env.clientUrl}/administration?calendrier=erreur`);
      return;
    }
    try {
      await connectGoogleCalendar(code);
      res.redirect(`${env.clientUrl}/administration?calendrier=connecte`);
    } catch (err) {
      console.error("Échec de la connexion Google Calendar :", err);
      res.redirect(`${env.clientUrl}/administration?calendrier=erreur`);
    }
  })
);

calendarRouter.delete(
  "/google",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    await disconnectGoogleCalendar();
    res.status(204).send();
  })
);
