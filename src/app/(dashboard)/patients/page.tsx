"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PatientCard } from "@/components/dashboard/patient-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { apiFetch } from "@/lib/api-client";
import type { Trend } from "@/lib/db/types";

type PatientRow = {
  patient: { id: string; name: string; phone: string; createdAt: string };
  doctorPatient: { id: string; condition: string; magicToken: string };
  compliance: {
    score: { overall: number };
    trend: Trend;
    insights: string[];
  };
};

export default function DashboardPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  useEffect(() => {
    async function fetchPatients() {
      try {
        const data = await apiFetch<PatientRow[]>("/api/patients");
        if (data) setPatients(data);
      } catch { /* empty state */ }
      finally { setLoading(false); }
    }
    fetchPatients();
  }, []);

  const filtered = patients.filter((row) => {
    const matchesCondition = conditionFilter === "all" || row.doctorPatient.condition === conditionFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "on-track" && row.compliance.score.overall >= 70) ||
      (statusFilter === "moderate" && row.compliance.score.overall >= 40 && row.compliance.score.overall < 70) ||
      (statusFilter === "high-risk" && row.compliance.score.overall < 40);
    const matchesSearch =
      !search ||
      row.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      row.patient.phone.includes(search);
    return matchesCondition && matchesStatus && matchesSearch;
  });

  const totalPages = 1;

  return (
    <div>
      {/* Page header — title + avatar */}
      <PageHeader title="Patients" />

      {/* Main card — 3D raised */}
      <div
        style={{
          paddingBottom: "2px",
          background: "linear-gradient(180deg, #d4cce4 0%, #cdc4de 100%)",
          borderRadius: "1rem",
          boxShadow: "0 8px 28px rgba(124,58,237,0.07), 0 2px 4px rgba(0,0,0,0.03)",
        }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: "#f0ecfa" }}>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 px-5 py-4">
            {/* Search — 3D embossed */}
            <div className="flex-1">
              <div
                style={{
                  padding: "1px 1px 3px 1px",
                  background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
                  borderRadius: "0.85rem",
                  boxShadow: "0 2px 4px rgba(124,58,237,0.06)",
                }}
              >
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#8e8aa0" strokeWidth="1.5" strokeLinecap="round">
                    <circle cx="7" cy="7" r="5" />
                    <path d="M11 11l3.5 3.5" />
                  </svg>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-[0.85rem] outline-none transition-all"
                    style={{ fontWeight: 400, color: "#2d2b3d", background: "#f8f6ff" }}
                    placeholder="Search patients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={(e) => { e.currentTarget.style.background = "#fbfaff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.08)"; }}
                    onBlur={(e) => { e.currentTarget.style.background = "#f8f6ff"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
            </div>

            {/* Filter dropdowns — 3D embossed */}
            <div className="flex gap-2.5">
              {[
                { value: statusFilter, onChange: setStatusFilter, options: [["all", "All Statuses"], ["on-track", "On Track"], ["moderate", "Moderate"], ["high-risk", "High Risk"]] },
                { value: conditionFilter, onChange: setConditionFilter, options: [["all", "All Conditions"], ["diabetes", "Diabetes"], ["obesity", "Obesity"]] },
              ].map((dd, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "1px 1px 3px 1px",
                    background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
                    borderRadius: "0.85rem",
                    boxShadow: "0 2px 4px rgba(124,58,237,0.06)",
                  }}
                >
                  <select
                    value={dd.value}
                    onChange={(e) => dd.onChange(e.target.value)}
                    className="outline-none cursor-pointer rounded-xl py-2.5 px-3.5 text-[0.85rem] transition-all"
                    style={{
                      fontWeight: 600,
                      color: "#2d2b3d",
                      background: "#f8f6ff",
                      appearance: "none",
                      paddingRight: "2.25rem",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath d='M2.5 4l2.5 2.5 2.5-2.5' stroke='%238e8aa0' fill='none' stroke-width='1.5'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                    }}
                  >
                    {dd.options.map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-24" style={{ color: "#8e8aa0", fontWeight: 400 }}>
              <p className="text-[0.92rem]">Loading patients...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "#ebe6f8" }}
              >
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#8e8aa0" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="12" cy="10" r="5" />
                  <path d="M3 26c0-5.5 4-9 9-9" />
                  <line x1="21" y1="17" x2="21" y2="27" />
                  <line x1="16" y1="22" x2="26" y2="22" />
                </svg>
              </div>
              <p className="text-[0.95rem] mb-1.5" style={{ fontWeight: 600, color: "#2d2b3d" }}>
                {patients.length === 0 ? "No patients yet" : "No results found"}
              </p>
              <p className="text-[0.82rem] mb-5" style={{ fontWeight: 400, color: "#8e8aa0" }}>
                {patients.length === 0
                  ? "Add your first patient to start tracking their compliance"
                  : "Try adjusting your search or filters"}
              </p>
              {patients.length === 0 && (
                <div className="inline-block" style={{
                  paddingBottom: "3px",
                  background: "linear-gradient(135deg, #6d28d9, #5b21b6)",
                  borderRadius: "0.85rem",
                  boxShadow: "0 4px 12px rgba(109,40,217,0.3)",
                }}>
                  <Link
                    href="/patients/add"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[0.84rem] text-white"
                    style={{ fontWeight: 600, background: "linear-gradient(135deg, #a78bfa, #8b5cf6)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                      <line x1="7" y1="2" x2="7" y2="12" />
                      <line x1="2" y1="7" x2="12" y2="7" />
                    </svg>
                    Add Patient
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Table — 3D raised on card surface */
            <div className="mx-5 mb-4">
              <div
                style={{
                  padding: "1px 1px 3px 1px",
                  background: "linear-gradient(180deg, #cdc4de, #c2b8d6)",
                  borderRadius: "0.75rem",
                  boxShadow: "0 3px 10px rgba(124,58,237,0.06)",
                }}
              >
               <div className="rounded-xl overflow-hidden" style={{ background: "#f6f3fc" }}>
              {/* Table header */}
              <div
                className="hidden sm:flex items-center gap-4 px-5 py-3 text-[0.78rem] tracking-wide uppercase"
                style={{ fontWeight: 600, color: "#a8a2bc", background: "#eee9f8", boxShadow: "0 1px 0 rgba(124,58,237,0.06)", letterSpacing: "0.04em" }}
              >
                <div className="w-10 shrink-0" />
                <div className="flex-1" style={{ minWidth: "180px" }}>Name</div>
                <div className="shrink-0 hidden sm:block" style={{ minWidth: "110px" }}>Status</div>
                <div className="shrink-0 hidden sm:block" style={{ minWidth: "60px" }}>Score</div>
                <div className="shrink-0 hidden md:block" style={{ minWidth: "90px" }}>Condition</div>
                <div className="shrink-0 hidden lg:block" style={{ minWidth: "110px" }}>Last Check-In</div>
                <div className="shrink-0" style={{ minWidth: "24px" }} />
              </div>

              {/* Rows */}
              {filtered.map((row) => (
                <PatientCard
                  key={row.doctorPatient.id}
                  doctorPatientId={row.doctorPatient.id}
                  name={row.patient.name}
                  phone={row.patient.phone}
                  condition={row.doctorPatient.condition}
                  complianceOverall={row.compliance.score.overall}
                  trend={row.compliance.trend}
                  lastCheckIn={null}
                />
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-end gap-3 px-5 py-3.5"
                  style={{ borderTop: "1px solid #e0daf0" }}
                >
                  <span className="text-[0.78rem]" style={{ fontWeight: 400, color: "#8e8aa0" }}>
                    1–{filtered.length} of {filtered.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="px-3.5 py-1.5 rounded-lg text-[0.78rem]"
                      style={{ fontWeight: 500, color: "#b8b3cc", background: "#eae5f6", cursor: "not-allowed", opacity: 0.6 }}
                      disabled
                    >
                      Previous
                    </button>
                    <button
                      className="px-3.5 py-1.5 rounded-lg text-[0.78rem] transition-all hover:bg-[#e4def4]"
                      style={{ fontWeight: 500, color: "#7c3aed", background: "#f0ecfa" }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Result count */}
              {totalPages <= 1 && filtered.length > 0 && (
                <div className="px-5 py-2.5" style={{ borderTop: "1px solid #e0daf0" }}>
                  <span className="text-[0.76rem]" style={{ fontWeight: 400, color: "#a8a2bc" }}>
                    {filtered.length} {filtered.length === 1 ? "patient" : "patients"}
                  </span>
                </div>
              )}
               </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
