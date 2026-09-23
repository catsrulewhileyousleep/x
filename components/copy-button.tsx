"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useSound } from "@/components/sound";

export function CopyButton({
  text,
  label,
  done = "Copied",
  hint,
}: {
  text: string;
  label: string;
  done?: string;
  /** Tooltip explaining what is copied. */
  hint?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { play } = useSound();

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      play("success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked (insecure context, permissions); fall back to a manual copy.
      window.prompt(label, text);
    }
  }

  const Icon = copied ? Check : Copy;
  const button = (
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-hairline px-3.5 text-[13px] font-medium transition-[background-color] duration-100 ease-out hover:bg-surface motion-safe:transition-[background-color,scale] motion-safe:active:scale-[0.96]"
    >
      <Icon aria-hidden="true" strokeWidth={2} className="size-3.5" />
      {/* Both labels share one cell so the button keeps its width when the text swaps. */}
      <span className="grid">
        <span className={`col-start-1 row-start-1 ${copied ? "invisible" : ""}`}>{label}</span>
        <span className={`col-start-1 row-start-1 ${copied ? "" : "invisible"}`}>{done}</span>
      </span>
    </button>
  );

  return (
    <>
      {hint ? <Tooltip content={hint}>{button}</Tooltip> : button}
      <span role="status" className="sr-only">
        {copied ? `${done}.` : ""}
      </span>
    </>
  );
}
