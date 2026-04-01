// POST /api/doctor/onboard
// - Auth required (doctor must be logged in)
// - Validates input with onboardDoctorSchema
// - Creates doctor profile + schedules + trial subscription
// - Auto-generates slug from name
// - Returns created doctor
