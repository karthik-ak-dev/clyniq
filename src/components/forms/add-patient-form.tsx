"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// 3D wrapper for inputs — consistent with patient list search/filter style
const inputWrapper = {
  padding: "1px 1px 3px 1px",
  background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
  borderRadius: "0.75rem",
  boxShadow: "0 2px 4px rgba(124,58,237,0.06)",
};

// Dropdown chevron SVG (shared across all selects)
const chevronBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2.5 4l2.5 2.5 2.5-2.5' stroke='%238e8aa0' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`;

export function AddPatientForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [condition, setCondition] = useState("");
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLink, setMagicLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition) { setError("Please select a condition"); return; }
    setError("");
    setLoading(true);

    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/\D/g, "")}`;

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone: formattedPhone,
          condition,
          email: email || undefined,
          age: age ? parseInt(age) : undefined,
          gender: gender || undefined,
          status: status || undefined,
          notes: notes || undefined,
        }),
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

  const canSubmit = name.trim() && phone.trim() && condition;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.background = "#fbfaff";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.background = "#f8f6ff";
    e.currentTarget.style.boxShadow = "none";
  };

  // ─── Success State ────────────────────────────────────────
  if (magicLink) {
    return (
      <div className="px-6 py-10 sm:px-10">
        <div className="max-w-md mx-auto text-center">
          {/* Success icon — 3D */}
          <div className="inline-block mb-5" style={{
            paddingBottom: "2px",
            background: "linear-gradient(180deg, rgba(22,163,74,0.2), rgba(22,163,74,0.3))",
            borderRadius: "1rem",
          }}>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(22,163,74,0.08)" }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="14" cy="14" r="11" />
                <path d="M9 14.5l3.5 3.5L19 11" />
              </svg>
            </div>
          </div>

          <h2 className="text-[1.25rem] mb-1" style={{ fontWeight: 600, color: "#2d2b3d" }}>Patient Created</h2>
          <p className="text-[0.9rem] mb-6" style={{ fontWeight: 400, color: "#8e8aa0" }}>
            Share this link with {name} for daily check-ins
          </p>

          {/* Magic link — 3D inset */}
          <div className="mb-6" style={inputWrapper}>
            <div
              className="flex items-center gap-2 p-1.5 rounded-xl"
              style={{ background: "#f8f6ff" }}
            >
              <input
                readOnly
                value={magicLink}
                className="flex-1 px-3 py-2 text-[0.9rem] bg-transparent outline-none truncate"
                style={{ fontWeight: 400, color: "#5a5773" }}
              />
              {/* Copy button — 3D */}
              <div style={{
                paddingBottom: "2px",
                background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
                borderRadius: "0.5rem",
              }}>
                <button
                  onClick={() => navigator.clipboard.writeText(magicLink)}
                  className="shrink-0 px-4 py-2 rounded-lg text-[0.9rem] text-white transition-all active:scale-[0.97]"
                  style={{ fontWeight: 600, background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Add Another — 3D outline */}
            <div className="flex-1" style={{
              padding: "1px 1px 3px 1px",
              background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
              borderRadius: "0.75rem",
            }}>
              <button
                onClick={() => {
                  setMagicLink("");
                  setName(""); setAge(""); setGender(""); setCondition("");
                  setStatus("new"); setNotes(""); setPhone(""); setEmail("");
                }}
                className="w-full py-2.5 rounded-xl text-[0.9rem] transition-all active:scale-[0.98]"
                style={{ fontWeight: 600, color: "#7c3aed", background: "#f6f3fc" }}
              >
                Add Another
              </button>
            </div>
            {/* Go to Patients — 3D purple */}
            <div className="flex-1" style={{
              paddingBottom: "3px",
              background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
              borderRadius: "0.75rem",
              boxShadow: "0 4px 12px rgba(109,40,217,0.25)",
            }}>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-2.5 rounded-xl text-[0.9rem] text-white transition-all active:scale-[0.98]"
                style={{ fontWeight: 600, background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
              >
                Go to Patients
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit}>

      {/* Section: Personal Information */}
      <div className="px-6 pt-6 pb-5 sm:px-8" style={{ borderBottom: "1px solid #e0daf0" }}>
        <h3 className="text-[1.05rem] mb-5" style={{ fontWeight: 600, color: "#2d2b3d" }}>
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
          {/* Full Name — 3 cols */}
          <div className="sm:col-span-3">
            <label className="block text-[0.85rem] mb-1.5" style={{ fontWeight: 500, color: "#5a5773" }}>Full Name</label>
            <div style={inputWrapper}>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#b0aac2" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="8" cy="5" r="3" />
                  <path d="M2.5 15c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
                </svg>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[0.92rem] outline-none transition-all"
                  style={{ fontWeight: 400, color: "#2d2b3d", background: "#f8f6ff" }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          </div>

          {/* Age — 1 col */}
          <div className="sm:col-span-1">
            <label className="block text-[0.85rem] mb-1.5" style={{ fontWeight: 500, color: "#5a5773" }}>Age</label>
            <div style={inputWrapper}>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
                min={1}
                max={150}
                className="w-full px-4 py-2.5 rounded-xl text-[0.92rem] outline-none transition-all"
                style={{ fontWeight: 400, color: "#2d2b3d", background: "#f8f6ff" }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>

          {/* Gender — 2 cols */}
          <div className="sm:col-span-2">
            <label className="block text-[0.85rem] mb-1.5" style={{ fontWeight: 500, color: "#5a5773" }}>Gender</label>
            <div style={inputWrapper}>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-[0.92rem] outline-none cursor-pointer transition-all"
                style={{
                  fontWeight: 400,
                  color: gender ? "#2d2b3d" : "#8e8aa0",
                  background: "#f8f6ff",
                  appearance: "none",
                  paddingRight: "2.5rem",
                  backgroundImage: chevronBg,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Medical Details */}
      <div className="px-6 pt-5 pb-5 sm:px-8" style={{ borderBottom: "1px solid #e0daf0" }}>
        <h3 className="text-[1.05rem] mb-5" style={{ fontWeight: 600, color: "#2d2b3d" }}>
          Medical Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[0.85rem] mb-1.5" style={{ fontWeight: 500, color: "#5a5773" }}>Condition</label>
            <div style={inputWrapper}>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl text-[0.92rem] outline-none cursor-pointer transition-all"
                style={{
                  fontWeight: 400,
                  color: condition ? "#2d2b3d" : "#8e8aa0",
                  background: "#f8f6ff",
                  appearance: "none",
                  paddingRight: "2.5rem",
                  backgroundImage: chevronBg,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="">Select condition</option>
                <option value="diabetes">Diabetes</option>
                <option value="obesity">Obesity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[0.85rem] mb-1.5" style={{ fontWeight: 500, color: "#5a5773" }}>Status</label>
            <div style={inputWrapper}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-[0.92rem] outline-none cursor-pointer transition-all"
                style={{
                  fontWeight: 400,
                  color: "#2d2b3d",
                  background: "#f8f6ff",
                  appearance: "none",
                  paddingRight: "2.5rem",
                  backgroundImage: chevronBg,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 0.75rem center",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="new">New</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Notes */}
      <div className="px-6 pt-5 pb-5 sm:px-8" style={{ borderBottom: "1px solid #e0daf0" }}>
        <h3 className="text-[1.05rem] mb-5" style={{ fontWeight: 600, color: "#2d2b3d" }}>
          Notes
        </h3>
        <div style={inputWrapper}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes here..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl text-[0.92rem] outline-none transition-all resize-none"
            style={{ fontWeight: 400, color: "#2d2b3d", background: "#f8f6ff" }}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>

      {/* Section: Additional Information */}
      <div className="px-6 pt-5 pb-5 sm:px-8" style={{ borderBottom: "1px solid #e0daf0" }}>
        <h3 className="text-[1.05rem] mb-5" style={{ fontWeight: 600, color: "#2d2b3d" }}>
          Additional Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label className="block text-[0.85rem] mb-1.5" style={{ fontWeight: 500, color: "#5a5773" }}>Phone Number</label>
            <div style={inputWrapper}>
              <div className="flex rounded-xl overflow-hidden" style={{ background: "#f8f6ff" }}>
                <div
                  className="flex items-center justify-center px-3.5 text-[0.92rem] shrink-0"
                  style={{
                    fontWeight: 600,
                    color: "#5a5773",
                    background: "#eae5f6",
                    borderRight: "1px solid #ddd6ee",
                  }}
                >
                  +91
                </div>
                <div className="relative flex-1">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="#b0aac2" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M3 2.5h2.5L7 5.5 5.25 7.25a10.5 10.5 0 0 0 3.5 3.5L10.5 9l3 1.5V13a1.5 1.5 0 0 1-1.5 1.5A11.5 11.5 0 0 1 1.5 4 1.5 1.5 0 0 1 3 2.5" />
                  </svg>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-[0.92rem] outline-none transition-all"
                    style={{ fontWeight: 400, color: "#2d2b3d", background: "transparent" }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[0.85rem] mb-1.5" style={{ fontWeight: 500, color: "#5a5773" }}>Email Address</label>
            <div style={inputWrapper}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full px-4 py-2.5 rounded-xl text-[0.92rem] outline-none transition-all"
                style={{ fontWeight: 400, color: "#2d2b3d", background: "#f8f6ff" }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 sm:mx-8">
          <div
            className="px-4 py-2.5 rounded-xl text-[0.9rem] text-center"
            style={{ fontWeight: 500, color: "#dc2626", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.12)" }}
          >
            {error}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 sm:px-8">
        {/* Cancel — 3D outline */}
        <div style={{
          padding: "1px 1px 3px 1px",
          background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
          borderRadius: "0.75rem",
        }}>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-[0.9rem] transition-all active:scale-[0.98]"
            style={{ fontWeight: 600, color: "#5a5773", background: "#f6f3fc" }}
          >
            Cancel
          </button>
        </div>

        {/* Save Patient — 3D purple */}
        <div style={{
          paddingBottom: "3px",
          background: canSubmit ? "linear-gradient(135deg, #6d28d9, #5b21b6)" : "linear-gradient(135deg, #a8a0bc, #9990ad)",
          borderRadius: "0.75rem",
          boxShadow: canSubmit ? "0 4px 12px rgba(109,40,217,0.25)" : "none",
          transition: "all 0.2s",
        }}>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="px-6 py-2.5 rounded-xl text-[0.9rem] text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed"
            style={{
              fontWeight: 600,
              background: canSubmit
                ? "linear-gradient(135deg, #a78bfa, #8b5cf6)"
                : "linear-gradient(135deg, #c4bdd5, #b8b0cb)",
            }}
          >
            {loading ? "Creating..." : "Save Patient"}
          </button>
        </div>
      </div>
    </form>
  );
}
