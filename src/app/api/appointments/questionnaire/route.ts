// POST /api/appointments/questionnaire
// - Public route (patient submits after booking)
// - Validates with questionnaireSchema
// - Saves raw answers to questionnaires table
// - Calls OpenAI to generate AI summary
// - Saves AI summary to questionnaires.ai_summary
