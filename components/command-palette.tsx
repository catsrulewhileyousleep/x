"use client";

import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search } from "lucide-react";

export type Command = { href: string; label: string; hint: string; keywords: string[] };

const LIMIT = 8;
const noop = () => () => {};

export function CommandPalette({ commands }: { commands: Command[] }) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  // Server renders the Mac hint; the client corrects it without a hydration mismatch.
  const mac = useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => true,
  );
  const id = useId();

  const fuse = useMemo(
    () =>
      new Fuse(commands, {
        keys: [
          { name: "label", weight: 3 },
          { name: "keywords", weight: 1 },
          { name: "hint", weight: 0.5 },
        ],
        threshold: 0.2,
        minMatchCharLength: 2,
        ignoreLocation: true,
      }),
    [commands],
  );

  const q = query.trim();
  const results = (q ? fuse.search(q).map((r) => r.item) : commands).slice(0, LIMIT);

  function open() {
    setQuery("");
    setActive(0);
    // showModal() gives focus containment, Escape and an inert background for free.
    dialog.current?.showModal();
  }

  function go(c: Command | undefined) {
    if (!c) return;
    dialog.current?.close();
    router.push(c.href);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else open();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (results.length ? (i + step + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  }

  const optionId = (i: number) => `${id}-option-${i}`;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-fg-muted hover:bg-surface hover:text-fg"
      >
        <Search aria-hidden="true" strokeWidth={1.75} className="size-4" />
        <span className="max-sm:sr-only">Jump to</span>
        <kbd aria-hidden="true" className="hidden rounded border border-hairline px-1.5 text-xs leading-5 sm:inline">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <dialog
        ref={dialog}
        aria-label="Jump to a page"
        onClick={(e) => e.target === dialog.current && dialog.current.close()}
        className="m-auto mt-[12vh] w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-hairline bg-canvas p-0 text-fg backdrop:bg-black/50"
      >
        <div className="flex items-center gap-2.5 border-b border-hairline px-4">
          <Search aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-fg-muted" />
          <input
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={results.length ? optionId(active) : undefined}
            aria-autocomplete="list"
            aria-label="Search tools, categories and pages"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="Search tools, categories and pages"
            autoComplete="off"
            spellCheck={false}
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-fg-muted sm:text-sm"
          />
        </div>

        {results.length > 0 ? (
          <ul ref={list} id={`${id}-list`} role="listbox" aria-label="Results" className="max-h-80 overflow-y-auto overscroll-contain p-1.5">
            {results.map((c, i) => (
              <li
                key={c.href}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                onMouseMove={() => setActive(i)}
                onClick={() => go(c)}
                className={`flex cursor-pointer items-baseline justify-between gap-4 rounded-md px-3 py-2 ${i === active ? "bg-surface" : ""}`}
              >
                <span className="truncate">{c.label}</span>
                <span className="shrink-0 text-[13px] text-fg-muted">{c.hint}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-6 text-fg-muted">No results for “{q}”.</p>
        )}

        <p className="border-t border-hairline px-4 py-2 text-xs text-fg-muted">
          <kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close
        </p>
      </dialog>
    </>
  );
}
