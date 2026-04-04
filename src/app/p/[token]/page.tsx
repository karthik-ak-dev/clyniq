"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDeviceType } from "@/hooks/use-device-type";

// ─── Page State ────────────────────────────────────────────
type PageState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "already-checked-in"; patientName: string }
  | {
      status: "ready";
      patientName: string;
      doctorName: string;
      token: string;
    };

// ─── Patient Check-In Landing Page ─────────────────────────
// Layout matched to design/ref_1.jpeg (first screen) & ref_2.jpeg:
//   Mobile — text centered in upper-middle, CTA at bottom-left
//   Desktop — centered layout with "use mobile" message (ref_3)
export default function PatientLandingPage() {
  const params = useParams<{ token: string }>();
  const { deviceType, mounted } = useDeviceType();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [view, setView] = useState<"landing" | "checkin">("landing");

  useEffect(() => {
    async function fetchContext() {
      try {
        const res = await fetch(`/api/p/${params.token}`);
        const json = await res.json();

        if (!res.ok || !json.success) {
          setState({
            status: "error",
            message: json.error || "This link is invalid or has expired.",
          });
          return;
        }

        if (json.data.alreadyCheckedIn) {
          setState({
            status: "already-checked-in",
            patientName: json.data.patientName,
          });
          return;
        }

        setState({
          status: "ready",
          patientName: json.data.patientName,
          doctorName: json.data.doctorName,
          token: json.data.token,
        });
      } catch {
        setState({
          status: "error",
          message: "Something went wrong. Please try again.",
        });
      }
    }

    fetchContext();
  }, [params.token]);

  // ─── Loading ───────────────────────────────────────────
  if (state.status === "loading" || !mounted) {
    return (
      <PageShell>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-secondary animate-pulse">Loading...</p>
        </div>
      </PageShell>
    );
  }

  // ─── Error ─────────────────────────────────────────────
  if (state.status === "error") {
    return (
      <PageShell>
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
          <h1 className="text-heading">Oops!</h1>
          <p className="text-secondary mt-3">{state.message}</p>
        </div>
      </PageShell>
    );
  }

  // ─── Already Checked In ────────────────────────────────
  if (state.status === "already-checked-in") {
    return (
      <PageShell>
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
          <h1 className="text-heading">Hi {state.patientName} 👋</h1>
          <p className="text-secondary mt-3">
            You&apos;ve already checked in today ✅
          </p>
          <p className="text-tertiary mt-2">Come back tomorrow!</p>
        </div>
      </PageShell>
    );
  }

  // ─── Checkin Flow (placeholder) ────────────────────────
  if (view === "checkin") {
    return (
      <PageShell bg="questionnaire">
        <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
          <h1 className="text-heading">Check-In</h1>
          <p className="text-secondary mt-3">Check-in flow coming soon...</p>
        </div>
      </PageShell>
    );
  }

  // ─── Ready — Mobile ────────────────────────────────────
  // Ref_1 first screen: text centered upper-middle, button bottom-left
  if (deviceType === "mobile") {
    return (
      <PageShell>
        {/* Content area — centered text, upper portion of screen */}
        <div className="pt-[28vh] px-8 text-center">
          <h1 className="text-heading">Hi {state.patientName} 👋</h1>
          <p className="text-secondary mt-5">
            {state.doctorName} is helping you stay on track.
          </p>
          <p className="text-tertiary mt-3">
            Let&apos;s do a quick check-in today.
          </p>
        </div>

        {/* Spacer pushes button to bottom */}
        <div className="flex-1" />

        {/* CTA — bottom center, full-width with side padding */}
        <div className="px-8 pb-12">
          <div className="btn-cta-wrapper">
            <button
              onClick={() => setView("checkin")}
              className="btn-cta-face"
            >
              Start Check-In &nbsp;→
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ─── Ready — Desktop ───────────────────────────────────
  // Ref_3: centered
  return (
    <PageShell>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
        <h1 className="text-heading">Hi {state.patientName} 👋</h1>
        <p className="text-secondary mt-4">
          {state.doctorName} is helping you stay on track.
        </p>
        <p className="text-tertiary mt-6 max-w-md">
          Please open this link on your mobile phone for the best experience.
        </p>
      </div>
    </PageShell>
  );
}

// ─── Page Shell ────────────────────────────────────────────
function PageShell({
  children,
  bg = "home",
}: {
  children: React.ReactNode;
  bg?: "home" | "questionnaire" | "summary";
}) {
  const bgClasses = {
    home: "bg-[url('/images/bg_mobile_home.jpeg')] md:bg-[url('/images/bg_desktop_home.jpeg')]",
    questionnaire: "bg-[url('/images/bg_mobile_questionare.jpeg')]",
    summary: "bg-[url('/images/bg_mobile_summary.jpeg')]",
  };

  return (
    <main
      className={`h-dvh overflow-hidden bg-cover bg-center bg-no-repeat flex flex-col ${bgClasses[bg]}`}
    >
      {children}
    </main>
  );
}
