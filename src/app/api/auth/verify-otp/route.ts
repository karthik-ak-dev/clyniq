// POST /api/auth/verify-otp
// - Receives { phone, otp } → verifies via Firebase
// - Returns session token + doctor profile (if exists)
// - Public route (no auth required)
