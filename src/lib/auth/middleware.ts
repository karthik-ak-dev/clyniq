// Auth middleware for API routes
// - getAuthenticatedDoctor(req) — extracts Bearer token, verifies via firebase-admin,
//   looks up doctor by phone, returns Doctor or throws 401
// - Used by all doctor-protected API routes
