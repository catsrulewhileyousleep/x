"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { ChevronDown, Search } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { DEFAULT_SORT, ToolTable, sortRows, type Row, type Sort } from "@/components/tool-table";
import { isClientNavigation, markHydrated } from "@/lib/client-nav";

type Category = { slug: string; name: string };
type License = "any" | "permissive" | "copyleft";
type View = {
  query: string;
  category: string | null;
  license: License;
  minHealth: number;
  sort: Sort;
  page: number;
};

const PAGE_SIZE = 20;
const INITIAL: View = { query: "", category: null, license: "any", minHealth: 0, sort: DEFAULT_SORT, page: 1 };

const LICENSES: { value: License; label: string }[] = [
  { value: "any", label: "Any license" },
  { value: "permissive", label: "Permissive" },
  { value: "copyleft", label: "Copyleft" },
];
const HEALTH: { value: number; label: string }[] = [
  { value: 0, label: "Any score" },
  { value: 70, label: "70 and above" },
  { value: 40, label: "40 and above" },
];

function licenseGroup(spdx: string | null): License | null {
  if (!spdx) return null;
  if (/^(A?GPL|LGPL|MPL)/.test(spdx)) return "copyleft";
  if (/^(MIT|Apache|BSD|ISC|0BSD|Unlicense)/.test(spdx)) return "permissive";
  return null;
}

type Filters = Pick<View, "category" | "license" | "minHealth">;

function matches(r: Row, f: Filters) {
  if (f.category && r.category !== f.category) return false;
  if (f.license !== "any" && licenseGroup(r.license) !== f.license) return false;
  if (f.minHealth > 0 && !(r.health.status === "scored" && r.health.score >= f.minHealth)) return false;
  return true;
}

// View state is saved per history entry (bfcacheId), so Back restores search, filter, sort and
// page, while a fresh visit to the home page starts clean. Nothing is written to the URL.
const storageKey = (id: string) => `directory:${id}`;

function readView(id: string): View {
  if (!isClientNavigation()) return INITIAL;
  try {
    const saved = sessionStorage.getItem(storageKey(id));
    return saved ? { ...INITIAL, ...JSON.parse(saved) } : INITIAL;
  } catch {
    return INITIAL;
  }
}

