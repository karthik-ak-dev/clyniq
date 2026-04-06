export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "#ede9f8" }}>
        <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
          <path d="M9 1.5a7.5 7.5 0 0 1 7.5 7.5" />
        </svg>
      </div>
      <p className="text-[0.88rem]" style={{ color: "#8e8aa0", fontWeight: 500 }}>{message}</p>
    </div>
  );
}
