import { z } from "zod";

export const createArticleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  category: z.string().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const updateArticleSchema = createArticleSchema.partial();
