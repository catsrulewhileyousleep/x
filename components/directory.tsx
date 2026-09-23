"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { ChevronDown, Search } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { Checkbox, CheckboxGroup } from "@/components/ui/checkbox";
import { Popover } from "@/components/ui/popover";
import { Radio, RadioGroup } from "@/components/ui/radio";
import { DEFAULT_SORT, ToolTable, sortRows, type Row, type Sort } from "@/components/tool-table";
import { isClientNavigation, markHydrated } from "@/lib/client-nav";
import { ui } from "@/lib/ui";

type Category = { slug: string; name: string };
type License = "permissive" | "copyleft";
type View = {
  query: string;
  /** Empty means every category. */
  categories: string[];
  /** Empty means every license. */
  licenses: License[];
  minHealth: number;
  sort: Sort;
  page: number;
};

const PAGE_SIZE = 20;
const INITIAL: View = { query: "", categories: [], licenses: [], minHealth: 0, sort: DEFAULT_SORT, page: 1 };

const LICENSES: { value: License; label: string }[] = [
  { value: "permissive", label: "Permissive (MIT, Apache, BSD)" },
  { value: "copyleft", label: "Copyleft (GPL, AGPL, MPL)" },
];
const HEALTH: { value: number; label: string }[] = [
  { value: 0, label: "Any" },
  { value: 70, label: "70 and above" },
  { value: 40, label: "40 and above" },
];

function licenseGroup(spdx: string | null): License | null {
  if (!spdx) return null;
  if (/^(A?GPL|LGPL|MPL)/.test(spdx)) return "copyleft";
  if (/^(MIT|Apache|BSD|ISC|0BSD|Unlicense)/.test(spdx)) return "permissive";
  return null;
}

type Filters = Pick<View, "categories" | "licenses" | "minHealth">;

function matches(r: Row, f: Filters) {
  if (f.categories.length && !f.categories.includes(r.category)) return false;
  if (f.licenses.length && !f.licenses.includes(licenseGroup(r.license) as License)) return false;
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
    if (!saved) return INITIAL;
    const v = { ...INITIAL, ...JSON.parse(saved) };
    // Ignore state saved by an older shape of the filters.
    return Array.isArray(v.categories) && Array.isArray(v.licenses) ? v : INITIAL;
  } catch {
    return INITIAL;
  }
}

export function Directory({
  rows,
  categories,
  reportUrl,
}: {
  rows: Row[];
  categories: Category[];
  reportUrl: string;
}) {
  const { bfcacheId } = useRouter();
  const [view, setView] = useState<View>(() => readView(bfcacheId));
  const { query, categories: selectedCategories, licenses, minHealth, sort } = view;
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
  const filters: Filters = { categories: selectedCategories, licenses, minHealth };
  const sorted = useMemo(
    () => sortRows(matched.filter((r) => matches(r, { categories: selectedCategories, licenses, minHealth })), sort),
    [matched, selectedCategories, licenses, minHealth, sort],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(view.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);
  // Each option counts the tools it matches given the other filters, the standard faceted count.
  const countWith = (patch: Partial<Filters>) => matched.filter((r) => matches(r, { ...filters, ...patch })).length;
  const filtersActive = selectedCategories.length > 0 || licenses.length > 0 || minHealth > 0;
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;

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
          <a href="" className={ui.link}>
            Reload the page
          </a>{" "}
          or{" "}
          <a href={reportUrl} className={ui.link}>
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

        <div role="group" aria-label="Filters" className="flex flex-wrap items-center gap-2">
          <Popover
            label="Category"
            trigger={
              <FilterTrigger
                label="Category"
                summary={selectedCategories.length === 1 ? categoryName(selectedCategories[0]) : selectedCategories.length || null}
              />
            }
          >
            <CheckboxGroup
              label="Category"
              value={selectedCategories}
              onValueChange={(v) => update({ categories: v })}
            >
              {categories.map((c) => {
                const count = countWith({ categories: [c.slug] });
                return (
                  <Checkbox key={c.slug} value={c.slug} count={count} disabled={count === 0 && !selectedCategories.includes(c.slug)}>
                    {c.name}
                  </Checkbox>
                );
              })}
            </CheckboxGroup>
          </Popover>

          <Popover
            label="License"
            trigger={
              <FilterTrigger
                label="License"
                summary={licenses.length === 1 ? (licenses[0] === "permissive" ? "Permissive" : "Copyleft") : licenses.length || null}
              />
            }
          >
            <CheckboxGroup label="License" value={licenses} onValueChange={(v) => update({ licenses: v as License[] })}>
              {LICENSES.map((l) => {
                const count = countWith({ licenses: [l.value] });
                return (
                  <Checkbox key={l.value} value={l.value} count={count} disabled={count === 0 && !licenses.includes(l.value)}>
                    {l.label}
                  </Checkbox>
                );
              })}
            </CheckboxGroup>
          </Popover>

          <Popover
            label="Health"
            trigger={<FilterTrigger label="Health" summary={minHealth > 0 ? `${minHealth}+` : null} />}
          >
            <RadioGroup label="Health" value={minHealth} onValueChange={(v) => update({ minHealth: v })}>
              {HEALTH.map((h) => {
                const count = countWith({ minHealth: h.value });
                return (
                  <Radio key={h.value} value={h.value} count={count} disabled={count === 0 && h.value !== minHealth}>
                    {h.label}
                  </Radio>
                );
              })}
            </RadioGroup>
          </Popover>

          {filtersActive && (
            <button
              type="button"
              onClick={() => update({ categories: [], licenses: [], minHealth: 0 })}
              className="h-9 rounded-lg px-2.5 text-[13px] text-fg-muted transition-[color,background-color] duration-100 ease-out hover:bg-surface hover:text-fg"
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
              <button type="button" onClick={reset} className={ui.link}>
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

/**
 * Trigger shared by every filter. It shows the current choice so the toolbar reads as a summary:
 * "Category", "Category: Coding agents", "Category: 3".
 */
function FilterTrigger({
  label,
  summary,
  ...props
}: { label: string; summary: string | number | null } & React.ComponentPropsWithRef<"button">) {
  const active = summary !== null;
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-9 max-w-full items-center gap-1.5 rounded-lg border bg-canvas pr-2.5 pl-3 text-[13px] transition-[color,border-color,background-color] duration-100 ease-out hover:text-fg data-popup-open:bg-surface ${
        active ? "border-accent text-fg" : "border-hairline text-fg-muted"
      }`}
    >
      <span className="truncate">
        {label}
        {active && <span className="tabular-nums">: {summary}</span>}
      </span>
      <ChevronDown aria-hidden="true" strokeWidth={1.75} className="size-3.5 shrink-0 text-fg-muted" />
    </button>
  );
}
