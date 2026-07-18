import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import { users, activityLogs } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { pstr } from "../utils/params";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireAdmin);

const roleSchema = z.object({
  role: z.enum(["super_admin", "admin", "employee", "practitioner", "client", "guest"]),
});

usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users);
    res.json({ users: rows });
  })
);

usersRouter.patch(
  "/:id/role",
  asyncHandler(async (req, res) => {
    const { role } = roleSchema.parse(req.body);
    const [existing] = await db.select().from(users).where(eq(users.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Utilisateur introuvable.");

    // Seul un super administrateur peut promouvoir quelqu'un au rang de super administrateur.
    if (role === "super_admin" && req.user!.role !== "super_admin") {
      throw Errors.forbidden("Seul un super administrateur peut accorder ce rôle.");
    }

    await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, pstr(req.params.id)));

    await db.insert(activityLogs).values({
      id: newId(),
      userId: req.user!.sub,
      action: `role_change:${existing.email}:${existing.role}->${role}`,
      metadata: null,
    });

    res.status(204).send();
  })
);

usersRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body);
    const [existing] = await db.select().from(users).where(eq(users.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Utilisateur introuvable.");

    await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, pstr(req.params.id)));

    res.status(204).send();
  })
);
