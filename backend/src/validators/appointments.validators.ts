import { z } from "zod";

export const createAppointmentSchema = z.object({
  serviceId: z.string().min(1),
  startsAt: z.string().datetime({ message: "Date de début invalide (ISO 8601)" }),
  notes: z.string().max(2000).optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});
