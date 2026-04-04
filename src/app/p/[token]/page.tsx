"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useDeviceType } from "@/hooks/use-device-type";

// ─── Page State ────────────────────────────────────────────
// Discriminated union — each state maps to exactly one UI branch.
// No impossible combinations, fully type-safe rendering.
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
// The first thing a patient sees when they tap their magic link.
//
// Mobile: greeting + "Start Check-In →" CTA button
// Desktop: greeting + "Please open this link on your mobile"
//
// Fetches patient context from GET /api/p/[token] on mount.
// The token in the URL is the auth — no login required.
export default function PatientLandingPage() {
  const params = useParams<{ token: string }>();
  const deviceType = useDeviceType();
  const [state, setState] = useState<PageState>({ status: "loading" });
  const [view, setView] = useState<"landing" | "checkin">("landing");

  // Fetch patient context on mount
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

  // ─── Loading State ─────────────────────────────────────
  if (state.status === "loading") {
    return (
      <PageShell>
        <p className="text-white/80 text-lg animate-pulse">Loading...</p>
      </PageShell>
    );
  }

  // ─── Error State ───────────────────────────────────────
  if (state.status === "error") {
    return (
      <PageShell>
        <h1 className="text-3xl font-bold text-white">Oops!</h1>
        <p className="text-white/80 text-lg">{state.message}</p>
      </PageShell>
    );
  }

  // ─── Already Checked In ────────────────────────────────
  if (state.status === "already-checked-in") {
    return (
      <PageShell>
        <h1 className="text-4xl font-bold text-white">
          Hi {state.patientName} 👋
        </h1>
        <p className="text-white/90 text-lg">
          You&apos;ve already checked in today ✅
        </p>
        <p className="text-white/70 text-base">Come back tomorrow!</p>
      </PageShell>
    );
  }

  // ─── Checkin Flow (placeholder for now) ────────────────
  // When checkin flow components are built, they render here
  // inline — no page navigation needed.
  if (view === "checkin") {
    return (
      <PageShell bg="questionnaire">
        <h1 className="text-3xl font-bold text-white">Check-In</h1>
        <p className="text-white/80 text-lg">
          Check-in flow coming soon...
        </p>
      </PageShell>
    );
  }

  // ─── Ready State (main landing) ────────────────────────
  return (
    <PageShell>
      <div className="flex flex-col items-center justify-center gap-6 text-center px-8">
        <h1 className="text-4xl font-bold text-white">
          Hi {state.patientName} 👋
        </h1>
        <p className="text-white/90 text-lg">
          Dr. {state.doctorName} is helping you stay on track.
        </p>
        <p className="text-white/70 text-base">
          Let&apos;s do a quick check-in today.
        </p>

        <div className="mt-8">
          {deviceType === "mobile" ? (
            <button
              onClick={() => setView("checkin")}
              className="bg-cta-gradient rounded-full px-12 py-4 text-white font-bold text-lg shadow-lg active:scale-95 transition-transform"
            >
              Start Check-In →
            </button>
          ) : (
            <p className="text-white/80 text-base max-w-md">
              Please open this link on your mobile phone for the best
              experience.
            </p>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// ─── Page Shell ────────────────────────────────────────────
// Shared wrapper for all states — provides the full-screen gradient
// background and centers content vertically and horizontally.
//
// Background images switch via CSS media queries (instant, no flash).
// The `bg` prop selects which background set to use:
//   "home" (default) → bg_mobile_home / bg_desktop_home
//   "questionnaire"  → bg_mobile_questionare (for check-in flow)
//   "summary"        → bg_mobile_summary (for completion screen)
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
      className={`min-h-dvh bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center ${bgClasses[bg]}`}
    >
      {children}
    </main>
  );
}
