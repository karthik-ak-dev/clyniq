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
      {/* ─── Desktop Header ──────────────────────────────── */}
      <div className="hidden lg:block">
        {/* Title row */}
        <div className="flex items-start justify-between py-0.5">
          <div>
            <h1 className="text-[20px] font-bold leading-[1.2] tracking-[-0.8px] text-black">Patients</h1>
            <p className="mt-0.5 text-[11px] font-normal leading-[1.3]">
              <span className="text-primary">Dashboard</span>
              <span className="text-dark-grey">{" / "}</span>
              <span className="text-black">Patients</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-light text-primary-dark transition-colors hover:bg-[#d4e8bf]" aria-label="Settings">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.55 11.25a1.237 1.237 0 0 0 .248 1.365l.045.045a1.5 1.5 0 1 1-2.123 2.122l-.045-.045a1.237 1.237 0 0 0-1.365-.247 1.237 1.237 0 0 0-.75 1.132v.128a1.5 1.5 0 0 1-3 0v-.068a1.237 1.237 0 0 0-.81-1.132 1.237 1.237 0 0 0-1.365.247l-.045.045a1.5 1.5 0 1 1-2.122-2.122l.045-.045A1.237 1.237 0 0 0 3.51 11.31a1.237 1.237 0 0 0-1.132-.75h-.128a1.5 1.5 0 0 1 0-3h.068a1.237 1.237 0 0 0 1.132-.81 1.237 1.237 0 0 0-.247-1.365l-.045-.045a1.5 1.5 0 1 1 2.122-2.123l.045.045a1.237 1.237 0 0 0 1.365.248h.06a1.237 1.237 0 0 0 .75-1.132v-.128a1.5 1.5 0 0 1 3 0v.068a1.237 1.237 0 0 0 .75 1.132 1.237 1.237 0 0 0 1.365-.248l.045-.045a1.5 1.5 0 1 1 2.122 2.123l-.045.045a1.237 1.237 0 0 0-.247 1.365v.06a1.237 1.237 0 0 0 1.132.75h.128a1.5 1.5 0 0 1 0 3h-.068a1.237 1.237 0 0 0-1.132.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary-light text-primary-dark transition-colors hover:bg-[#d4e8bf]" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M13.5 6a4.5 4.5 0 0 0-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5S13.5 11.25 13.5 6ZM10.298 15.75a1.5 1.5 0 0 1-2.596 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center overflow-clip rounded-[40px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-white">
                Dr
              </div>
            </div>
            <div className="hidden xl:block">
              <p className="text-[18px] font-bold leading-[1.2] tracking-[-0.72px] text-black">Doctor</p>
              <p className="mt-[3px] text-[12px] font-normal text-dark-grey">Admin</p>
            </div>
          </div>
        </div>

        {/* Toolbar row */}
        <div className="mt-4 flex w-full items-center gap-2.5">
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
              className="h-[34px] w-[223px] rounded-lg bg-white pl-9 pr-3 text-[12px] font-normal text-black placeholder:text-dark-grey outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Filter icon button */}
          <button className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-primary-light text-black hover:bg-[#d4e8bf]" aria-label="Advanced filters">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="5" cy="4" r="1.25" fill="currentColor"/>
              <circle cx="10" cy="8" r="1.25" fill="currentColor"/>
              <circle cx="7" cy="12" r="1.25" fill="currentColor"/>
            </svg>
          </button>

          {/* Condition filter */}
          <select
            value={conditionFilter}
            onChange={(e) => handleConditionFilter(e.target.value as Condition | "all")}
            className="h-[34px] cursor-pointer appearance-none rounded-lg bg-primary-light bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22m3%204.5%203%203%203-3%22%20stroke%3D%22%23292929%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-7 text-[12px] font-medium text-[#292929] outline-none"
          >
            <option value="all">All Conditions</option>
            <option value="diabetes">Diabetes</option>
            <option value="obesity">Obesity</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value as PatientStatus | "all")}
            className="h-[34px] cursor-pointer appearance-none rounded-lg bg-primary-light bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22m3%204.5%203%203%203-3%22%20stroke%3D%22%23292929%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-7 text-[12px] font-medium text-[#292929] outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="new">New</option>
          </select>

          <div className="flex-1" />

          {/* Sort */}
          <div className="flex items-baseline gap-2.5">
            <span className="text-[11px] font-normal text-[#6E6F78]">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-[34px] cursor-pointer appearance-none rounded-lg bg-primary-light bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22m3%204.5%203%203%203-3%22%20stroke%3D%22%23292929%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-7 text-[12px] font-medium text-[#292929] outline-none"
            >
              <option value="name">Name</option>
              <option value="compliance">Compliance</option>
              <option value="lastCheckin">Last Check-in</option>
            </select>
          </div>

          {/* New Patient */}
          <Link
            href="/patients/add"
            className="flex h-[34px] items-center rounded-lg bg-primary px-3 text-[12px] font-medium text-white transition-colors hover:bg-primary-dark"
          >
            New Patient
          </Link>
        </div>
      </div>

      {/* ─── Mobile/Tablet Toolbar ───────────────────────── */}
      <div className="lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A4ACAB]" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search patient"
              className="h-11 w-full rounded-lg border border-[#E5E6E6] bg-white pl-10 pr-3 text-[14px] font-normal text-[#203430] placeholder:text-[#A4ACAB] outline-none focus:border-[#35BFA3]"
            />
          </div>

          <button
            onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-[#E5E6E6] bg-white text-[#63716E]"
            aria-label="Filters"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14.667 2H1.333l5.334 6.307v4.36L9.333 14V8.307L14.667 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <Link
            href="/patients/add"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#35BFA3] text-white"
            aria-label="Add new patient"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>

        {filterMenuOpen && (
          <div className="flex flex-wrap gap-2 border-b border-[#E5E6E6] px-4 pb-3">
            <select
              value={conditionFilter}
              onChange={(e) => handleConditionFilter(e.target.value as Condition | "all")}
              className="h-10 rounded-lg border border-[#E5E6E6] bg-white px-3 text-[13px] font-medium text-[#203430] outline-none"
            >
              <option value="all">All Conditions</option>
              <option value="diabetes">Diabetes</option>
              <option value="obesity">Obesity</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value as PatientStatus | "all")}
              className="h-10 rounded-lg border border-[#E5E6E6] bg-white px-3 text-[13px] font-medium text-[#203430] outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="new">New</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 rounded-lg border border-[#E5E6E6] bg-white px-3 text-[13px] font-medium text-[#203430] outline-none"
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

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="mt-6 pb-8">
        <div className="flex items-center gap-3 text-[12px] leading-[1.3]">
          <span className="font-bold text-black">Copyright &copy; 2026 Hormonia</span>
          <div className="flex gap-4 font-normal text-dark-grey">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms and conditions</a>
            <a href="#" className="hover:text-black">Contact</a>
          </div>
          <div className="flex-1" />
          <div className="flex gap-3">
            <a href="#" className="text-dark-grey hover:text-black" aria-label="Facebook">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#" className="text-dark-grey hover:text-black" aria-label="X">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 4l6.5 7.5M20 4l-6.5 7.5m0 0L20 20h-4l-4.5-5.5m2-3L4 20h4l4.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#" className="text-dark-grey hover:text-black" aria-label="Instagram">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>
            </a>
            <a href="#" className="text-dark-grey hover:text-black" aria-label="YouTube">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.35 29 29 0 0 0-.46-5.33Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#" className="text-dark-grey hover:text-black" aria-label="LinkedIn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2V9ZM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
        </div>
      </footer>
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
      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#F8FCF3]">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M24 12v24M12 24h24" stroke="#35BFA3" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="24" cy="24" r="22" stroke="#E4F2D3" strokeWidth="2"/>
        </svg>
      </div>

      {hasFilters ? (
        <>
          <p className="mt-6 text-[16px] font-semibold text-[#203430]">
            No patients match your filters
          </p>
          <p className="mt-1.5 text-[14px] text-[#63716E]">
            Try adjusting your search or filter criteria.
          </p>
        </>
      ) : (
        <>
          <p className="mt-6 text-[16px] font-semibold text-[#203430]">
            No patients yet
          </p>
          <p className="mt-1.5 text-[14px] text-[#63716E]">
            Add your first patient to start tracking compliance.
          </p>
          <Link
            href="/patients/add"
            className="mt-6 flex items-center gap-2 rounded-lg bg-[#35BFA3] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#0E4D41]"
          >
            Add Your First Patient
          </Link>
        </>
      )}
    </div>
  );
}
