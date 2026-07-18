import { Router } from "express";
import { asc, desc, eq, gte } from "drizzle-orm";
import { db } from "../db/client";
import { events } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";
import { pstr } from "../utils/params";
import { createEventSchema, updateEventSchema } from "../validators/events.validators";

export const eventsRouter = Router();

eventsRouter.get(
  "/admin/all",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(events).orderBy(desc(events.startsAt));
    res.json({ events: rows });
  })
);

eventsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(events)
      .where(gte(events.startsAt, new Date()))
      .orderBy(asc(events.startsAt));
    res.json({ events: rows });
  })
);

eventsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const [row] = await db.select().from(events).where(eq(events.id, pstr(req.params.id)));
    if (!row) throw Errors.notFound("Événement introuvable.");
    res.json({ event: row });
  })
);

eventsRouter.post(
  "/",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = createEventSchema.parse(req.body);
    const event = {
      id: newId(),
      ...data,
      startsAt: new Date(data.startsAt),
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    };
    const [created] = await db.insert(events).values(event).returning();
    res.status(201).json({ event: created });
  })
);

eventsRouter.patch(
  "/:id",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = updateEventSchema.parse(req.body);
    const [existing] = await db.select().from(events).where(eq(events.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Événement introuvable.");

    const [updated] = await db
      .update(events)
      .set({
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(events.id, pstr(req.params.id)))
      .returning();

    res.json({ event: updated });
  })
);

eventsRouter.delete(
  "/:id",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const [existing] = await db.select().from(events).where(eq(events.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Événement introuvable.");
    await db.delete(events).where(eq(events.id, pstr(req.params.id)));
    res.status(204).send();
  })
);
