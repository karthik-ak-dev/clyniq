"use client";

import { AssetPlaceholder } from "@/components/ui/asset-placeholder";

// ─── Check-in Confirmation ─────────────────────────────────
// Success screen shown after the patient submits their check-in.
// Matched to ref_1 screen 4 & ref_2: "All Done, Ravi! 🎉"
// with illustration placeholder and encouraging message.
//
// Renders its own full-screen background (bg_mobile_summary.jpeg)
// which overlays the parent's questionnaire background.

interface CheckinConfirmationProps {
  patientName: string;
}

export function CheckinConfirmation({ patientName }: CheckinConfirmationProps) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-8 text-center"
      style={{ backgroundImage: "url('/images/bg_mobile_summary.jpeg')" }}
    >
      {/* Illustration placeholder — ready for real asset */}
      <AssetPlaceholder width={160} height={160} className="mb-6" />

      <h1 style={{ fontSize: "2.75rem", fontWeight: 800, color: "#4c3a7a", lineHeight: 1.2 }}>
        All Done, {patientName}! 🎉
      </h1>
      <p className="mt-4" style={{ fontSize: "1.35rem", fontWeight: 600, color: "#5b4a8a" }}>
        Your check-in has been submitted.
      </p>
      <p className="mt-3" style={{ fontSize: "1.15rem", fontWeight: 500, color: "#7c6b9e" }}>
        Your doctor will review your updates and follow up if needed.
      </p>
    </div>
  );
}
