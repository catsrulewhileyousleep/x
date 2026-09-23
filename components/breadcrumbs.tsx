import Link from "next/link";
import { siteUrl } from "@/lib/format";
import { JsonLd } from "@/components/json-ld";
import { ui } from "@/lib/ui";

export type Crumb = { name: string; href: string };

/** Visible trail plus matching BreadcrumbList schema. The last crumb is the current page. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ name: "Home", href: "/" }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-fg-muted">
      <ol className="flex flex-wrap items-center gap-x-1.5">
        {trail.map((c, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-x-1.5">
              {last ? (
                <span aria-current="page" className="text-fg">
                  {c.name}
                </span>
              ) : (
                <>
                  <Link href={c.href} className={ui.navLink}>
                    {c.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: trail.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: `${siteUrl}${c.href}`,
          })),
        }}
      />
    </nav>
  );
}
