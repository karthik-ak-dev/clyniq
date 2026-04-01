export {
  onboardDoctorSchema,
  updateProfileSchema,
  updateScheduleSchema,
  updateFeesSchema,
  type OnboardDoctorInput,
  type UpdateProfileInput,
  type UpdateScheduleInput,
  type UpdateFeesInput,
} from "./doctor";

export {
  bookAppointmentSchema,
  questionnaireSchema,
  updateStatusSchema,
  getSlotsSchema,
  type BookAppointmentInput,
  type QuestionnaireInput,
  type UpdateStatusInput,
  type GetSlotsInput,
} from "./appointment";

export {
  createVisitSchema,
  prescriptionRowSchema,
  type CreateVisitInput,
} from "./visit";
