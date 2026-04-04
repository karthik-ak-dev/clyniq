import { reminderQueries } from "@/lib/db/queries";
import { sendWhatsAppReminder } from "@/lib/notifications/whatsapp";

// ─── POST /api/reminders/send ──────────────────────────────
// Cron-triggered endpoint that sends WhatsApp reminders to patients.
// Called by Vercel Cron every hour (see vercel.json).
//
// Flow:
//   1. Check feature flag — exit early if WhatsApp is disabled
//   2. Query all reminder configs that are due (enabled + time <= now + not sent today)
//   3. For each, send a WhatsApp message via Twilio
//   4. Mark the reminder as sent (update lastSentAt)
//
// Security: In production, this should be secured with a cron secret
// (CRON_SECRET env var) to prevent unauthorized triggers.
// For MVP, it relies on Vercel's built-in cron authentication.
//
// This is a Phase 3 feature — safe to deploy in Phase 1/2 as the
// feature flag and dynamic Twilio import prevent any actual sends.
export async function POST() {
  // Feature flag — early exit if WhatsApp is not enabled
  if (process.env.WHATSAPP_ENABLED !== "true") {
    return Response.json({
      success: true,
      message: "WhatsApp is disabled, skipping reminders",
      sent: 0,
    });
  }

  try {
    // Get current time in HH:MM format for the reminder window
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // "09:00"

    // Fetch all due reminders with patient + doctor context
    const dueReminders = await reminderQueries.getDueReminders(
      currentTime,
      now
    );

    // Construct the base URL for magic links
    const baseUrl = process.env.NEXTAUTH_URL || "https://clyniq.in";

    let sentCount = 0;

    // Send reminders in parallel (Twilio can handle concurrent requests)
    await Promise.all(
      dueReminders.map(async (reminder) => {
        const result = await sendWhatsAppReminder({
          phone: reminder.patientPhone,
          patientName: reminder.patientName,
          doctorName: reminder.doctorName,
          magicLink: `${baseUrl}/p/${reminder.magicToken}`,
        });

        // Only mark as sent if the message was actually delivered
        if (result.sent) {
          await reminderQueries.markSent(reminder.config.id);
          sentCount++;
        }
      })
    );

    return Response.json({
      success: true,
      message: `Sent ${sentCount} of ${dueReminders.length} reminders`,
      sent: sentCount,
      total: dueReminders.length,
    });
  } catch (error) {
    console.error("[Reminders] Cron job failed:", error);
    return Response.json(
      { success: false, error: "Reminder cron failed" },
      { status: 500 }
    );
  }
}
