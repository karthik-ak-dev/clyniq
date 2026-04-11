import type { Metadata, Viewport } from "next";
import { DM_Sans, Nunito } from "next/font/google";
import "./globals.css";

// ─── Fonts ─────────────────────────────────────────────────
// DM Sans — dashboard pages (matches Figma design system).
// Nunito — patient check-in pages (warm, friendly).
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DoctorRx",
  description: "Patient compliance tracking for chronic conditions — by Hormonia",
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
      <body className={`${dmSans.variable} ${nunito.variable} font-(family-name:--font-dm-sans) antialiased`}>{children}</body>
    </html>
  );
}
