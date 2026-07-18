import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { contactMessages, newsletterSubscribers } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { contactSchema, newsletterSchema } from "../validators/misc.validators";
import {
  sendContactAcknowledgementEmail,
  sendContactNotificationToAdmin,
  sendNewsletterWelcomeEmail,
} from "../services/email.service";

export const miscRouter = Router();

miscRouter.post(
  "/contact",
  asyncHandler(async (req, res) => {
    const data = contactSchema.parse(req.body);
    await db.insert(contactMessages).values({ id: newId(), ...data, isRead: false });

    void sendContactAcknowledgementEmail(data.email, data.name);
    void sendContactNotificationToAdmin(data);

    res.status(201).json({ message: "Votre message a bien été envoyé." });
  })
);

miscRouter.post(
  "/newsletter",
  asyncHandler(async (req, res) => {
    const { email } = newsletterSchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email));

    if (!existing) {
      await db.insert(newsletterSubscribers).values({ id: newId(), email });
      void sendNewsletterWelcomeEmail(email);
    }

    res.status(201).json({ message: "Inscription confirmée." });
  })
);
