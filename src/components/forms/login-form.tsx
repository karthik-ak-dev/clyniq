"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── Login Form ────────────────────────────────────────────
// Email/password form with NextAuth signIn().
// Matched to design/doc_flow/login.png:
//   - Email + password inputs with icons
//   - Password show/hide toggle
//   - Purple "Sign In" button
//   - Error display below button

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
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {/* Email */}
      <div>
        <label className="input-label">Email</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            ✉
          </span>
          <input
            type="email"
            className="input-field pl-9"
            placeholder="doctor@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="input-label">Password</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            🔒
          </span>
          <input
            type={showPassword ? "text" : "password"}
            className="input-field pl-9 pr-12"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium hover:text-gray-600"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Forgot password (non-functional in MVP) */}
      <div className="text-right">
        <span className="text-xs text-[#7c3aed] font-medium cursor-default">
          Forgot password?
        </span>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm text-center font-medium">{error}</p>
      )}

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Signing in..." : "Sign In"}
      </button>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400">
        Don&apos;t have an account?{" "}
        <span className="text-[#7c3aed] font-medium">Contact support</span>
      </p>
    </form>
  );
}
