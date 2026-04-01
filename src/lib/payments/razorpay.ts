// Razorpay integration
// - razorpayInstance (initialized with key_id + key_secret)
// - createOrder (patient deposit — one-time payment)
// - createSubscription (doctor monthly plan — ₹499/mo recurring)
// - verifyPaymentSignature (validate callback from Razorpay checkout)
// - verifyWebhookSignature (validate webhook POST from Razorpay server)
// - cancelSubscription
