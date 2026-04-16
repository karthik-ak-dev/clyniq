"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Visit } from "@/lib/db/types";

const VISIT_TYPE_LABELS: Record<string, string> = {
  initial: "Initial Consultation",
  checkup: "Regular Checkup",
  followup: "Follow-up",
  emergency: "Emergency",
};

const VISIT_TYPE_COLORS: Record<string, string> = {
  initial: "bg-primary-light text-primary-dark",
  checkup: "bg-primary-light text-primary-dark",
  followup: "bg-yellow-subtle text-yellow",
  emergency: "bg-red-subtle text-red",
};

type Vitals = {
  bp?: string;
  weight?: number;
  bloodSugar?: number;
  temperature?: number;
};

// ─── Add Visit Form ──────────────────────────────────────
function AddVisitForm({ doctorPatientId, onClose, onAdded }: {
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
          {/* Date + Type */}
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

          {/* Diagnosis */}
          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Diagnosis</label>
            <textarea value={form.diagnosis} onChange={(e) => update("diagnosis", e.target.value)}
              placeholder="Findings, observations, diagnosis..."
              rows={2} className="w-full rounded-lg bg-surface px-3 py-3 text-md text-black placeholder:text-dark-grey outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {/* Notes */}
          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Doctor Notes</label>
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)}
              placeholder="Notes from the consultation..."
              rows={3} className="w-full rounded-lg bg-surface px-3 py-3 text-md text-black placeholder:text-dark-grey outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {/* Prescription */}
          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Prescription</label>
            <textarea value={form.prescription} onChange={(e) => update("prescription", e.target.value)}
              placeholder="Medications prescribed or changed..."
              rows={2} className="w-full rounded-lg bg-surface px-3 py-3 text-md text-black placeholder:text-dark-grey outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {/* Vitals */}
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

          {/* Next Visit */}
          <div>
            <label className="text-md font-medium text-black mb-1.5 block">Next Visit Date</label>
            <input type="date" value={form.nextVisitDate} onChange={(e) => update("nextVisitDate", e.target.value)}
              className="h-11 w-full rounded-lg bg-surface px-3 text-md text-black outline-none focus:ring-1 focus:ring-primary" />
          </div>

          {error && <p className="text-md text-red">{error}</p>}

          {/* Actions */}
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

