// GET /api/patients/search?q=rajesh
// - Auth required (doctor)
// - Searches by name (ILIKE) or phone (LIKE), scoped to doctor_id
// - Returns matching patients (limited to 20)
