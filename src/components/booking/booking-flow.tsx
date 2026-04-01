// Main booking flow orchestrator
// - Manages step state: slot → patient details → OTP → payment → questionnaire → confirmation
// - Renders the right step component based on current step
// - Holds all booking data in state, passes down to children
