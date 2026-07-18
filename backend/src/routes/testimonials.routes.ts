import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { testimonials } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";
import { pstr } from "../utils/params";
import { createTestimonialSchema } from "../validators/misc.validators";

export const testimonialsRouter = Router();

testimonialsRouter.get(
  "/admin/all",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(testimonials);
    res.json({ testimonials: rows });
  })
);

testimonialsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(testimonials).where(eq(testimonials.isApproved, true));
    res.json({ testimonials: rows });
  })
);

/** Toute personne connectée peut soumettre un témoignage ; il attend l'approbation du personnel. */
testimonialsRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createTestimonialSchema.parse(req.body);
    const testimonial = {
      id: newId(),
      ...data,
      serviceId: data.serviceId ?? null,
      isApproved: false,
    };
    const [created] = await db.insert(testimonials).values(testimonial).returning();
    res.status(201).json({
      testimonial: created,
      message: "Merci ! Votre témoignage sera publié après vérification.",
    });
  })
);

testimonialsRouter.patch(
  "/:id/approve",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const [existing] = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Témoignage introuvable.");

    await db
      .update(testimonials)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(testimonials.id, pstr(req.params.id)));

    res.status(204).send();
  })
);

testimonialsRouter.delete(
  "/:id",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const [existing] = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Témoignage introuvable.");
    await db.delete(testimonials).where(eq(testimonials.id, pstr(req.params.id)));
    res.status(204).send();
  })
);
