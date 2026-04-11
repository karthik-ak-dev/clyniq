"use client";

// ─── Pagination ───────────────────────────────────────────

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
};

type PageEntry = number | "ellipsis";

export function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageEntries = (): PageEntry[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const entries: PageEntry[] = [];

    if (currentPage <= 3) {
      entries.push(1, 2, 3, "ellipsis", totalPages);
    } else if (currentPage >= totalPages - 2) {
      entries.push(1, "ellipsis", totalPages - 2, totalPages - 1, totalPages);
    } else {
      entries.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
    }

    return entries;
  };

  const entries = getPageEntries();

  return (
    <div className="flex items-center justify-between py-6">
      <div className="flex items-center gap-2 text-lg font-normal text-grey">
        <span>Show</span>
        <button className="flex items-center gap-1 rounded-md bg-white px-1.5 py-1.5">
          <span className="px-1 text-md font-medium text-card-text">{pageSize}</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="m3 4.5 3 3 3-3" stroke="currentColor" className="text-card-text" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span>of {totalItems} results</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex size-page-btn items-center justify-center rounded-md bg-surface text-black transition-colors hover:bg-border disabled:opacity-40"
          aria-label="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M8.75 3.5L5.25 7l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {entries.map((entry, i) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex size-page-btn items-center justify-center text-md font-medium text-card-text"
            >
              ...
            </span>
          ) : (
            <button
              key={entry}
              onClick={() => onPageChange(entry)}
              className={`flex size-page-btn items-center justify-center rounded-md text-md font-medium transition-colors ${
                entry === currentPage
                  ? "bg-primary text-white"
                  : "bg-white text-card-text hover:bg-surface"
              }`}
              aria-label={`Page ${entry}`}
              aria-current={entry === currentPage ? "page" : undefined}
            >
              {entry}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex size-page-btn items-center justify-center rounded-md bg-white text-black transition-colors hover:bg-surface disabled:opacity-40"
          aria-label="Next page"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M5.25 3.5L8.75 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
