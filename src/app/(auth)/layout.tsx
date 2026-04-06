// ─── Auth Layout ───────────────────────────────────────────
// Gradient background with soft wave shapes matching the ref.
// Card floats centered on top of the gradient.

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-dvh flex items-center justify-center px-5 py-10 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #f0ecff 0%, #e8e0ff 25%, #f5f0ff 50%, #ede5ff 75%, #f8f5ff 100%)",
      }}
    >
      {/* Decorative wave shapes at bottom — matching ref */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[35%] pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 0%, rgba(196,181,253,0.15) 40%, rgba(167,139,250,0.12) 100%)",
          borderRadius: "50% 50% 0 0 / 30% 30% 0 0",
        }}
      />
      <div
        className="absolute -bottom-10 -left-20 w-[60%] h-[25%] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(196,181,253,0.2) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-5 -right-20 w-[50%] h-[20%] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(221,214,254,0.25) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
