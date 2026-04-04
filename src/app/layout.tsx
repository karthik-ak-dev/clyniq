import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// ─── Font ──────────────────────────────────────────────────
// Plus Jakarta Sans — clean, rounded sans-serif that matches
// the soft, friendly aesthetic from the design references.
// Self-hosted via next/font (no external requests, no layout shift).
const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// ─── Metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Clyniq",
  description: "Patient compliance tracking for chronic conditions",
};

// ─── Viewport ──────────────────────────────────────────────
// Prevents zoom on mobile form inputs — important for the
// patient check-in experience where large tap targets are key.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ─── Root Layout ───────────────────────────────────────────
// Minimal shell — just HTML/body with font and antialiasing.
// No shared chrome here because patient pages (/p/*) and doctor
// pages (/dashboard/*) have completely different visual designs.
// Each route group adds its own layout on top of this.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontSans.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
