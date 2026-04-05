"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ─── Add Patient Form ──────────────────────────────────────
// Matched to design/doc_flow/add_patient.png:
//   - Name, phone (+91), condition radio, template dropdown
//   - Purple "Create Patient" button
//   - On success: shows magic link

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

    // Format phone with +91 prefix
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}`;

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: formattedPhone,
          condition,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error || "Failed to create patient");
        setLoading(false);
        return;
      }

      // Show magic link
      const token = json.data.doctorPatient.magicToken;
      setMagicLink(`${window.location.origin}/p/${token}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ─── Success state — show magic link ───────────────────
  if (magicLink) {
    return (
      <div className="space-y-5">
        <div className="text-center">
          <span className="text-4xl">✅</span>
          <h2 className="text-xl font-700 text-gray-900 mt-3">Patient Created!</h2>
          <p className="text-sm text-gray-500 mt-1">
            Share this link with {name} for daily check-ins
          </p>
        </div>

        <div className="flex gap-2">
          <input
            readOnly
            value={magicLink}
            className="input-field text-xs flex-1 bg-gray-50"
          />
          <button
            onClick={() => {
              navigator.clipboard.writeText(magicLink);
            }}
            className="btn-outline text-xs shrink-0"
          >
            Copy
          </button>
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="btn-primary"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // ─── Form ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name */}
      <div>
        <label className="input-label">Full Name</label>
        <input
          type="text"
          className="input-field"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="input-label">Phone Number</label>
        <div className="flex gap-2">
          <span className="input-field w-16 text-center text-sm text-gray-500 shrink-0 flex items-center justify-center">
            +91
          </span>
          <input
            type="tel"
            className="input-field flex-1"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="input-label">Condition</label>
        <div className="space-y-2 mt-1">
          {(["diabetes", "obesity"] as const).map((c) => (
            <label
              key={c}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                condition === c
                  ? "border-[#7c3aed] bg-[#faf5ff]"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  condition === c ? "border-[#7c3aed]" : "border-gray-300"
                }`}
              >
                {condition === c && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
                )}
              </div>
              <span className="font-600 text-gray-700 capitalize">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Creating..." : "Create Patient"}
      </button>

      <p className="text-xs text-gray-400 text-center">
        A tracking link will be generated for the patient
      </p>
    </form>
  );
}
