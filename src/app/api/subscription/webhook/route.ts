// POST /api/subscription/webhook
// - Public route (called by Razorpay server)
// - Verifies webhook signature
// - Handles events:
//   - subscription.activated → status=active, set period dates
//   - subscription.charged → update current_period_start/end
//   - subscription.halted → status=expired (payment failed after retries)
//   - subscription.cancelled → status=cancelled
