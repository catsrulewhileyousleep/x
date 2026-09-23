"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { ToolTable, type Row } from "@/components/tool-table";

type Pill = { slug: string; name: string };

export function Directory({
  rows,
  categories,
  contributeUrl,
}: {
  rows: Row[];
  categories: Pill[];
  contributeUrl: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

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
        threshold: 0.34,
        ignoreLocation: true,
      }),
    [rows],
  );

  const q = query.trim();
  const matched = useMemo(() => (q ? fuse.search(q).map((r) => r.item) : rows), [fuse, q, rows]);
  const visible = category ? matched.filter((r) => r.category === category) : matched;
  const countIn = (slug: string | null) =>
    slug ? matched.filter((r) => r.category === slug).length : matched.length;

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
    setQuery("");
    setCategory(null);
    input.current?.focus();
  }

  const activeName = categories.find((c) => c.slug === category)?.name;

  if (rows.length === 0) {
    return (
      <div role="alert" className="border-y border-hairline py-10">
        <p className="font-medium">Chưa tải được danh sách tool.</p>
        <p className="mt-1 text-fg-muted">
          Dữ liệu danh mục đang trống, đây không phải kết quả lọc.{" "}
          <a href="" className="text-fg underline">
            Tải lại trang
          </a>{" "}
          hoặc{" "}
          <a href={contributeUrl} className="text-fg underline">
            báo lỗi trên GitHub
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3">
        <label className="group relative block">
          <span className="sr-only">Tìm tool</span>
          <Search
            aria-hidden="true"
            strokeWidth={1.75}
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-fg-muted"
          />
          <input
            ref={input}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setQuery("")}
            placeholder="Tìm tên, tag, license"
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

        <div role="group" aria-label="Lọc theo danh mục" className="flex flex-wrap gap-2">
          {[{ slug: null, name: "Tất cả" } as { slug: string | null; name: string }, ...categories].map(
            (c) => {
              const active = category === c.slug;
              return (
                <button
                  key={c.slug ?? "all"}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(c.slug)}
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

      <p role="status" className="mt-6 mb-2 text-[13px] text-fg-muted">
        {visible.length === rows.length
          ? `${rows.length} tool`
          : `${visible.length} trên ${rows.length} tool`}
      </p>

      {visible.length > 0 ? (
        <ToolTable rows={visible} label="Danh sách tool" />
      ) : (
        <div className="border-y border-hairline py-10">
          <p className="font-medium">
            Không có tool nào khớp {q && <>“{q}”</>}
            {q && activeName && " "}
            {activeName && <>trong {activeName}</>}.
          </p>
          <p className="mt-1 text-fg-muted">
            Thử từ khóa ngắn hơn hoặc{" "}
            <button type="button" onClick={reset} className="text-fg underline">
              xóa bộ lọc
            </button>
            .
          </p>
        </div>
      )}
    </div>
  );
}
