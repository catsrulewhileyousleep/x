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
}: {
  crumbs?: Crumb[];
  title: string;
  lede?: React.ReactNode;
  media?: React.ReactNode;
  actions?: React.ReactNode;
  hero?: boolean;
}) {
  const h1 = hero
    ? "max-w-[16ch] text-[2.5rem] leading-[1.05] tracking-[-0.035em] sm:text-[3.5rem]"
    : "max-w-[24ch] text-[2.25rem] leading-[1.1] tracking-[-0.03em]";
  return (
    <header>
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div
        className={`${crumbs ? "mt-6" : ""} flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between`}
      >
        <div className="flex min-w-0 items-start gap-4">
          {media && <span className="mt-1 shrink-0">{media}</span>}
          <div className="min-w-0">
            <h1 className={`${h1} font-semibold text-balance`}>{title}</h1>
            {lede && <p className={hero ? `${ui.lede} mt-5` : ui.lede}>{lede}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
      </div>
    </header>
  );
}
