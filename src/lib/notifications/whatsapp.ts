// ─── WhatsApp Notification Sender ──────────────────────────
// Sends daily check-in reminders to patients via Twilio WhatsApp API.
// Feature-flagged: only sends when WHATSAPP_ENABLED=true in env.
//
// Prerequisites (Phase 3):
//   - Twilio account with WhatsApp sandbox or approved sender
//   - Environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN,
//     TWILIO_WHATSAPP_FROM (e.g., "whatsapp:+14155238886")
//   - npm install twilio (not added to deps until Phase 3)
//
// The function is safe to call even when WhatsApp is disabled —
// it returns early with a log message. This lets the cron job
// run without conditional wrapping.

type ReminderParams = {
  phone: string;       // Patient phone in +91XXXXXXXXXX format
  patientName: string; // For personalized greeting
  doctorName: string;  // For context ("Dr. Sharma")
  magicLink: string;   // Full URL: https://doctorrx.in/p/[token]
};

export async function sendWhatsAppReminder(
  params: ReminderParams
): Promise<{ sent: boolean; error?: string }> {
  // Feature flag check — skip silently when disabled
  if (process.env.WHATSAPP_ENABLED !== "true") {
    console.log(
      `[WhatsApp] Skipped — WHATSAPP_ENABLED is not true. Would have sent to ${params.phone}`
    );
    return { sent: false, error: "WhatsApp is disabled" };
  }

  // Validate Twilio credentials are present
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!accountSid || !authToken || !from) {
    console.error("[WhatsApp] Missing Twilio credentials in environment");
    return { sent: false, error: "Missing Twilio credentials" };
  }

  // Compose the message body
  const body = [
    `Hi ${params.patientName} 👋`,
    `Time for your daily check-in with ${params.doctorName}`,
    "",
    `👉 Check-in now: ${params.magicLink}`,
  ].join("\n");

  try {
    // Dynamic import — Twilio SDK is only loaded when actually sending.
    // This avoids import errors when twilio isn't installed yet (Phase 1-2).
    const twilio = await import("twilio");
    const client = twilio.default(accountSid, authToken);

    await client.messages.create({
      body,
      from, // Twilio WhatsApp sender (e.g., "whatsapp:+14155238886")
      to: `whatsapp:${params.phone}`, // Patient phone as WhatsApp number
    });

    console.log(`[WhatsApp] Sent reminder to ${params.phone}`);
    return { sent: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Twilio error";
    console.error(`[WhatsApp] Failed to send to ${params.phone}: ${message}`);
    return { sent: false, error: message };
  }
}
