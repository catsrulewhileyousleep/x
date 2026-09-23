"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog } from "@base-ui/react/dialog";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { popupSurface } from "@/components/ui/popover";
import type { Command, CommandGroup } from "@/lib/data";

const TOOLS_WHEN_EMPTY = 6;
const MAX_RESULTS = 12;
const noop = () => () => {};

export function CommandPalette({ groups }: { groups: CommandGroup[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Server renders the Mac hint; the client corrects it without a hydration mismatch.
  const mac = useSyncExternalStore(noop, () => /Mac|iPhone|iPad/.test(navigator.platform), () => true);

  const flat = useMemo(() => groups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.value }))), [groups]);
  const fuse = useMemo(
    () =>
      new Fuse(flat, {
        keys: [
          { name: "label", weight: 3 },
          { name: "keywords", weight: 1 },
          { name: "hint", weight: 0.5 },
        ],
        threshold: 0.2,
        minMatchCharLength: 2,
        ignoreLocation: true,
      }),
    [flat],
  );

  // Base UI renders and navigates the list; Fuse decides what is in it and in which order.
  const q = query.trim();
  const filtered = useMemo<CommandGroup[]>(() => {
    if (!q) {
      return groups.map((g) => (g.value === "Tools" ? { ...g, items: g.items.slice(0, TOOLS_WHEN_EMPTY) } : g));
    }
    const hits = fuse.search(q).slice(0, MAX_RESULTS).map((r) => r.item);
    return groups
      .map((g) => ({ ...g, items: g.items.filter((item) => hits.some((h) => h.href === item.href)) }))
      .filter((g) => g.items.length > 0);
  }, [q, fuse, groups]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(item: Command) {
    setOpen(false);
    router.push(item.href);
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setQuery("");
      }}
    >
      <Dialog.Trigger className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2.5 text-fg-muted transition-[color,background-color] duration-100 ease-out hover:bg-surface hover:text-fg data-popup-open:bg-surface">
        <Search aria-hidden="true" strokeWidth={1.75} className="size-4" />
        <span className="max-lg:sr-only">Jump to</span>
        <kbd aria-hidden="true" className="hidden rounded border border-hairline px-1.5 text-xs leading-5 lg:inline">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/50 supports-[-webkit-touch-callout:none]:absolute" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
          <Dialog.Popup
            aria-label="Jump to a page"
            className={`${popupSurface} flex max-h-[min(34rem,calc(100dvh-8rem))] w-full max-w-xl flex-col overflow-hidden`}
          >
            <Autocomplete.Root
              open
              inline
              items={groups}
              filteredItems={filtered}
              value={query}
              onValueChange={setQuery}
              itemToStringValue={(item: Command) => item.label}
              autoHighlight="always"
              keepHighlight
            >
              <div className="flex items-center gap-2.5 border-b border-hairline px-4">
                <Search aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-fg-muted" />
                <Autocomplete.Input
                  aria-label="Search tools, categories and pages"
                  placeholder="Search tools, categories and pages"
                  className="h-12 w-full bg-transparent text-base outline-none placeholder:text-fg-muted sm:text-sm"
                />
              </div>
              <Dialog.Close className="sr-only">Close</Dialog.Close>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scroll-padding-block:0.375rem]">
                <Autocomplete.Empty>
                  <p className="px-4 py-8 text-fg-muted">No results for “{q}”.</p>
                </Autocomplete.Empty>
                <Autocomplete.List className="p-1.5">
                  {(group: CommandGroup) => (
                    <Autocomplete.Group key={group.value} items={group.items} className="not-last:mb-1.5">
                      <Autocomplete.GroupLabel className="px-3 pt-2 pb-1 text-xs text-fg-muted">
                        {group.value}
                      </Autocomplete.GroupLabel>
                      <Autocomplete.Collection>
                        {(item: Command) => (
                          <Autocomplete.Item
                            key={item.href}
                            value={item}
                            onClick={() => go(item)}
                            className="flex cursor-pointer items-baseline justify-between gap-4 rounded-md px-3 py-2 [scroll-margin-block:0.375rem] data-highlighted:bg-surface"
                          >
                            <span className="truncate">{item.label}</span>
                            {item.hint && <span className="shrink-0 text-[13px] text-fg-muted">{item.hint}</span>}
                          </Autocomplete.Item>
                        )}
                      </Autocomplete.Collection>
                    </Autocomplete.Group>
                  )}
                </Autocomplete.List>
              </div>

              <p className="border-t border-hairline px-4 py-2 text-xs text-fg-muted">
                <kbd>↑</kbd> <kbd>↓</kbd> to move, <kbd>Enter</kbd> to open, <kbd>Esc</kbd> to close
              </p>
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
