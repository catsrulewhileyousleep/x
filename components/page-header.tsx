import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { ui } from "@/lib/ui";

/**
 * Every page opens the same way: breadcrumbs, title, one sentence. The home page uses the
 * larger `hero` title and no breadcrumbs; tool pages add an avatar and actions.
 */
export function PageHeader({
  crumbs,
  title,
  lede,
  media,
  actions,
  hero = false,
  compact = false,
}: {
  crumbs?: Crumb[];
  title: string;
  lede?: React.ReactNode;
  media?: React.ReactNode;
  actions?: React.ReactNode;
  hero?: boolean;
  compact?: boolean;
}) {
  // Hero: size scales with the viewport so the longest line (about 9.1em) always fits beside
  // the page padding, and the em-based max width holds the break at the same point at every size.
  const h1 = hero
    ? "max-w-[10em] text-[length:clamp(1.875rem,calc((100vw_-_2.5rem)/9.6),3.5rem)] leading-[1.05] tracking-[-0.035em]"
    : "max-w-[24ch] text-[2.25rem] leading-[1.1] tracking-[-0.03em]";
  const ledeClass = hero
    ? "mt-5 max-w-[52ch] text-[15px] text-pretty text-fg-muted sm:text-[17px] sm:leading-relaxed"
    : compact ? "mt-2 max-w-[60ch] text-[15px] text-pretty text-fg-muted" : ui.lede;
  return (
    <header>
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div
        className={`${crumbs ? "mt-6" : ""} flex flex-col ${compact ? "items-start gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8" : "gap-6 sm:flex-row sm:items-end sm:justify-between"}`}
      >
        <div className="flex min-w-0 items-start gap-4">
          {media && <span className="mt-1 shrink-0">{media}</span>}
          <div className="min-w-0">
            <h1 className={`${h1} font-semibold text-balance`}>{title}</h1>
            {lede && <p className={ledeClass}>{lede}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2 lg:shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
