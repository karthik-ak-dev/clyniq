import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

// ─── Font ──────────────────────────────────────────────────
// DM Sans — geometric, clean, modern SaaS font.
// Excellent weight differentiation at 400/500/600/700.
// Looks premium at both small dashboard text and large headings.
const font = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Clyniq",
  description: "Patient compliance tracking for chronic conditions",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

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
