"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Login Form ────────────────────────────────────────────
// Exactly matched to design/doc_flow/login.png:
//   - Compact inline fields: label + icon + input on one row
//   - Full-width bottom border per field
//   - Small "Sign In" pill button
//   - Tight vertical spacing throughout

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mt-4">
      {/* Email field — label left, input right, bottom border */}
      <div style={{ borderBottom: "1px solid #e5e7eb" }} className="py-3 flex items-center gap-3">
        <span className="text-[0.82rem] text-gray-500 shrink-0" style={{ fontWeight: 500, minWidth: "4.5rem" }}>Email</span>
        <span className="text-gray-300 text-[0.85rem]">✉</span>
        <input
          type="email"
          className="flex-1 text-[0.85rem] text-gray-700 bg-transparent outline-none placeholder-gray-300"
          style={{ fontWeight: 400 }}
          placeholder="doctor@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password field — same layout */}
      <div style={{ borderBottom: "1px solid #e5e7eb" }} className="py-3 flex items-center gap-3">
        <span className="text-[0.82rem] text-gray-500 shrink-0" style={{ fontWeight: 500, minWidth: "4.5rem" }}>Password</span>
        <span className="text-gray-300 text-[0.85rem]">🔒</span>
        <input
          type={showPassword ? "text" : "password"}
          className="flex-1 text-[0.85rem] text-gray-700 bg-transparent outline-none placeholder-gray-300"
          style={{ fontWeight: 400 }}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-[0.78rem] text-[#7c3aed] shrink-0"
          style={{ fontWeight: 500 }}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Forgot password — compact row */}
      <div className="flex items-center justify-between mt-3 mb-4">
        <span className="text-[0.75rem] text-gray-300" style={{ fontWeight: 400 }}>Forgot password?</span>
        <span className="text-[0.75rem] text-[#7c3aed]" style={{ fontWeight: 500 }}>Forgot password?</span>
      </div>

      {/* Error */}
      {error && (
        <div
          className="px-3 py-2 rounded-lg text-[0.8rem] text-red-600 text-center mb-3"
          style={{ fontWeight: 500, background: "#fef2f2", border: "1px solid #fecaca" }}
        >
          {error}
        </div>
      )}

      {/* Sign In — compact pill */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-full text-[0.88rem] text-white transition-all active:scale-[0.98] disabled:opacity-50"
        style={{
          fontWeight: 600,
          background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)",
          boxShadow: "0 4px 14px rgba(109,40,217,0.25)",
        }}
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {/* Footer */}
      <p className="text-center text-[0.78rem] text-gray-400 mt-4" style={{ fontWeight: 400 }}>
        Don&apos;t have an account?{" "}
        <span className="text-[#7c3aed] underline" style={{ fontWeight: 500 }}>Contact support</span>
      </p>
    </form>
  );
}
