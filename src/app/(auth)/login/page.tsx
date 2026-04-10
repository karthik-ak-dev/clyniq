import { LoginForm } from "@/components/forms/login-form";

// ─── Login Page ────────────────────────────────────────────
// Exactly matched to design/doc_flow/login.png.
// Compact card with tight spacing. Inter font.
// Weight: 400 body, 500 labels, 600 headings.

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Logo — above the card */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
          boxShadow: "0 4px 14px rgba(109,40,217,0.35)",
        }}
      >
        <span className="text-white text-lg" style={{ fontWeight: 700 }}>C</span>
      </div>

      {/* Card — compact */}
      <div
        className="w-full bg-white rounded-2xl px-6 py-6"
        style={{
          boxShadow: "0 8px 40px rgba(124,58,237,0.08), 0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* App name */}
        <div className="text-center">
          <p className="text-[0.95rem] text-[#7c3aed]" style={{ fontWeight: 600 }}>DoctorRx</p>
          <p className="text-[0.7rem] text-gray-400 mt-0.5" style={{ fontWeight: 400 }}>by Hormonia</p>
        </div>

        {/* Welcome Back */}
        <div className="text-center mt-4 mb-1">
          <h1 className="text-[1.25rem] text-gray-900" style={{ fontWeight: 600 }}>Welcome Back</h1>
          <p className="text-[0.8rem] text-gray-400 mt-1" style={{ fontWeight: 400 }}>Sign in to your account</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
