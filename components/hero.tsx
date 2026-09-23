import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Dither } from "@/components/dither";
import { DirectoryGuide } from "@/components/directory-guide";
import { Tooltip } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/format";

export function Hero({ count, categories, updated }: { count: number; categories: number; updated: string }) {
  return (
    <header className="hero border-b border-hairline">
      <div className="grid items-center gap-6 md:grid-cols-[1.35fr_1fr] md:gap-2">
        <div className="relative z-10 py-4 sm:py-8">
          <h1 className="max-w-[10em] text-[length:clamp(2.25rem,5.1vw,3.75rem)] leading-[1.03] font-semibold tracking-[-0.045em] text-balance">
            Open-source AI tools,<br className="hidden lg:block" /> carefully picked.
          </h1>
          <p className="mt-6 max-w-[39ch] text-base leading-relaxed text-pretty text-fg-muted sm:text-[17px]">
            Find your next tool. Keep your freedom.<br className="hidden sm:block" /> Independent picks, with the data to back them up.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <a href="#tools" className="hero-primary inline-flex min-h-11 items-center gap-5 rounded-lg bg-fg px-4 text-[14px] font-medium text-canvas">
              Explore {count} tools
              <ArrowDownRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
            </a>
            <DirectoryGuide />
          </div>
        </div>
        <div className="hero-art pointer-events-none relative overflow-hidden" aria-hidden="true">
          <Dither />
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline py-4 text-[13px] text-fg-muted sm:mt-8">
        <span><strong className="font-medium text-fg tabular-nums">{count}</strong> open-source tools</span>
        <Link href="/category" className="inline-flex min-h-6 items-center gap-1.5 hover:text-fg">
          <span><strong className="font-medium text-fg tabular-nums">{categories}</strong> categories</span>
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
        <Tooltip content="Stars, licenses and commit activity are from this GitHub snapshot. Not a live feed.">
          <Link href="/health-score" className="inline-flex min-h-6 items-center gap-2 hover:text-fg sm:ml-auto">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-fg-muted" />
            Data from <time dateTime={updated}>{formatDate(updated)}</time>
          </Link>
        </Tooltip>
      </div>
    </header>
  );
}
