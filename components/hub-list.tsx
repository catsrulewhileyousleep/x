import Link from "next/link";

/** Row list for hub pages, matching the tool list: hairlines, whole-row link, hover surface. */
export function HubList({
  label,
  items,
}: {
  label: string;
  items: { href: string; title: string; description: string; count: number; examples: string[] }[];
}) {
  return (
    <ul aria-label={label} className="mt-12 border-t border-hairline">
      {items.map((it) => (
        <li
          key={it.href}
          className="group relative grid gap-x-6 gap-y-1 border-b border-hairline px-3 py-4 transition-[background-color] duration-100 ease-out hover:bg-surface has-[a:focus-visible]:bg-surface has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-focus sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="min-w-0">
            <Link href={it.href} className="font-medium outline-none after:absolute after:inset-0">
              {it.title}
            </Link>
            <p className="mt-0.5 max-w-[65ch] text-[13px] text-pretty text-fg-muted">{it.description}</p>
            <p className="mt-1.5 text-[13px] text-fg">{it.examples.join(", ")}</p>
          </div>
          <p className="text-[13px] text-fg-muted tabular-nums sm:pt-0.5 sm:text-right">
            {it.count} {it.count === 1 ? "tool" : "tools"}
          </p>
        </li>
      ))}
    </ul>
  );
}