// ─── Visit Detail Panel ──────────────────────────────────
function VisitDetail({ visit }: { visit: Visit }) {
  const vitals = visit.vitals as Vitals | null;

  return (
    <div className="flex flex-col gap-4">
      {/* Visit type + date header */}
      <div className="flex items-center gap-2">
        <span className={`rounded-md px-2.5 py-1 text-base font-medium ${VISIT_TYPE_COLORS[visit.visitType] || "bg-surface text-dark-grey"}`}>
          {VISIT_TYPE_LABELS[visit.visitType] || visit.visitType}
        </span>
        <span className="text-base text-dark-grey">
          {new Date(visit.visitDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </span>
      </div>

      {/* Diagnosis */}
      {visit.diagnosis && (
        <div>
          <p className="text-base font-semibold text-dark-grey mb-1">Diagnosis</p>
          <p className="text-md text-black leading-normal whitespace-pre-wrap">{visit.diagnosis}</p>
        </div>
      )}

      {/* Notes */}
      {visit.notes && (
        <div>
          <p className="text-base font-semibold text-dark-grey mb-1">Doctor Notes</p>
          <p className="text-md text-black leading-normal whitespace-pre-wrap">{visit.notes}</p>
        </div>
      )}

      {/* Prescription */}
      {visit.prescription && (
        <div>
          <p className="text-base font-semibold text-dark-grey mb-1">Prescription</p>
          <p className="text-md text-black leading-normal whitespace-pre-wrap">{visit.prescription}</p>
        </div>
      )}

      {/* Vitals */}
      {vitals && Object.keys(vitals).length > 0 && (
        <div>
          <p className="text-base font-semibold text-dark-grey mb-2">Vitals Recorded</p>
          <div className="flex flex-wrap gap-3">
            {vitals.bp && (
              <div className="rounded-lg bg-surface px-3 py-2">
                <p className="text-base text-dark-grey">Blood Pressure</p>
                <p className="text-md font-bold text-black">{vitals.bp}</p>
              </div>
            )}
            {vitals.weight && (
              <div className="rounded-lg bg-surface px-3 py-2">
                <p className="text-base text-dark-grey">Weight</p>
                <p className="text-md font-bold text-black">{vitals.weight} kg</p>
              </div>
            )}
            {vitals.bloodSugar && (
              <div className="rounded-lg bg-surface px-3 py-2">
                <p className="text-base text-dark-grey">Blood Sugar</p>
                <p className="text-md font-bold text-black">{vitals.bloodSugar} mg/dL</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Next visit */}
      {visit.nextVisitDate && (
        <div className="flex items-center gap-2 rounded-lg bg-primary-subtle px-3 py-2.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.083 2.333H2.917c-.645 0-1.167.523-1.167 1.167v7c0 .644.522 1.167 1.167 1.167h8.166c.645 0 1.167-.523 1.167-1.167v-7c0-.644-.522-1.167-1.167-1.167ZM9.333 1.167v2.333M4.667 1.167v2.333M1.75 5.833h10.5" stroke="#35BFA3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-md text-primary-dark">
            Next visit: {new Date(visit.nextVisitDate + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        </div>
      )}

      {/* Empty state for no details */}
      {!visit.diagnosis && !visit.notes && !visit.prescription && (!vitals || Object.keys(vitals).length === 0) && (
        <p className="text-md text-dark-grey">No details recorded for this visit.</p>
      )}
    </div>
  );
}

// ─── Main Visit Tracker ──────────────────────────────────
export function VisitTracker({ visits: initialVisits, doctorPatientId }: {
  visits: Visit[];
  doctorPatientId: string;
}) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialVisits[0]?.id || null);

  const selectedVisit = initialVisits.find((v) => v.id === selectedId) || null;

  const handleAdded = () => {
    router.refresh();
  };

  return (
    <div className="flex h-132 flex-col rounded-xl bg-white p-5">
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h3 className="text-2xl font-bold text-black tracking-tighter">Visits</h3>
          <p className="mt-0.5 text-md text-dark-grey">{initialVisits.length} visit{initialVisits.length !== 1 ? "s" : ""} recorded</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="h-10 rounded-md bg-primary px-4 text-md font-medium text-white hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2.333v9.334M2.333 7h9.334" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Add Visit
        </button>
      </div>

      {initialVisits.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center min-h-0">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary-subtle mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM16 2v4M8 2v4M3 10h18" stroke="#35BFA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="text-lg font-medium text-black">No visits recorded yet</p>
          <p className="mt-1 text-md text-dark-grey">Record the first visit to start tracking consultations.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-0 lg:flex-row lg:gap-0 min-h-0 flex-1 overflow-hidden">
          {/* Left: Visit list */}
          <div className="w-full border-b border-border pb-4 lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r lg:pr-5 lg:pb-0 overflow-y-auto">
            <div className="flex flex-col gap-1">
              {initialVisits.map((v, i) => {
                const isSelected = v.id === selectedId;
                const date = new Date(v.visitDate + "T00:00:00");
                const formatted = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
                const dayName = date.toLocaleDateString("en", { weekday: "short" });

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedId(v.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                      isSelected ? "bg-primary-subtle" : "hover:bg-surface"
                    }`}
                  >
                    {/* Timeline dot + line */}
                    <div className="flex flex-col items-center self-stretch">
                      <div className={`size-3 shrink-0 rounded-full ${isSelected ? "bg-primary" : "bg-border"}`} />
                      {i < initialVisits.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                    </div>

                    <div className="min-w-0">
                      <p className={`text-md font-medium ${isSelected ? "text-black" : "text-dark-grey"}`}>{formatted}</p>
                      <p className="text-base text-dark-grey">{VISIT_TYPE_LABELS[v.visitType] || v.visitType}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Visit detail */}
          <div className="flex-1 pt-4 lg:pl-5 lg:pt-0 overflow-y-auto">
            {selectedVisit ? (
              <VisitDetail visit={selectedVisit} />
            ) : (
              <p className="text-md text-dark-grey">Select a visit to view details.</p>
            )}
          </div>
        </div>
      )}

      {/* Add Visit Modal */}
      {showAddForm && (
        <AddVisitForm
          doctorPatientId={doctorPatientId}
          onClose={() => setShowAddForm(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
