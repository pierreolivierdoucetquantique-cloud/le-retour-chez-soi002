import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/client";
import { products } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";
import { pstr } from "../utils/params";

export const productsRouter = Router();

productsRouter.get(
  "/admin/all",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(products);
    res.json({ products: rows });
  })
);

const createProductSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  type: z.enum(["physical", "digital", "course", "gift_card"]),
  stock: z.number().int().nonnegative().optional(),
  fileUrl: z.string().url().optional(),
});

productsRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(products).where(eq(products.isActive, true));
    res.json({ products: rows });
  })
);

productsRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const [row] = await db.select().from(products).where(eq(products.slug, pstr(req.params.slug)));
    if (!row) throw Errors.notFound("Produit introuvable.");
    res.json({ product: row });
  })
);

productsRouter.post(
  "/",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = createProductSchema.parse(req.body);
    const product = { id: newId(), ...data, isActive: true };
    const [created] = await db.insert(products).values(product).returning();
    res.status(201).json({ product: created });
  })
);

productsRouter.patch(
  "/:id",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = createProductSchema.partial().extend({ isActive: z.boolean().optional() }).parse(req.body);
    const [existing] = await db.select().from(products).where(eq(products.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Produit introuvable.");

    const [updated] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, pstr(req.params.id)))
      .returning();

    res.json({ product: updated });
  })
);
