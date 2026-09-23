"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { DEFAULT_SORT, ToolTable, sortRows, type Row, type Sort } from "@/components/tool-table";
import { isClientNavigation, markHydrated } from "@/lib/client-nav";

type Pill = { slug: string; name: string };
type View = { query: string; category: string | null; sort: Sort; page: number };

const PAGE_SIZE = 20;
const INITIAL: View = { query: "", category: null, sort: DEFAULT_SORT, page: 1 };

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
  categories: Pill[];
  contributeUrl: string;
}) {
  const { bfcacheId } = useRouter();
  const [view, setView] = useState<View>(() => readView(bfcacheId));
  const { query, category, sort } = view;
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
  const filtered = category ? matched.filter((r) => r.category === category) : matched;
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(view.page, pages);
  const start = (page - 1) * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);
  const countIn = (slug: string | null) =>
    slug ? matched.filter((r) => r.category === slug).length : matched.length;

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

  const activeName = categories.find((c) => c.slug === category)?.name;

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

        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {[{ slug: null, name: "All" } as { slug: string | null; name: string }, ...categories].map(
            (c) => {
              const active = category === c.slug;
              return (
                <button
                  key={c.slug ?? "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => update({ category: c.slug })}
                  className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-3 text-[13px] whitespace-nowrap transition-[color,border-color] duration-100 ease-out ${
                    active
                      ? "border-accent bg-surface text-fg"
                      : "border-hairline text-fg-muted hover:text-fg"
                  }`}
                >
                  {c.name}
                  <span className={`tabular-nums ${active ? "text-accent" : ""}`}>({countIn(c.slug)})</span>
                </button>
              );
            },
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
              No tools match {q && <>“{q}”</>}
              {q && activeName && " "}
              {activeName && <>in {activeName}</>}.
            </p>
            <p className="mt-1 text-fg-muted">
              Try a shorter term or{" "}
              <button type="button" onClick={reset} className="text-fg underline">
                clear the filters
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
