"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ text, label, done = "Copied" }: { text: string; label: string; done?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); fall back to a manual copy.
      window.prompt(label, text);
    }
  }

  const Icon = copied ? Check : Copy;
  return (
    <>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-hairline px-3.5 text-[13px] font-medium transition-[background-color,scale] duration-100 ease-out hover:bg-surface active:scale-[0.96]"
      >
        <Icon aria-hidden="true" strokeWidth={2} className="size-3.5" />
        {/* Both labels share one cell so the button keeps its width when the text swaps. */}
        <span className="grid">
          <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>{label}</span>
          <span className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>{done}</span>
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? `${done}.` : ""}
      </span>
    </>
  );
}
