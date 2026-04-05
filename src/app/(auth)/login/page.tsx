import { LoginForm } from "@/components/forms/login-form";
import { AssetPlaceholder } from "@/components/ui/asset-placeholder";

// ─── Login Page ────────────────────────────────────────────
// Matched to design/doc_flow/login.png:
//   - Centered card (~400px max-width)
//   - Logo icon + app name at top
//   - "Welcome Back" heading
//   - Login form (email + password)
//   - Light background (from auth layout)

export default function LoginPage() {
  return (
    <div className="card w-full max-w-sm p-8">
      {/* Logo + App name */}
      <div className="flex flex-col items-center mb-6">
        <AssetPlaceholder width={48} height={48} className="mb-3" />
        <span className="text-xl font-800 text-[#7c3aed]">Clyniq</span>
        <span className="text-xs text-gray-400 font-medium">Doctor Portal</span>
      </div>

      {/* Heading */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-800 text-gray-900">Welcome Back</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
      </div>

      {/* Form */}
      <LoginForm />
    </div>
  );
}
