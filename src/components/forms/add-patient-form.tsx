"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Add Patient Form ──────────────────────────────────────
// Polished form with layered inputs and 3D button.

export function AddPatientForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [condition, setCondition] = useState<"diabetes" | "obesity">("diabetes");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLink, setMagicLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}`;

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone: formattedPhone, condition }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Failed to create patient");
        setLoading(false);
        return;
      }

      setMagicLink(`${window.location.origin}/p/${json.data.doctorPatient.magicToken}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "white",
    border: "1.5px solid rgba(139,92,246,0.12)",
    boxShadow: "0 2px 0 rgba(139,92,246,0.04)",
    borderRadius: "0.875rem",
    padding: "0.8rem 1rem",
    fontSize: "0.925rem",
    fontWeight: 500,
    color: "#1f2937",
    outline: "none",
    width: "100%",
  };

  // ─── Success ───────────────────────────────────────────
  if (magicLink) {
    return (
      <div className="space-y-5">
        <div className="text-center py-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#ecfdf5", boxShadow: "0 2px 8px rgba(5,150,105,0.15)" }}
          >
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-xl font-800 text-gray-900">Patient Created!</h2>
          <p className="text-[0.875rem] text-gray-400 font-500 mt-1">
            Share this link with {name} for daily check-ins
          </p>
        </div>

        <div className="flex gap-2">
          <input
            readOnly
            value={magicLink}
            className="flex-1 px-3.5 py-2.5 rounded-xl text-[0.8rem] font-500 text-gray-500 bg-gray-50 outline-none truncate"
            style={{ border: "1.5px solid rgba(139,92,246,0.08)" }}
          />
          <button
            onClick={() => navigator.clipboard.writeText(magicLink)}
            className="px-4 py-2.5 rounded-xl text-[0.8rem] font-700 text-[#7c3aed] shrink-0"
            style={{ background: "white", border: "1.5px solid rgba(139,92,246,0.15)", boxShadow: "0 1px 0 rgba(139,92,246,0.04)" }}
          >
            Copy
          </button>
        </div>

        <div
          className="rounded-xl"
          style={{ paddingBottom: "4px", background: "linear-gradient(135deg, #6d28d9, #5b21b6)", boxShadow: "0 4px 12px rgba(109,40,217,0.3)" }}
        >
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 rounded-xl text-[0.95rem] font-700 text-white"
            style={{ background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 40%, #7c3aed 100%)" }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-[0.825rem] font-700 text-gray-600 mb-1.5">Full Name</label>
        <input type="text" style={inputStyle} placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label className="block text-[0.825rem] font-700 text-gray-600 mb-1.5">Phone Number</label>
        <div className="flex gap-2">
          <div
            className="flex items-center justify-center px-3.5 rounded-[0.875rem] text-[0.85rem] font-600 text-gray-500 shrink-0"
            style={{ background: "#f9fafb", border: "1.5px solid rgba(139,92,246,0.12)", boxShadow: "0 2px 0 rgba(139,92,246,0.04)" }}
          >
            +91
          </div>
          <input type="tel" style={inputStyle} placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="block text-[0.825rem] font-700 text-gray-600 mb-2">Condition</label>
        <div className="space-y-2">
          {(["diabetes", "obesity"] as const).map((c) => {
            const isSelected = condition === c;
            return (
              <label
                key={c}
                className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all"
                style={{
                  background: isSelected ? "rgba(139,92,246,0.04)" : "white",
                  border: `1.5px solid ${isSelected ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.08)"}`,
                  boxShadow: isSelected ? "0 2px 0 rgba(139,92,246,0.08), 0 0 0 3px rgba(139,92,246,0.04)" : "0 2px 0 rgba(139,92,246,0.04)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ border: `2px solid ${isSelected ? "#7c3aed" : "#d1d5db"}` }}
                >
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />}
                </div>
                <span className="font-700 text-[0.925rem] text-gray-700 capitalize">{c}</span>
                <input type="radio" name="condition" value={c} checked={isSelected} onChange={() => setCondition(c)} className="hidden" />
              </label>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="px-4 py-2.5 rounded-xl text-[0.85rem] font-600 text-red-600 text-center" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      <div
        className="rounded-xl"
        style={{ paddingBottom: "4px", background: "linear-gradient(135deg, #6d28d9, #5b21b6)", boxShadow: "0 4px 12px rgba(109,40,217,0.3)" }}
      >
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-[0.95rem] font-700 text-white transition-transform active:scale-[0.98] disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 40%, #7c3aed 100%)" }}
        >
          {loading ? "Creating..." : "Create Patient"}
        </button>
      </div>

      <p className="text-[0.8rem] text-gray-400 text-center font-500">
        A tracking link will be generated for the patient
      </p>
    </form>
  );
}
