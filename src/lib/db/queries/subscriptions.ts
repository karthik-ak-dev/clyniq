// Subscription DB queries
// - createTrial (on doctor signup — status=trial, trial_ends_at=now+30d)
// - getByDoctorId
// - activate (on Razorpay webhook success)
// - expire (on payment failure after retries)
// - cancel (doctor cancels — remains active till period end)
// - isActive (check if trial valid OR subscription active)
