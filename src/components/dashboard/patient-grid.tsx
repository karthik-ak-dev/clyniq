"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PatientCard, PatientCardSkeleton } from "./patient-card";
import { Pagination } from "./pagination";
import type { Patient, DoctorPatient, Trend, Condition, PatientStatus } from "@/lib/db/types";

// ─── Types ────────────────────────────────────────────────
type PatientData = {
  patient: Patient;
  doctorPatient: DoctorPatient;
  compliance: {
    score: { overall: number; metrics: unknown[] };
    trend: Trend;
    insights: string[];
  };
  lastCheckIn: { date: string; responses: Record<string, unknown> } | null;
};

type SortOption = "name" | "compliance" | "lastCheckin";

const PAGE_SIZE = 12;

// ─── Patient Grid ─────────────────────────────────────────

export function PatientGrid({ initialData }: { initialData: PatientData[] }) {
  const [search, setSearch] = useState("");
  const [conditionFilter, setConditionFilter] = useState<Condition | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = initialData;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.patient.name.toLowerCase().includes(q) ||
          r.patient.phone.includes(q)
      );
    }

    if (conditionFilter !== "all") {
      result = result.filter((r) => r.doctorPatient.condition === conditionFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r.doctorPatient.status === statusFilter);
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "name") {
        return a.patient.name.localeCompare(b.patient.name);
      }
      if (sortBy === "compliance") {
        return b.compliance.score.overall - a.compliance.score.overall;
      }
      const aDate = a.lastCheckIn?.date ?? "";
      const bDate = b.lastCheckIn?.date ?? "";
      return bDate.localeCompare(aDate);
    });

    return result;
  }, [initialData, search, conditionFilter, statusFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleConditionFilter = (value: Condition | "all") => {
    setConditionFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: PatientStatus | "all") => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col">
      {/* ─── Desktop Toolbar ─────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="flex w-full items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-grey" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search patient"
              className="h-toolbar w-search rounded-md bg-white pl-8 pr-2.5 text-md font-normal text-black placeholder:text-dark-grey outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Condition filter */}
          <select
            value={conditionFilter}
            onChange={(e) => handleConditionFilter(e.target.value as Condition | "all")}
            className="h-toolbar cursor-pointer appearance-none rounded-md bg-primary-light bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22m3%204.5%203%203%203-3%22%20stroke%3D%22%23292929%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_10px_center] bg-no-repeat px-3 pr-6 text-md font-medium text-card-text outline-none"
          >
            <option value="all">All Conditions</option>
            <option value="diabetes">Diabetes</option>
            <option value="obesity">Obesity</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as PatientStatus | "all")}
            className="h-toolbar cursor-pointer appearance-none rounded-md bg-primary-light bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22m3%204.5%203%203%203-3%22%20stroke%3D%22%23292929%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_10px_center] bg-no-repeat px-3 pr-6 text-md font-medium text-card-text outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="new">New</option>
          </select>

          <div className="flex-1" />

          {/* Sort */}
          <div className="flex items-baseline gap-2.5">
            <span className="text-base font-normal text-grey">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-toolbar cursor-pointer appearance-none rounded-md bg-primary-light bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22m3%204.5%203%203%203-3%22%20stroke%3D%22%23292929%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_8px_center] bg-no-repeat pl-3 pr-5 text-md font-medium text-card-text outline-none"
            >
              <option value="name">Name</option>
              <option value="compliance">Compliance</option>
              <option value="lastCheckin">Last Check-in</option>
            </select>
          </div>

          {/* New Patient */}
          <Link
            href="/patients/add"
            className="flex h-toolbar items-center rounded-md bg-primary px-3 text-md font-medium text-white transition-colors hover:bg-primary-dark"
          >
            New Patient
          </Link>
        </div>
      </div>

      {/* ─── Mobile/Tablet Toolbar ───────────────────────── */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-grey" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search patient"
              className="h-10 w-full rounded-md border border-border bg-white pl-9 pr-3 text-md font-normal text-black placeholder:text-dark-grey outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-white text-dark-grey"
            aria-label="Filters"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14.667 2H1.333l5.334 6.307v4.36L9.333 14V8.307L14.667 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <Link
            href="/patients/add"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"
            aria-label="Add new patient"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>

        {filterMenuOpen && (
          <div className="mt-3 flex flex-wrap gap-2 border-b border-border pb-3">
            <select
              value={conditionFilter}
              onChange={(e) => handleConditionFilter(e.target.value as Condition | "all")}
              className="h-toolbar rounded-md border border-border bg-white px-3 text-md font-medium text-black outline-none"
            >
              <option value="all">All Conditions</option>
              <option value="diabetes">Diabetes</option>
              <option value="obesity">Obesity</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as PatientStatus | "all")}
              className="h-toolbar rounded-md border border-border bg-white px-3 text-md font-medium text-black outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new">New</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-toolbar rounded-md border border-border bg-white px-3 text-md font-medium text-black outline-none"
            >
              <option value="name">Sort: Name</option>
              <option value="compliance">Sort: Compliance</option>
              <option value="lastCheckin">Sort: Last Check-in</option>
            </select>
          </div>
        )}
      </div>

      {/* ─── Card Grid ───────────────────────────────────── */}
      {paged.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-4">
          {paged.map((row) => (
            <PatientCard
              key={row.doctorPatient.id}
              patient={row.patient}
              doctorPatient={row.doctorPatient}
              compliance={{ score: row.compliance.score, trend: row.compliance.trend }}
              lastCheckIn={row.lastCheckIn}
            />
          ))}
        </div>
      ) : (
        <EmptyState hasFilters={search !== "" || conditionFilter !== "all" || statusFilter !== "all"} />
      )}

      {/* ─── Pagination ──────────────────────────────────── */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

    </div>
  );
}

// ─── Loading Grid ─────────────────────────────────────────
export function PatientGridSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <PatientCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="mt-24 flex flex-col items-center justify-center">
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-primary-subtle">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M24 12v24M12 24h24" stroke="#35BFA3" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="22" stroke="#E4F2D3" strokeWidth="2"/>
        </svg>
      </div>

      {hasFilters ? (
        <>
          <p className="mt-6 text-xl font-semibold text-black">
            No patients match your filters
          </p>
          <p className="mt-1.5 text-lg text-dark-grey">
            Try adjusting your search or filter criteria.
          </p>
        </>
      ) : (
        <>
          <p className="mt-6 text-xl font-semibold text-black">
            No patients yet
          </p>
          <p className="mt-1.5 text-lg text-dark-grey">
            Add your first patient to start tracking compliance.
          </p>
          <Link
            href="/patients/add"
            className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Add Your First Patient
          </Link>
        </>
      )}
    </div>
  );
}
