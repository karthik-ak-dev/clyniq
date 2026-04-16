"use client";

import { useState } from "react";
import type { Vitals } from "@/lib/db/types";

export function AddVisitForm({ doctorPatientId, onClose, onAdded }: {
  doctorPatientId: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    visitType: "checkup",
    notes: "",
    prescription: "",
    diagnosis: "",
    bp: "",
    weight: "",
    bloodSugar: "",
    nextVisitDate: "",
  });

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const vitals: Vitals = {};
      if (form.bp) vitals.bp = form.bp;
      if (form.weight) vitals.weight = parseFloat(form.weight);
      if (form.bloodSugar) vitals.bloodSugar = parseFloat(form.bloodSugar);

      const res = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorPatientId,
          visitDate: form.visitDate,
          visitType: form.visitType,
          notes: form.notes,
          prescription: form.prescription,
          diagnosis: form.diagnosis,
          vitals: Object.keys(vitals).length > 0 ? vitals : undefined,
          nextVisitDate: form.nextVisitDate || undefined,
        }),
      });

      if (!res.ok) {
        const r = await res.json();
        setError(r.error || "Failed to create visit");
        return;
      }

      onAdded();
      onClose();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl font-bold text-black tracking-tighter">Add Visit</h3>
          <button onClick={onClose} className="flex size-8 items-center justify-center rounded-md bg-surface text-dark-grey hover:text-black transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-md font-medium text-black mb-1.5 block">Visit Date *</label>
              <input type="date" value={form.visitDate} onChange={(e) => update("visitDate", e.target.value)}
                className="h-11 w-full rounded-lg bg-surface px-3 text-md text-black outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div>
              <label className="text-md font-medium text-black mb-1.5 block">Visit Type *</label>
              <select value={form.visitType} onChange={(e) => update("visitType", e.target.value)}
                className="h-11 w-full rounded-lg bg-surface px-3 text-md text-black outline-none focus:ring-1 focus:ring-primary appearance-none">
                <option value="checkup">Regular Checkup</option>
                <option value="followup">Follow-up</option>
                <option value="initial">Initial Consultation</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Diagnosis</label>
            <textarea value={form.diagnosis} onChange={(e) => update("diagnosis", e.target.value)}
              placeholder="Findings, observations, diagnosis..."
              rows={2} className="w-full rounded-lg bg-surface px-3 py-3 text-md text-black placeholder:text-dark-grey outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Doctor Notes</label>
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)}
              placeholder="Notes from the consultation..."
              rows={3} className="w-full rounded-lg bg-surface px-3 py-3 text-md text-black placeholder:text-dark-grey outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Prescription</label>
            <textarea value={form.prescription} onChange={(e) => update("prescription", e.target.value)}
              placeholder="Medications prescribed or changed..."
              rows={2} className="w-full rounded-lg bg-surface px-3 py-3 text-md text-black placeholder:text-dark-grey outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Vitals Recorded</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5">
                <span className="text-base text-dark-grey shrink-0">BP</span>
                <input type="text" value={form.bp} onChange={(e) => update("bp", e.target.value)}
                  placeholder="120/80" className="w-full bg-transparent text-md text-black outline-none" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5">
                <span className="text-base text-dark-grey shrink-0">Wt</span>
                <input type="text" value={form.weight} onChange={(e) => update("weight", e.target.value)}
                  placeholder="kg" className="w-full bg-transparent text-md text-black outline-none" />
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5">
                <span className="text-base text-dark-grey shrink-0">BS</span>
                <input type="text" value={form.bloodSugar} onChange={(e) => update("bloodSugar", e.target.value)}
                  placeholder="mg/dL" className="w-full bg-transparent text-md text-black outline-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Next Visit Date</label>
            <input type="date" value={form.nextVisitDate} onChange={(e) => update("nextVisitDate", e.target.value)}
              className="h-11 w-full rounded-lg bg-surface px-3 text-md text-black outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {error && <p className="text-md text-red">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="h-10 rounded-md border border-border bg-white px-5 text-md font-medium text-black hover:bg-surface transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="h-10 rounded-md bg-primary px-5 text-md font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50">
              {submitting ? "Saving..." : "Save Visit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
