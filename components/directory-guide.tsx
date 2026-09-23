"use client";

import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowUpRight, X } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { ui } from "@/lib/ui";

export function DirectoryGuide() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-[14px] text-fg-muted transition-colors duration-150 hover:bg-surface hover:text-fg">
        How we choose
        <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="guide-backdrop fixed inset-0 z-40 bg-black/50" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain p-4">
          <Dialog.Popup className="guide-dialog relative max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-2xl border border-hairline bg-canvas p-6 text-fg shadow-xl sm:p-8">
            <Dialog.Title render={<h2 />} className="pr-9 text-[26px] leading-tight font-semibold tracking-[-0.025em]">A smaller list. A clearer choice.</Dialog.Title>
            <Dialog.Description className="mt-3 pr-4 text-[15px] leading-relaxed text-fg-muted">
              Open-source tools, reviewed by hand. Here’s what earns a place in the directory.
            </Dialog.Description>
            <Dialog.Close aria-label="Close guide" className="absolute top-4 right-4 inline-grid size-11 place-items-center rounded-lg text-fg-muted hover:bg-surface hover:text-fg">
              <X aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </Dialog.Close>
            <div className="mt-6 border-y border-hairline">
              <Accordion items={[
                { title: "Useful, open and ready to use", content: "A public repository, an open-source license and a README that explains the tool. Each project must be useful on its own and at least 90 days old." },
                { title: "A score you can inspect", content: <>Health combines GitHub stars and recent commit activity. It is a maintenance signal, not a review of quality or security. <Link href="/health-score" className={ui.link}>Read the formula</Link>.</> },
                { title: "Paid placement, never a paid score", content: <>Sponsored tools meet the same criteria and carry a visible label. Payment never changes Health Scores. <Link href="/sponsor" className={ui.link}>See our sponsorship policy</Link>.</> },
              ]} />
            </div>
            <p className="mt-5 text-[13px] text-fg-muted">Know something we missed? <Link href="/submit" className={ui.link}>Suggest a tool</Link>.</p>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
