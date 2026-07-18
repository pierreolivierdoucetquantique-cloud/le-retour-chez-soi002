import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { users } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { hashPassword, verifyPassword } from "../utils/password";
import { signAuthToken } from "../utils/jwt";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { registerSchema, loginSchema } from "../validators/auth.validators";
import { requireAuth } from "../middleware/auth";
import { sendWelcomeEmail } from "../services/email.service";

export const authRouter = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 jours
};

function toPublicUser(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  };
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);

    const [existing] = await db.select().from(users).where(eq(users.email, data.email));

    if (existing) {
      throw Errors.conflict("Un compte existe déjà avec ce courriel.");
    }

    const passwordHash = await hashPassword(data.password);
    const user = {
      id: newId(),
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: "client" as const,
      isActive: true,
      emailVerifiedAt: null,
    };

    const [created] = await db.insert(users).values(user).returning();

    const token = signAuthToken({ sub: created.id, email: created.email, role: created.role as never });
    res.cookie("token", token, COOKIE_OPTIONS);
    void sendWelcomeEmail(created.email, created.firstName);
    res.status(201).json({ user: toPublicUser(created), token });
  })
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);

    const [user] = await db.select().from(users).where(eq(users.email, data.email));

    if (!user || !(await verifyPassword(data.password, user.passwordHash))) {
      throw Errors.unauthorized("Courriel ou mot de passe incorrect.");
    }

    if (!user.isActive) {
      throw Errors.forbidden("Ce compte a été désactivé.");
    }

    const token = signAuthToken({ sub: user.id, email: user.email, role: user.role as never });
    res.cookie("token", token, COOKIE_OPTIONS);
    res.json({ user: toPublicUser(user) });
  })
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie("token");
  res.status(204).send();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.sub));

    if (!user) throw Errors.notFound("Utilisateur introuvable.");
    res.json({ user: toPublicUser(user) });
  })
);
