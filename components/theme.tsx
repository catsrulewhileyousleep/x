"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";

type Theme = "light" | "dark";
const KEY = "theme";
// Mirrors --bg-base in each theme, for the browser UI (mobile address bar, PWA title bar).
const CHROME = { dark: "#070707", light: "#fafafa" } as const;

/** Runs in <head> before first paint: stored choice wins, otherwise follow the system. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";var d=document.documentElement;d.dataset.theme=t;var m=document.createElement("meta");m.name="theme-color";m.content=t==="light"?"${CHROME.light}":"${CHROME.dark}";document.head.appendChild(m)}catch(e){}})()`;

const systemTheme = (): Theme => (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

function apply(theme: Theme) {
  // Without this every color transition fires at once and the swap smears instead of snapping.
  const style = document.createElement("style");
  style.append("*,*::before,*::after{transition:none !important}");
  document.head.append(style);
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", CHROME[theme]);
  void document.body.offsetHeight;
  requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
}

function stored(): Theme | null {
  try {
    const t = localStorage.getItem(KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  // Until the user picks a theme, keep following the OS, including changes while the page is open.
  useEffect(() => {
    const mql = matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (!stored()) apply(systemTheme());
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next: Theme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    apply(next);
    try {
      // Picking the system's own theme means "follow the system" again, so no third option is needed.
      if (next === systemTheme()) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {}
  }

  const label = (
    <>
      <span className="light:hidden">Switch to light theme</span>
      <span className="hidden light:inline">Switch to dark theme</span>
    </>
  );

  // Icon and name are chosen by CSS from data-theme, so server and client markup always match.
  return (
    <Tooltip content={label} side="bottom">
      <button
        type="button"
        onClick={toggle}
        className="inline-grid size-9 place-items-center rounded-lg text-fg-muted transition-[color,background-color] duration-100 ease-out hover:bg-surface hover:text-fg"
      >
        <Sun aria-hidden="true" strokeWidth={1.75} className="size-4 light:hidden" />
        <Moon aria-hidden="true" strokeWidth={1.75} className="hidden size-4 light:block" />
        <span className="sr-only light:hidden">Switch to light theme</span>
        <span className="hidden light:inline light:sr-only">Switch to dark theme</span>
      </button>
    </Tooltip>
  );
}
