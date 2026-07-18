import { z } from "zod";

export const createTestimonialSchema = z.object({
  name: z.string().min(1),
  quote: z.string().min(1).max(1000),
  serviceId: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1).max(5000),
});

export const newsletterSchema = z.object({
  email: z.string().email(),
});
