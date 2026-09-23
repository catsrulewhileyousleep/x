"use client";

import { Moon, Sun } from "lucide-react";

const KEY = "theme";

/** Runs in <head> before first paint: stored choice wins, otherwise follow the system. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){}})()`;

function apply(theme: "light" | "dark") {
  // Without this every color transition fires at once and the swap smears instead of snapping.
  const style = document.createElement("style");
  style.append("*,*::before,*::after{transition:none !important}");
  document.head.append(style);
  document.documentElement.dataset.theme = theme;
  void document.body.offsetHeight;
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
}

export function ThemeToggle() {
  function toggle() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    apply(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  }

  // Icon and name are chosen by CSS from data-theme, so server and client markup always match.
  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-grid size-9 place-items-center rounded-lg text-fg-muted hover:bg-surface hover:text-fg"
    >
      <Sun aria-hidden="true" strokeWidth={1.75} className="size-4 light:hidden" />
      <Moon aria-hidden="true" strokeWidth={1.75} className="hidden size-4 light:block" />
      <span className="sr-only light:hidden">Switch to light theme</span>
      <span className="hidden light:inline light:sr-only">Switch to dark theme</span>
    </button>
  );
}
