"use client";

import { useEffect, useRef } from "react";

/** One highlight per group; it retargets only when a different item is entered. */
export function Glide({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const target = useRef<HTMLElement | null>(null);

  function show(element: HTMLElement, keyboard = false) {
    const layer = highlight.current;
    const container = root.current;
    if (!layer || !container) return;
    const from = container.getBoundingClientRect();
    const to = element.getBoundingClientRect();
    layer.dataset.instant = String(keyboard || !target.current);
    layer.style.width = `${to.width}px`;
    layer.style.height = `${to.height}px`;
    layer.style.transform = `translate3d(${to.left - from.left}px, ${to.top - from.top}px, 0)`;
    layer.style.opacity = "1";
    target.current = element;
  }

  function clear() {
    if (highlight.current) highlight.current.style.opacity = "0";
    target.current = null;
  }

  useEffect(() => {
    clear();
  }, [children]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (target.current?.isConnected) show(target.current, true);
      else clear();
    });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={root}
      className={`glide relative isolate ${className}`}
      onPointerOver={(event) => {
        if (!matchMedia("(hover: hover) and (pointer: fine)").matches || event.pointerType === "touch") return;
        const item = (event.target as HTMLElement).closest<HTMLElement>("[data-glide-item]");
        if (item && item !== target.current) show(item);
      }}
      onPointerLeave={() => {
        const focused = root.current?.querySelector<HTMLElement>(":focus-visible")?.closest<HTMLElement>("[data-glide-item]");
        if (focused) show(focused, true);
        else clear();
      }}
      onFocus={(event) => {
        if (!event.target.matches(":focus-visible")) return;
        const item = (event.target as HTMLElement).closest<HTMLElement>("[data-glide-item]");
        if (item) show(item, true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) clear();
      }}
    >
      <span ref={highlight} aria-hidden="true" className="glide-highlight pointer-events-none absolute top-0 left-0 -z-10 rounded-lg bg-surface opacity-0" />
      {children}
    </div>
  );
}
