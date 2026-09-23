import Link from "next/link";
import type { Alternative } from "@/lib/data";

/**
 * Same row pattern as the tool list: header row, hairlines, whole-row link, hover surface.
 * The category column only appears where categories differ (the hub); inside a category it
 * would repeat the page's own subject on every row.
 */
export function AlternativeList({
  items,
  label,
  showCategory = false,
}: {
  items: Alternative[];
  label: string;
  showCategory?: boolean;
}) {
  const grid = showCategory
    ? "grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_12rem_6rem] gap-x-4"
    : "grid grid-cols-[minmax(0,1fr)_6rem] gap-x-4";
  return (
    <div>
      <div className={`${grid} border-b border-hairline px-3 pb-2 text-[13px] text-fg-muted`}>
        <span>Product</span>
        {showCategory && <span className="hidden sm:block">Category</span>}
        <span className="justify-self-end">Alternatives</span>
      </div>
      <ul aria-label={label}>
        {items.map((a) => (
          <li
            key={a.slug}
            className={`${grid} relative items-baseline border-b border-hairline px-3 py-3 transition-[background-color] duration-100 ease-out hover:bg-surface has-[a:focus-visible]:bg-surface has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-focus`}
          >
            <Link href={`/alternative-to/${a.slug}`} className="font-medium outline-none after:absolute after:inset-0">
              {a.name}
            </Link>
            {showCategory && <span className="hidden text-[13px] text-fg-muted sm:block">{a.categoryName}</span>}
            <span className="justify-self-end tabular-nums">{a.tools.length}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
