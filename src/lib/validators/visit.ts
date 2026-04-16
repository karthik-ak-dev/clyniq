import { z } from "zod";

export const createVisitSchema = z.object({
  doctorPatientId: z.string().uuid(),
  visitDate: z.string().min(1, "Visit date is required"),
  visitType: z.enum(["initial", "checkup", "followup", "emergency"]),
  notes: z.string().optional().or(z.literal("")),
  prescription: z.string().optional().or(z.literal("")),
  diagnosis: z.string().optional().or(z.literal("")),
  vitals: z.object({
    bp: z.string().optional(),
    weight: z.number().optional(),
    bloodSugar: z.number().optional(),
    temperature: z.number().optional(),
  }).optional(),
  nextVisitDate: z.string().optional().or(z.literal("")),
});

export type CreateVisitInput = z.infer<typeof createVisitSchema>;
