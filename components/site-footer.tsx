import Link from "next/link";
import { ArrowUpRight, Plus, Heart } from "lucide-react";
import { Glide } from "@/components/ui/glide";
import { LinkCard } from "@/components/ui/link-card";
import { formatDate, repoUrl, siteName } from "@/lib/format";

export function SiteFooter({ updated }: { updated: string }) {
  return (
    <footer role="contentinfo" className="border-t border-hairline">
      <div className="mx-auto max-w-5xl px-5 pt-12 pb-6 sm:px-8 sm:pt-16">
        <div className="grid gap-8 md:grid-cols-[1.15fr_1fr_1fr] md:gap-4">
          <div className="pr-4">
            <Link href="/" className="inline-flex min-h-6 items-center gap-2.5 text-[14px] font-medium">
              <span aria-hidden="true" className="brand-mark" />
              {siteName}
            </Link>
            <h2 className="mt-5 text-[32px] leading-[1.1] font-semibold tracking-[-0.035em]">Open by design.</h2>
            <p className="mt-3 max-w-[29ch] text-[14px] leading-relaxed text-fg-muted">A little less searching.<br />A little more building.</p>
          </div>
          <LinkCard href="/submit" title="Know a good tool?" icon={<Plus aria-hidden="true" className="size-5" strokeWidth={1.5} />}>
            Help the directory grow. Every suggestion gets a human review.
          </LinkCard>
          <LinkCard href="/sponsor" title="Support the directory" icon={<Heart aria-hidden="true" className="size-5" strokeWidth={1.5} />}>
            Clearly labeled sponsorships. The same independent criteria.
          </LinkCard>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-hairline pt-5 text-[13px]">
          <nav aria-label="Footer">
            <Glide className="-ml-2.5 flex flex-wrap gap-0.5">
              {[["/category", "Categories"], ["/alternative-to", "Alternatives"], ["/health-score", "Health Score"]].map(([href, label]) => (
                <Link data-glide-item key={href} href={href} className="inline-flex min-h-11 items-center rounded-lg px-2.5 text-fg-muted hover:text-fg">{label}</Link>
              ))}
            </Glide>
          </nav>
          <a href={repoUrl} className="inline-flex min-h-11 items-center gap-1.5 text-fg-muted hover:text-fg">Source on GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" /></a>
        </div>
        <p className="mt-3 text-[12px] text-fg-muted">Built in the open. GitHub snapshot: <time dateTime={updated}>{formatDate(updated)}</time>.</p>
      </div>
    </footer>
  );
}
