import { z } from "zod";

export const createServiceSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
  title: z.string().min(1),
  description: z.string().min(1),
  longDescription: z.string().optional(),
  includes: z.array(z.string()).optional(),
  relatedSlugs: z.array(z.string()).optional(),
  durationMinutes: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
});

export const updateServiceSchema = createServiceSchema.partial();
