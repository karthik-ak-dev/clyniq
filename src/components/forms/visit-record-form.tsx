// Visit record form (for doctor to fill during consultation)
// - Complaint (pre-filled from questionnaire if available)
// - Diagnosis (text)
// - Vitals: BP, Temperature, Weight, Pulse (all optional)
// - Prescription table (repeatable rows):
//   - Medicine name, dosage, frequency (OD/BD/TID/QID/SOS), duration, instructions
//   - Add/remove row buttons
// - Investigations (text)
// - Notes (text)
// - Follow-up date (date picker)
// - Document upload (camera/file → R2)
// - Submit: POST /api/visits
