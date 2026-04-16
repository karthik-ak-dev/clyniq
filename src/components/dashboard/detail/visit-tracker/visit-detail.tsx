import type { Visit, Vitals } from "@/lib/db/types";
import { VISIT_TYPE_LABELS, VISIT_TYPE_COLORS } from "@/lib/constants";
import { formatDateLong } from "@/lib/utils/format-helpers";

export function VisitDetail({ visit }: { visit: Visit }) {
  const vitals = visit.vitals as Vitals | null;

  return (
    <div className="flex flex-col gap-4">
      {/* Visit type + date header */}
      <div className="flex items-center gap-2">
        <span className={`rounded-md px-2.5 py-1 text-base font-medium ${VISIT_TYPE_COLORS[visit.visitType] || "bg-surface text-dark-grey"}`}>
          {VISIT_TYPE_LABELS[visit.visitType] || visit.visitType}
        </span>
        <span className="text-base text-dark-grey">{formatDateLong(visit.visitDate)}</span>
      </div>

      {visit.diagnosis && (
        <div>
          <p className="text-base font-semibold text-dark-grey mb-1">Diagnosis</p>
          <p className="text-md text-black leading-normal whitespace-pre-wrap">{visit.diagnosis}</p>
        </div>
      )}

      {visit.notes && (
        <div>
          <p className="text-base font-semibold text-dark-grey mb-1">Doctor Notes</p>
          <p className="text-md text-black leading-normal whitespace-pre-wrap">{visit.notes}</p>
        </div>
      )}

      {visit.prescription && (
        <div>
          <p className="text-base font-semibold text-dark-grey mb-1">Prescription</p>
          <p className="text-md text-black leading-normal whitespace-pre-wrap">{visit.prescription}</p>
        </div>
      )}

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

      {visit.nextVisitDate && (
        <div className="flex items-center gap-2 rounded-lg bg-primary-subtle px-3 py-2.5">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M11.083 2.333H2.917c-.645 0-1.167.523-1.167 1.167v7c0 .644.522 1.167 1.167 1.167h8.166c.645 0 1.167-.523 1.167-1.167v-7c0-.644-.522-1.167-1.167-1.167ZM9.333 1.167v2.333M4.667 1.167v2.333M1.75 5.833h10.5" stroke="#35BFA3" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-md text-primary-dark">Next visit: {formatDateLong(visit.nextVisitDate)}</span>
        </div>
      )}

      {!visit.diagnosis && !visit.notes && !visit.prescription && (!vitals || Object.keys(vitals).length === 0) && (
        <p className="text-md text-dark-grey">No details recorded for this visit.</p>
      )}
    </div>
  );
}
