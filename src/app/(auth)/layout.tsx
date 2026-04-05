// ─── Auth Layout ───────────────────────────────────────────
// Centered card on light background. Used by the login page.
// No sidebar, no header — just the form floating in the center.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-gray-50 px-4">
      {children}
    </div>
  );
}
