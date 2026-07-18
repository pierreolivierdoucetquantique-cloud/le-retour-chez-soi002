import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { contactMessages } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

export const messagesRouter = Router();

/**
 * Historique des messages envoyés par la personne connectée via le formulaire
 * de contact (rapproché par courriel — il n'existe pas encore de messagerie
 * bidirectionnelle avec réponse de l'équipe dans cette version).
 */
messagesRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rows = await db
      .select()
      .from(contactMessages)
      .where(eq(contactMessages.email, req.user!.email))
      .orderBy(desc(contactMessages.createdAt));

    res.json({ messages: rows });
  })
);
