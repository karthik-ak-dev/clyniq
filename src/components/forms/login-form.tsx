"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

    router.push("/patients");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
      {/* Email */}
      <div>
        <label className="text-md font-medium text-black mb-1.5 block">Email</label>
        <input
          type="email"
          className="h-11 w-full rounded-lg bg-surface px-3 text-md text-black outline-none focus:ring-1 focus:ring-primary"
          placeholder="doctor@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="text-md font-medium text-black mb-1.5 block">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="h-11 w-full rounded-lg bg-surface px-3 pr-16 text-md text-black outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base font-medium text-primary"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-subtle px-3 py-2.5 text-md font-medium text-red text-center">
          {error}
        </div>
      )}

      {/* Sign In */}
      <button
        type="submit"
        disabled={loading}
        className="mt-1 h-11 w-full rounded-lg bg-primary text-md font-medium text-white transition-colors hover:bg-primary-dark active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
