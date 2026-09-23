import Link from "next/link";

export type IndexRow = { href: string; name: string; detail?: string; count: number };

/**
 * Hub-page list with the same row pattern as the tool list: header row, hairlines,
 * whole-row link, hover surface. Pass `detail` only when it differs from row to row.
 */
export function IndexList({
  rows,
  label,
  columns,
}: {
  rows: IndexRow[];
  label: string;
  columns: { name: string; detail?: string; count: string };
}) {
  const grid = columns.detail
    ? "grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_14rem_6rem] gap-x-4"
    : "grid grid-cols-[minmax(0,1fr)_6rem] gap-x-4";
  return (
    <div>
      <div className={`${grid} border-b border-hairline px-3 pb-2 text-[13px] text-fg-muted`}>
        <span>{columns.name}</span>
        {columns.detail && <span className="hidden sm:block">{columns.detail}</span>}
        <span className="justify-self-end">{columns.count}</span>
      </div>
      <ul aria-label={label}>
        {rows.map((r) => (
          <li
            key={r.href}
            className={`${grid} relative items-baseline border-b border-hairline px-3 py-3 transition-[background-color] duration-100 ease-out hover:bg-surface has-[a:focus-visible]:bg-surface has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-focus`}
          >
            <Link href={r.href} className="font-medium outline-none after:absolute after:inset-0">
              {r.name}
            </Link>
            {columns.detail && <span className="hidden truncate text-[13px] text-fg-muted sm:block">{r.detail}</span>}
            <span className="justify-self-end tabular-nums">{r.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