export function Directory({
  rows,
  categories,
  contributeUrl,
}: {
  rows: Row[];
  categories: Category[];
  contributeUrl: string;
}) {
  const { bfcacheId } = useRouter();
  const [view, setView] = useState<View>(() => readView(bfcacheId));
  const { query, category, license, minHealth, sort } = view;
  const input = useRef<HTMLInputElement>(null);
  const results = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markHydrated();
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(storageKey(bfcacheId), JSON.stringify(view));
    } catch {}
  }, [bfcacheId, view]);

  const fuse = useMemo(
    () =>
      new Fuse(rows, {
        // License and tags are searchable too; matching only names feels broken.
        keys: [
          { name: "name", weight: 3 },
          { name: "tagline", weight: 1 },
          { name: "tags", weight: 1.5 },
          { name: "license", weight: 1.5 },
          { name: "categoryName", weight: 1 },
        ],
        threshold: 0.2,
        minMatchCharLength: 2,
        ignoreLocation: true,
      }),
    [rows],
  );

  const q = query.trim();
  const matched = useMemo(() => (q ? fuse.search(q).map((r) => r.item) : rows), [fuse, q, rows]);
  const filters: Filters = { category, license, minHealth };
  const sorted = useMemo(
    () => sortRows(matched.filter((r) => matches(r, { category, license, minHealth })), sort),
    [matched, category, license, minHealth, sort],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(view.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);
  // Each option counts what you would get by choosing it, given the other filters.
  const countWith = (patch: Partial<Filters>) => matched.filter((r) => matches(r, { ...filters, ...patch })).length;
  const filtersActive = category !== null || license !== "any" || minHealth > 0;

  // Any change to what is listed starts again from page 1.
  const update = (patch: Partial<Omit<View, "page">>) => setView((v) => ({ ...v, ...patch, page: 1 }));

  function goToPage(p: number) {
    setView((v) => ({ ...v, page: p }));
    const el = results.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: "start" });
    // Start keyboard users at the top of the new page instead of on a now-disabled button.
    el.focus({ preventScroll: true });
  }

  // "/" focuses search from anywhere on the page, as on GitHub and most docs sites.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      e.preventDefault();
      input.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function reset() {
    setView(INITIAL);
    input.current?.focus();
  }


  if (rows.length === 0) {
    return (
      <div role="alert" className="border-y border-hairline py-10">
        <p className="font-medium">The tool list could not be loaded.</p>
        <p className="mt-1 text-fg-muted">
          The directory has no data, so this is not a filter result.{" "}
          <a href="" className="text-fg underline">
            Reload the page
          </a>{" "}
          or{" "}
          <a href={contributeUrl} className="text-fg underline">
            report it on GitHub
          </a>
          .
        </p>
      </div>
    );
  }

  const filteredOut = sorted.length !== rows.length;
  const range = `${start + 1}–${start + visible.length}`;
  const summary =
    pages > 1
      ? `${range} of ${sorted.length}${filteredOut ? " matching" : ""} tools`
      : `${sorted.length}${filteredOut ? ` of ${rows.length}` : ""} tools`;

  return (
    <div>
      <div className="flex flex-col gap-3">
        <label className="group relative block">
          <span className="sr-only">Search tools</span>
          <Search
            aria-hidden="true"
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
          />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => update({ query: e.target.value })}
            onKeyDown={(e) => e.key === "Escape" && update({ query: "" })}
            placeholder="Search name, tag or license"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            className="h-11 w-full rounded-lg border border-hairline bg-surface pr-10 pl-9 text-base text-fg placeholder:text-fg-muted focus-visible:border-transparent sm:text-sm"
          />
          <kbd
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-hairline px-1.5 text-xs leading-5 text-fg-muted group-focus-within:hidden sm:block"
          >
            /
          </kbd>
        </label>

        <div role="group" aria-label="Filters" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <FilterSelect
            wide
            label="Category"
            value={category ?? ""}
            active={category !== null}
            onChange={(v) => update({ category: v || null })}
            options={[
              { value: "", label: "All categories", count: countWith({ category: null }) },
              ...categories.map((c) => ({ value: c.slug, label: c.name, count: countWith({ category: c.slug }) })),
            ]}
          />
          <FilterSelect
            label="License"
            value={license}
            active={license !== "any"}
            onChange={(v) => update({ license: v as License })}
            options={LICENSES.map((l) => ({ ...l, count: countWith({ license: l.value }) }))}
          />
          <FilterSelect
            label="Health Score"
            value={String(minHealth)}
            active={minHealth > 0}
            onChange={(v) => update({ minHealth: Number(v) })}
            options={HEALTH.map((h) => ({ value: String(h.value), label: h.label, count: countWith({ minHealth: h.value }) }))}
          />
          {filtersActive && (
            <button
              type="button"
              onClick={() => update({ category: null, license: "any", minHealth: 0 })}
              className="col-span-2 h-9 justify-self-start rounded-lg px-2.5 text-[13px] text-fg-muted hover:bg-surface hover:text-fg sm:col-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div ref={results} tabIndex={-1} className="mt-6 scroll-mt-6 outline-none">
        <p role="status" className="mb-2 text-[13px] text-fg-muted tabular-nums">
          {summary}
        </p>

        {visible.length > 0 ? (
          <ToolTable
            rows={visible}
            label="Tools"
            sort={sort}
            onSortChange={(s) => update({ sort: s })}
          />
        ) : (
          <div className="border-y border-hairline py-10">
            <p className="font-medium">
              No tools match {q ? <>“{q}”</> : "these filters"}
              {q && filtersActive && " with these filters"}.
            </p>
            <p className="mt-1 text-fg-muted">
              Try a shorter term or{" "}
              <button type="button" onClick={reset} className="text-fg underline">
                clear search and filters
              </button>
              .
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination page={page} pages={pages} onChange={goToPage} />
      </div>
    </div>
  );
}

/** Native select: keyboard, screen reader and mobile pickers work without extra code. */
function FilterSelect({
  label,
  value,
  active,
  onChange,
  options,
  wide = false,
}: {
  wide?: boolean;
  label: string;
  value: string;
  active: boolean;
  onChange: (value: string) => void;
  options: { value: string; label: string; count: number }[];
}) {
  return (
    <label className={`relative ${wide ? "col-span-2 sm:col-auto" : ""}`}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full appearance-none truncate rounded-lg border bg-canvas pr-8 pl-3 text-[13px] tabular-nums transition-[color,border-color] duration-100 ease-out hover:text-fg ${
          active ? "border-accent text-fg" : "border-hairline text-fg-muted"
        }`}
      >
        {/* The selected option omits its count: the result line already states it. Options that
            would empty the list are disabled rather than offered. */}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.count === 0 && o.value !== value}>
            {o.value === value ? o.label : `${o.label} (${o.count})`}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.75}
        className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fg-muted"
      />
    </label>
  );
}
