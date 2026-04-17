// ─── Auth Layout ───────────────────────────────────────────
// Clean minimal background matching the dashboard surface color.
// Card floats centered on the page.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-5 py-10 bg-surface">
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
