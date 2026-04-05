"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PatientCard } from "@/components/dashboard/patient-card";
import type { Trend } from "@/lib/db/types";

// ─── Dashboard Page ────────────────────────────────────────
// Patient list with search, filters, and compliance overview.
// Matched to design/doc_flow/patients.png:
//   - Title "Patients" + search bar
//   - Filter pills (All, Diabetes, Obesity)
//   - Patient rows with avatar, name, condition, compliance %, trend
//   - Floating "Add Patient" button

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
  const [filter, setFilter] = useState<"all" | "diabetes" | "obesity">("all");

  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch("/api/patients");
        const json = await res.json();
        if (json.success) {
          setPatients(json.data);
        }
      } catch {
        // Silent fail — empty state shown
      } finally {
        setLoading(false);
      }
    }

    fetchPatients();
  }, []);

  // Filter + search
  const filtered = patients.filter((row) => {
    const matchesFilter =
      filter === "all" || row.doctorPatient.condition === filter;
    const matchesSearch =
      !search ||
      row.patient.name.toLowerCase().includes(search.toLowerCase()) ||
      row.patient.phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  // Find latest check-in date per patient (from compliance data)
  // The API doesn't return lastCheckIn directly, so we use "today" as proxy
  // if compliance score > 0. TODO: add lastCheckIn to API response.

  return (
    <div>
      {/* Title + Add button */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-800 text-gray-900">Patients</h1>
        <Link
          href="/patients/add"
          className="inline-flex items-center px-4 py-2 text-sm font-600 text-white bg-[#7c3aed] rounded-lg hover:bg-[#6d28d9] transition-colors shrink-0"
        >
          + Add Patient
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="input-field"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5">
        {(["all", "diabetes", "obesity"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-600 transition-all ${
              filter === f
                ? "bg-[#7c3aed] text-white"
                : "bg-white text-gray-500 border border-gray-200 hover:border-[#7c3aed] hover:text-[#7c3aed]"
            }`}
          >
            {f === "all" ? "All" : f === "diabetes" ? "Diabetes" : "Obesity"}
          </button>
        ))}
      </div>

      {/* Patient list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">
            {patients.length === 0
              ? "No patients yet"
              : "No patients match your search"}
          </p>
          {patients.length === 0 && (
            <Link
              href="/patients/add"
              className="text-[#7c3aed] font-600 text-sm"
            >
              + Add your first patient
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((row) => (
            <PatientCard
              key={row.doctorPatient.id}
              doctorPatientId={row.doctorPatient.id}
              name={row.patient.name}
              condition={row.doctorPatient.condition}
              complianceOverall={row.compliance.score.overall}
              trend={row.compliance.trend}
              lastCheckIn={null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
