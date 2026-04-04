import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

// ─── Font ──────────────────────────────────────────────────
// Nunito — rounded, friendly sans-serif matching the design
// references. Has soft/rounded terminals, high x-height, and
// warm character that works well on gradient backgrounds.
// All weights loaded: 400 (tertiary), 500/600 (secondary),
// 700/800 (headings), and italic for stylistic variety.
const font = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
});

// ─── Metadata ──────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Clyniq",
  description: "Patient compliance tracking for chronic conditions",
};

// ─── Viewport ──────────────────────────────────────────────
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// ─── Root Layout ───────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>{children}</body>
    </html>
  );
}
