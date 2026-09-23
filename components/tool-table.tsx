"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { Health } from "@/lib/health";
import { formatStars } from "@/lib/format";
import { HealthValue } from "@/components/health";
import { ToolAvatar } from "@/components/tool-avatar";

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
  why?: string;
};

type SortKey = "name" | "health" | "stars";
type Sort = { key: SortKey; dir: "asc" | "desc" };

const score = (r: Row) => (r.health.status === "scored" ? r.health.score : null);

function compare(a: Row, b: Row, { key, dir }: Sort) {
  if (key === "name") {
    const d = a.name.localeCompare(b.name, "vi", { sensitivity: "base" });
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

export function ToolTable({
  rows,
  sortable = true,
  label,
}: {
  rows: Row[];
  sortable?: boolean;
  label: string;
}) {
  const [sort, setSort] = useState<Sort>({ key: "health", dir: "desc" });
  const sorted = sortable ? [...rows].sort((a, b) => compare(a, b, sort)) : rows;

  function toggle(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" },
    );
  }

  const head = (key: SortKey, text: string, className = "", align: "start" | "end" = "start") =>
    sortable ? (
      <SortButton sort={sort} sortKey={key} onClick={() => toggle(key)} align={align} className={className}>
        {text}
      </SortButton>
    ) : (
      <span className={className}>{text}</span>
    );

  return (
    <div>
      <div
        className={`${grid} items-end border-b border-hairline px-3 pb-2 text-[13px] text-fg-muted`}
      >
        <div className="flex items-center gap-4">
          {head("name", "Tool")}
          {/* Stars column is hidden on mobile, so its sort control moves here. */}
          <span className="sm:hidden">{head("stars", "Stars")}</span>
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
                <ToolAvatar src={r.avatarUrl} />
              </span>
              <div className="min-w-0">
                <Link
                  href={`/tool/${r.slug}`}
                  className="font-medium text-fg outline-none after:absolute after:inset-0"
                >
                  {r.name}
                </Link>
                <p className="mt-0.5 text-[13px] text-pretty text-fg-muted">
                  {r.tagline}
                  <span className="sm:hidden">
                    {" · "}
                    <span className="tabular-nums">{formatStars(r.stars)}</span> stars
                    {r.license && ` · ${r.license}`}
                  </span>
                </p>
                {r.why && <p className="mt-1.5 max-w-[65ch] text-[13px] text-pretty text-fg">{r.why}</p>}
              </div>
            </div>
            <div className="justify-self-end pt-px">
              <HealthValue health={r.health} />
            </div>
            <div className="hidden justify-self-end pt-px tabular-nums sm:block">
              {formatStars(r.stars)}
            </div>
            <div className="hidden truncate pt-px text-fg-muted sm:block" title={r.license ?? undefined}>
              {r.license ?? "—"}
            </div>
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
}: {
  sort: Sort;
  sortKey: SortKey;
  onClick: () => void;
  align?: "start" | "end";
  className?: string;
  children: string;
}) {
  const active = sort.key === sortKey;
  const Icon = sort.dir === "asc" ? ArrowUp : ArrowDown;
  const arrow = (
    <Icon aria-hidden="true" strokeWidth={1.75} className={`size-3 ${active ? "" : "invisible"}`} />
  );
  return (
    <button
      type="button"
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
          ? `, đang sắp xếp ${sort.dir === "asc" ? "tăng dần" : "giảm dần"}`
          : ", sắp xếp theo cột này"}
      </span>
    </button>
  );
}
