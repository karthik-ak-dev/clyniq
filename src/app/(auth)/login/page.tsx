import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Logo — above the card */}
      <div className="flex items-center gap-2.5 mb-8">
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
          <path d="M7 14L14 7L21 14L14 21L7 14Z" fill="#35BFA3"/>
          <path d="M3 14L14 3L25 14L14 25L3 14Z" stroke="#35BFA3" strokeWidth="2" fill="none"/>
        </svg>
        <span className="text-3xl font-semibold text-primary-dark tracking-logo leading-tight">DoctorRx</span>
      </div>

      {/* Card */}
      <div className="w-full rounded-xl bg-white p-6 shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-black tracking-tighter">Welcome Back</h1>
          <p className="mt-1 text-md text-dark-grey">Sign in to your account</p>
        </div>

        <LoginForm />
      </div>

      <p className="mt-5 text-center text-base text-dark-grey">
        Don&apos;t have an account?{" "}
        <span className="font-medium text-primary">Contact support</span>
      </p>
    </div>
  );
}
