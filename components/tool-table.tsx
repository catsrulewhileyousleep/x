"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Health } from "@/lib/health";
import { formatNumber, formatStars } from "@/lib/format";
import { HealthValue } from "@/components/health";
import { Avatar } from "@/components/ui/avatar";
import { Tooltip } from "@/components/ui/tooltip";

export type Row = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  categoryName: string;
  tags: string[];
  license: string | null;
  stars: number | null;
  health: Health;
  avatarUrl: string | null;
  /** Paid placement; labeled here and disclosed on /sponsor. */
  sponsored?: boolean;
  why?: string;
};

export type SortKey = "name" | "health" | "stars";

// Column meanings for sighted mouse and keyboard users; /health-score explains the full method.
const HINTS: Partial<Record<SortKey, string>> = {
  health: "0–100 from GitHub stars and commit activity",
};
export type Sort = { key: SortKey; dir: "asc" | "desc" };
export const DEFAULT_SORT: Sort = { key: "health", dir: "desc" };

const score = (r: Row) => (r.health.status === "scored" ? r.health.score : null);

function compare(a: Row, b: Row, { key, dir }: Sort) {
  if (key === "name") {
    const d = a.name.localeCompare(b.name, "en", { sensitivity: "base" });
    return dir === "asc" ? d : -d;
  }
  const va = key === "health" ? score(a) : a.stars;
  const vb = key === "health" ? score(b) : b.stars;
  // Missing values always sink, whatever the direction: unknown is not "low".
  if (va == null || vb == null) return va == null ? (vb == null ? 0 : 1) : -1;
  return dir === "asc" ? va - vb : vb - va;
}

// Desktop: name | health | stars | license. Mobile keeps health as its own column
// and folds stars + license into the tagline line instead of hiding them.
const grid =
  "grid grid-cols-[minmax(0,1fr)_3.5rem] sm:grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_7rem] gap-x-4";

export function sortRows<T extends Row>(rows: T[], sort: Sort, pinSponsored = false): T[] {
  return [...rows].sort((a, b) => {
    // Category pages pin paid placements above the chosen order; other lists rank normally.
    if (pinSponsored && (a.sponsored || b.sponsored)) {
      const d = (b.sponsored ? 1 : 0) - (a.sponsored ? 1 : 0);
      if (d !== 0) return d;
    }
    return compare(a, b, sort);
  });
}

export function nextSort(current: Sort, key: SortKey): Sort {
  return current.key === key
    ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
    : { key, dir: key === "name" ? "asc" : "desc" };
}

