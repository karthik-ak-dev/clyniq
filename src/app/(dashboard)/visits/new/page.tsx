// Add visit record — /visits/new?patient_id=xxx&appointment_id=yyy
// - Pre-fills complaint from questionnaire if available
// - Form: complaint, diagnosis, vitals, prescription table, investigations, notes, follow-up
// - Uses components/forms/VisitRecordForm
// - On submit: POST /api/visits → redirect to /patients/:id
