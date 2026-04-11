"use client";

import { usePathname } from "next/navigation";

type PageMeta = { title: string; breadcrumb: string[] };

function getPageMeta(pathname: string): PageMeta {
  if (pathname.startsWith("/patients/add")) return { title: "Add New Patient", breadcrumb: ["Dashboard", "Patients", "Add New"] };
  if (pathname.startsWith("/patients/")) return { title: "Patient Detail", breadcrumb: ["Dashboard", "Patients", "Detail"] };
  if (pathname.startsWith("/patients")) return { title: "Patients", breadcrumb: ["Dashboard", "Patients"] };
  if (pathname.startsWith("/dashboard")) return { title: "Dashboard", breadcrumb: ["Dashboard"] };
  if (pathname.startsWith("/inbox")) return { title: "Inbox", breadcrumb: ["Dashboard", "Inbox"] };
  if (pathname.startsWith("/calendar")) return { title: "Calendar", breadcrumb: ["Dashboard", "Calendar"] };
  if (pathname.startsWith("/settings")) return { title: "Settings", breadcrumb: ["Dashboard", "Settings"] };
  return { title: "Dashboard", breadcrumb: ["Dashboard"] };
}

export function DashboardHeader() {
  const pathname = usePathname();
  const { title, breadcrumb } = getPageMeta(pathname);

  return (
    <header className="hidden items-center justify-between lg:flex">
      {/* Left — Title + Breadcrumb */}
      <div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-black">{title}</h1>
        <p className="mt-1 text-md font-normal leading-normal">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb}>
              {i > 0 && <span className="text-dark-grey">{" / "}</span>}
              <span className={i === breadcrumb.length - 1 ? "text-black" : "text-primary"}>
                {crumb}
              </span>
            </span>
          ))}
        </p>
      </div>

      {/* Right — Actions + User */}
      <div className="flex items-center gap-2.5">
        <button className="flex size-icon-btn items-center justify-center rounded-btn bg-primary-light text-primary-dark transition-colors hover:bg-primary-hover" aria-label="Settings">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M9 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14.55 11.25a1.237 1.237 0 0 0 .248 1.365l.045.045a1.5 1.5 0 1 1-2.123 2.122l-.045-.045a1.237 1.237 0 0 0-1.365-.247 1.237 1.237 0 0 0-.75 1.132v.128a1.5 1.5 0 0 1-3 0v-.068a1.237 1.237 0 0 0-.81-1.132 1.237 1.237 0 0 0-1.365.247l-.045.045a1.5 1.5 0 1 1-2.122-2.122l.045-.045A1.237 1.237 0 0 0 3.51 11.31a1.237 1.237 0 0 0-1.132-.75h-.128a1.5 1.5 0 0 1 0-3h.068a1.237 1.237 0 0 0 1.132-.81 1.237 1.237 0 0 0-.247-1.365l-.045-.045a1.5 1.5 0 1 1 2.122-2.123l.045.045a1.237 1.237 0 0 0 1.365.248h.06a1.237 1.237 0 0 0 .75-1.132v-.128a1.5 1.5 0 0 1 3 0v.068a1.237 1.237 0 0 0 .75 1.132 1.237 1.237 0 0 0 1.365-.248l.045-.045a1.5 1.5 0 1 1 2.122 2.123l-.045.045a1.237 1.237 0 0 0-.247 1.365v.06a1.237 1.237 0 0 0 1.132.75h.128a1.5 1.5 0 0 1 0 3h-.068a1.237 1.237 0 0 0-1.132.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button className="relative flex size-icon-btn items-center justify-center rounded-btn bg-primary-light text-primary-dark transition-colors hover:bg-primary-hover" aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none"><path d="M13.5 6a4.5 4.5 0 0 0-9 0c0 5.25-2.25 6.75-2.25 6.75h13.5S13.5 11.25 13.5 6ZM10.298 15.75a1.5 1.5 0 0 1-2.596 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
        </button>
        <div className="flex items-center overflow-clip rounded-full">
          <div className="flex size-avatar-sm items-center justify-center rounded-full bg-primary text-md font-bold text-white">
            Dr
          </div>
        </div>
        <div className="hidden lg:block">
          <p className="text-lg font-bold leading-tight text-black">Doctor</p>
          <p className="text-base font-normal text-dark-grey">Admin</p>
        </div>
      </div>
    </header>
  );
}
