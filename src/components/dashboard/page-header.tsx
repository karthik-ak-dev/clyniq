"use client";

import { useSession } from "next-auth/react";

export function PageHeader({ title }: { title: string }) {
  const { data: session } = useSession();
  const doctorName = session?.user?.name || "Doctor";
  const initials = doctorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between mb-5">
      <h1 className="text-[1.5rem]" style={{ fontWeight: 600, color: "#2d2b3d" }}>{title}</h1>
      <div
        style={{
          paddingBottom: "2px",
          background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
          borderRadius: "9999px",
          boxShadow: "0 3px 10px rgba(124,58,237,0.25)",
        }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
        >
          <span className="text-white text-[0.72rem]" style={{ fontWeight: 600 }}>{initials}</span>
        </div>
      </div>
    </div>
  );
}
