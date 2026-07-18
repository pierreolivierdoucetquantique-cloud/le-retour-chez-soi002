import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Courriel invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

export const loginSchema = z.object({
  email: z.string().email("Courriel invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Courriel invalide"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "8 caractères minimum").optional(),
});
