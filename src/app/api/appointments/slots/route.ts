// GET /api/appointments/slots?doctor_id=xxx&date=2024-04-02
// - Public route (no auth)
// - Validates with getSlotsSchema
// - Returns available time slots for given doctor + date
// - Logic: schedule for that day minus already booked appointments
