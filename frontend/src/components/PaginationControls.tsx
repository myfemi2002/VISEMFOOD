import type { ReactNode } from "react";

type PaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export function PaginationControls({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [5, 10, 25],
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);
  const visiblePages = buildVisiblePages(currentPage, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--vf-border-soft)] px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <p className="text-sm text-soft">
          Showing {from}-{to} of {totalItems}
        </p>
        <label className="inline-flex items-center gap-2 text-sm text-[var(--vf-text)]">
          <span className="text-[var(--vf-text-soft)]">Rows</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-3 py-1.5 text-sm text-[var(--vf-text)]"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <PageButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Previous
        </PageButton>
        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-[var(--vf-text-soft)]">
              ...
            </span>
          ) : (
            <PageButton key={page} active={page === currentPage} onClick={() => onPageChange(page)}>
              {page}
            </PageButton>
          ),
        )}
        <PageButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          Next
        </PageButton>
      </div>
    </div>
  );
}

function PageButton({
  children,
  active = false,
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const className = active
    ? "inline-flex min-w-[2.5rem] items-center justify-center rounded-full border border-[var(--vf-primary)] bg-[var(--vf-primary)] px-3 py-2 text-sm font-semibold text-white shadow-[var(--vf-shadow-soft)]"
    : "inline-flex min-w-[2.5rem] items-center justify-center rounded-full border border-[var(--vf-border-soft)] bg-[var(--vf-surface-elevated)] px-3 py-2 text-sm font-semibold text-[var(--vf-text)] transition-colors hover:border-[var(--vf-primary)] hover:text-[var(--vf-primary)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-[var(--vf-border-soft)] disabled:hover:text-[var(--vf-text)]";

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

function buildVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    if (!pages.includes(page)) {
      pages.push(page);
    }
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  if (!pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return pages;
}
