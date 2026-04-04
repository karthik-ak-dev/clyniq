// ─── Twilio Type Stub ──────────────────────────────────────
// Minimal type declaration so the WhatsApp module compiles without
// the twilio package installed. The package is a Phase 3 dependency
// and will be added via `npm install twilio` when WhatsApp is enabled.
// At that point, this file can be removed and replaced by @types/twilio.

declare module "twilio" {
  interface MessageInstance {
    sid: string;
  }

  interface MessageListInstance {
    create(params: {
      body: string;
      from: string;
      to: string;
    }): Promise<MessageInstance>;
  }

  interface TwilioClient {
    messages: MessageListInstance;
  }

  function twilio(accountSid: string, authToken: string): TwilioClient;
  export default twilio;
}
