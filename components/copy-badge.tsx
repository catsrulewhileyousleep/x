"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBadge({ markdown }: { markdown: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); fall back to a manual copy.
      window.prompt("Copy the badge Markdown:", markdown);
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
      {/* Width is reserved for the longer label so the header does not shift. */}
      <span className="grid">
        <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>Copy badge</span>
        <span className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>
          Copied
        </span>
      </span>
    </button>
    <span role="status" className="sr-only">
      {copied ? "Badge Markdown copied" : ""}
    </span>
    </>
  );
}
