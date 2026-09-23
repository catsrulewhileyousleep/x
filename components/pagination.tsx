"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/** Page numbers with gaps: 1 … 4 5 6 … 12. Always includes first, last and neighbours. */
function pageItems(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, pages, page - 1, page, page + 1]);
  const items: (number | "gap")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (keep.has(p)) items.push(p);
    else if (items.at(-1) !== "gap") items.push("gap");
  }
  return items;
}

export function Pagination({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  if (pages <= 1) return null;
  const edge =
    "inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] text-fg-muted hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button type="button" className={edge} disabled={page === 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft aria-hidden="true" strokeWidth={1.75} className="size-4" />
        Previous
      </button>

      <ol className="flex items-center gap-1 max-sm:hidden">
        {pageItems(page, pages).map((p, i) =>
          p === "gap" ? (
            <li key={`gap-${i}`} aria-hidden="true" className="w-6 text-center text-fg-muted">
              …
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                onClick={() => onChange(p)}
                className={`inline-grid size-9 place-items-center rounded-lg text-[13px] tabular-nums ${
                  p === page
                    ? "border border-accent text-fg"
                    : "text-fg-muted hover:bg-surface hover:text-fg"
                }`}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>
      <span className="px-2 text-[13px] text-fg-muted tabular-nums sm:hidden">
        {page} / {pages}
      </span>

      <button type="button" className={edge} disabled={page === pages} onClick={() => onChange(page + 1)}>
        Next
        <ChevronRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
      </button>
    </nav>
  );
}
