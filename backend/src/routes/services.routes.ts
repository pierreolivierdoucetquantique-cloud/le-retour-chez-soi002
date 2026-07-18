import { Router } from "express";
import { eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { services } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";
import { pstr } from "../utils/params";
import {
  createServiceSchema,
  updateServiceSchema,
} from "../validators/services.validators";

export const servicesRouter = Router();

function serialize(row: typeof services.$inferSelect) {
  return {
    ...row,
    includes: row.includes ? (JSON.parse(row.includes) as string[]) : [],
    relatedSlugs: row.relatedSlugs ? (JSON.parse(row.relatedSlugs) as string[]) : [],
  };
}

servicesRouter.get(
  "/admin/all",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(services);
    res.json({ services: rows.map(serialize) });
  })
);

servicesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(services).where(eq(services.isActive, true));
    res.json({ services: rows.map(serialize) });
  })
);

servicesRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const [row] = await db.select().from(services).where(eq(services.slug, pstr(req.params.slug)));
    if (!row) throw Errors.notFound("Service introuvable.");

    const service = serialize(row);
    const related = service.relatedSlugs.length
      ? (await db.select().from(services).where(inArray(services.slug, service.relatedSlugs))).map(
          serialize
        )
      : [];

    res.json({ service, related });
  })
);

servicesRouter.post(
  "/",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = createServiceSchema.parse(req.body);
    const service = {
      id: newId(),
      ...data,
      includes: data.includes ? JSON.stringify(data.includes) : null,
      relatedSlugs: data.relatedSlugs ? JSON.stringify(data.relatedSlugs) : null,
      isActive: true,
    };
    const [created] = await db.insert(services).values(service).returning();
    res.status(201).json({ service: serialize(created) });
  })
);

servicesRouter.patch(
  "/:id",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = updateServiceSchema.parse(req.body);
    const [existing] = await db.select().from(services).where(eq(services.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Service introuvable.");

    const [updated] = await db
      .update(services)
      .set({
        ...data,
        includes: data.includes ? JSON.stringify(data.includes) : undefined,
        relatedSlugs: data.relatedSlugs ? JSON.stringify(data.relatedSlugs) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(services.id, pstr(req.params.id)))
      .returning();

    res.json({ service: serialize(updated) });
  })
);

servicesRouter.delete(
  "/:id",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const [existing] = await db.select().from(services).where(eq(services.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Service introuvable.");

    await db
      .update(services)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(services.id, pstr(req.params.id)));

    res.status(204).send();
  })
);
