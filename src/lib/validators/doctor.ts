import { z } from "zod";
import { SLOT_DURATION, DAY_OF_WEEK } from "@/lib/db/types";

const phoneRegex = /^\+91\d{10}$/;

export const onboardDoctorSchema = z.object({
  name: z.string().min(2).max(255),
  phone: z.string().regex(phoneRegex, "Must be +91XXXXXXXXXX"),
  photoUrl: z.string().url().optional(),
  specialization: z.string().max(255).optional(),
  qualifications: z.string().max(500).optional(),
  experienceYears: z.number().int().min(0).max(70).optional(),
  clinicName: z.string().max(255).optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().regex(phoneRegex).optional(),
  consultationFee: z.number().int().min(0), // paise
  depositAmount: z.number().int().min(0), // paise
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().refine((v): v is number => DAY_OF_WEEK.includes(v as 0)),
      startTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM format"),
      endTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:MM format"),
      slotDurationMins: z.number().refine((v): v is number => (SLOT_DURATION as readonly number[]).includes(v)),
      isActive: z.boolean().default(true),
    })
  ).min(1, "At least one schedule required"),
});
export type OnboardDoctorInput = z.infer<typeof onboardDoctorSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  photoUrl: z.string().url().nullable().optional(),
  specialization: z.string().max(255).optional(),
  qualifications: z.string().max(500).optional(),
  experienceYears: z.number().int().min(0).max(70).optional(),
  clinicName: z.string().max(255).optional(),
  clinicAddress: z.string().optional(),
  clinicPhone: z.string().regex(phoneRegex).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateScheduleSchema = z.object({
  schedules: z.array(
    z.object({
      dayOfWeek: z.number().refine((v): v is number => DAY_OF_WEEK.includes(v as 0)),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      slotDurationMins: z.number().refine((v): v is number => (SLOT_DURATION as readonly number[]).includes(v)),
      isActive: z.boolean(),
    })
  ),
});
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export const updateFeesSchema = z.object({
  consultationFee: z.number().int().min(0),
  depositAmount: z.number().int().min(0),
});
export type UpdateFeesInput = z.infer<typeof updateFeesSchema>;
