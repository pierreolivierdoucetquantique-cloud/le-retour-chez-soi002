import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { articles } from "../db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { newId } from "../utils/id";
import { Errors } from "../utils/AppError";
import { requireAuth, requireStaff } from "../middleware/auth";
import { pstr } from "../utils/params";
import {
  createArticleSchema,
  updateArticleSchema,
} from "../validators/articles.validators";

export const blogRouter = Router();

blogRouter.get(
  "/admin/all",
  requireAuth,
  requireStaff,
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(articles).orderBy(desc(articles.createdAt));
    res.json({ articles: rows });
  })
);

blogRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const rows = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt));
    res.json({ articles: rows });
  })
);

blogRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const [row] = await db
      .select()
      .from(articles)
      .where(and(eq(articles.slug, pstr(req.params.slug)), eq(articles.status, "published")));
    if (!row) throw Errors.notFound("Article introuvable.");
    res.json({ article: row });
  })
);

blogRouter.post(
  "/",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = createArticleSchema.parse(req.body);
    const article = {
      id: newId(),
      ...data,
      authorId: req.user!.sub,
      publishedAt: data.status === "published" ? new Date() : null,
    };
    const [created] = await db.insert(articles).values(article).returning();
    res.status(201).json({ article: created });
  })
);

blogRouter.patch(
  "/:id",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const data = updateArticleSchema.parse(req.body);
    const [existing] = await db.select().from(articles).where(eq(articles.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Article introuvable.");

    const becomingPublished = data.status === "published" && existing.status !== "published";

    const [updated] = await db
      .update(articles)
      .set({
        ...data,
        publishedAt: becomingPublished ? new Date() : existing.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, pstr(req.params.id)))
      .returning();

    res.json({ article: updated });
  })
);

blogRouter.delete(
  "/:id",
  requireAuth,
  requireStaff,
  asyncHandler(async (req, res) => {
    const [existing] = await db.select().from(articles).where(eq(articles.id, pstr(req.params.id)));
    if (!existing) throw Errors.notFound("Article introuvable.");
    await db.delete(articles).where(eq(articles.id, pstr(req.params.id)));
    res.status(204).send();
  })
);
