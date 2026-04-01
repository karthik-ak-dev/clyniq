// POST /api/visits
// - Auth required (doctor)
// - Validates with createVisitSchema
// - Creates visit record + prescription rows
// - Optionally links to appointment and marks it completed
// - Uploads document to R2 if attached
