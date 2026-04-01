// POST /api/appointments/book
// - Public route (patient-facing, no doctor auth)
// - Validates with bookAppointmentSchema
// - Steps:
//   1. Check slot still available (prevent double booking)
//   2. Find or create patient by doctor_id + phone
//   3. Verify Razorpay payment
//   4. Create appointment with status=booked
//   5. Return appointment ID (for questionnaire submission)