/** Sorting is uncontrolled by default; pass `sort` + `onSortChange` when a parent paginates. */
export function ToolTable({
  rows,
  sortable = true,
  label,
  pinSponsored = false,
  sort: controlledSort,
  onSortChange,
}: {
  rows: Row[];
  sortable?: boolean;
  label: string;
  /** Keep sponsored rows on top whatever the sort. Category pages only. */
  pinSponsored?: boolean;
  sort?: Sort;
  onSortChange?: (sort: Sort) => void;
}) {
  const router = useRouter();
  const [ownSort, setOwnSort] = useState<Sort>(DEFAULT_SORT);
  const sort = controlledSort ?? ownSort;
  const sorted = sortable ? sortRows(rows, sort, pinSponsored) : rows;

  function toggle(key: SortKey) {
    const next = nextSort(sort, key);
    if (onSortChange) onSortChange(next);
    else setOwnSort(next);
  }

  const head = (key: SortKey, text: string, className = "", align: "start" | "end" = "start") => {
    const el = sortable ? (
      <SortButton sort={sort} sortKey={key} onClick={() => toggle(key)} align={align} className={className}>
        {text}
      </SortButton>
    ) : (
      <span className={className}>{text}</span>
    );
    const hint = HINTS[key];
    return hint ? <Tooltip content={hint}>{el}</Tooltip> : el;
  };

  return (
    <div>
      <div
        className={`${grid} items-center border-b border-hairline px-3 pb-2 text-[13px] text-fg-muted`}
      >
        <div className="flex items-center gap-4">
          {head("name", "Tool")}
          {/* Stars column is hidden on mobile, so its sort control moves here. */}
          {sortable && <span className="sm:hidden">{head("stars", "Stars")}</span>}
        </div>
        {head("health", "Health", "justify-self-end", "end")}
        <span className="hidden justify-self-end sm:block">{head("stars", "Stars", "", "end")}</span>
        <span className="hidden sm:block">License</span>
      </div>

      <ol aria-label={label}>
        {sorted.map((r) => (
          <li
            key={r.slug}
            className={`${grid} group relative items-start border-b border-hairline px-3 py-3 transition-[background-color] duration-100 ease-out hover:bg-surface has-[a:focus-visible]:bg-surface has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-focus`}
          >
            <div className="flex min-w-0 gap-3">
              <span className="mt-px">
                <Avatar src={r.avatarUrl} name={r.name} />
              </span>
              <div className="min-w-0">
                <Link
                  href={`/tool/${r.slug}`}
                  className="font-medium text-fg outline-none after:absolute after:inset-0"
                >
                  {r.name}
                </Link>
                {r.sponsored && (
                  <span className="ml-2 text-[12px] text-fg-muted">
                    Sponsored
                    <span className="sr-only"> listing</span>
                  </span>
                )}
                <p className="mt-0.5 text-[13px] text-pretty text-fg-muted">
                  {r.why ?? r.tagline}
                  <span className="sm:hidden">
                    {" · "}
                    <span className="tabular-nums">{formatStars(r.stars)}</span> stars
                    {r.license && ` · ${r.license}`}
                  </span>
                </p>
              </div>
            </div>
            <div className="justify-self-end pt-px">
              <HealthValue health={r.health} />
            </div>
            <div className="hidden justify-self-end pt-px tabular-nums sm:block">
              {r.stars == null ? (
                "—"
              ) : (
                <Tooltip content={`${formatNumber(r.stars)} stars`}>
                  {/* Sits above the row's stretched link so it can be hovered; a click still opens the tool. */}
                  <span className="relative z-[1] cursor-pointer" onClick={() => router.push(`/tool/${r.slug}`)}>
                    {formatStars(r.stars)}
                  </span>
                </Tooltip>
              )}
            </div>
            <div className="hidden truncate pt-px text-fg-muted sm:block">{r.license ?? "—"}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function SortButton({
  sort,
  sortKey,
  onClick,
  align = "start",
  className = "",
  children,
  ...props
}: {
  sort: Sort;
  sortKey: SortKey;
  onClick: () => void;
  align?: "start" | "end";
  className?: string;
  children: string;
} & Omit<React.ComponentPropsWithRef<"button">, "onClick" | "children" | "className">) {
  const active = sort.key === sortKey;
  const Icon = sort.dir === "asc" ? ArrowUp : ArrowDown;
  const arrow = (
    <Icon aria-hidden="true" strokeWidth={1.75} className={`size-3 ${active ? "" : "invisible"}`} />
  );
  return (
    // Props from a wrapping Tooltip trigger (ref, hover and focus handlers) land on the button.
    <button
      type="button"
      {...props}
      onClick={onClick}
      className={`-mx-1 inline-flex min-h-6 items-center gap-1 rounded px-1 hover:text-fg ${active ? "text-fg" : ""} ${className}`}
    >
      {/* Arrow slot is always reserved so headers don't shift when sorting changes. On
          right-aligned numeric columns it leads, so the label's edge lines up with the digits. */}
      {align === "end" && arrow}
      {children}
      {align === "start" && arrow}
      <span className="sr-only">
        {active
          ? `, sorted ${sort.dir === "asc" ? "ascending" : "descending"}`
          : ", sort by this column"}
      </span>
    </button>
  );
}
