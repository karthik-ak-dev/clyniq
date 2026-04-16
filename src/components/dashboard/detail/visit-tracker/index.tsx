"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Visit } from "@/lib/db/types";
import { VISIT_TYPE_LABELS } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils/format-helpers";
import { VisitDetail } from "./visit-detail";
import { AddVisitForm } from "./add-visit-form";

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
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedId(v.id)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                      isSelected ? "bg-primary-subtle" : "hover:bg-surface"
                    }`}
                  >
                    <div className="flex flex-col items-center self-stretch">
                      <div className={`size-3 shrink-0 rounded-full ${isSelected ? "bg-primary" : "bg-border"}`} />
                      {i < initialVisits.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-md font-medium ${isSelected ? "text-black" : "text-dark-grey"}`}>{formatDateShort(v.visitDate)}</p>
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
