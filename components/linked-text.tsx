import Link from "next/link";
import { ui } from "@/lib/ui";

/** Renders `text`, turning the first mention of each linked tool's name into a link. */
export function LinkedText({ text, links }: { text: string; links: { name: string; href: string }[] }) {
  const parts: React.ReactNode[] = [];
  let rest = text;
  const ordered = links
    .map((l) => ({ ...l, at: text.indexOf(l.name) }))
    .filter((l) => l.at >= 0)
    .sort((a, b) => a.at - b.at);
  for (const l of ordered) {
    const i = rest.indexOf(l.name);
    if (i < 0) continue;
    parts.push(rest.slice(0, i));
    parts.push(
      <Link key={l.href} href={l.href} className={ui.link}>
        {l.name}
      </Link>,
    );
    rest = rest.slice(i + l.name.length);
  }
  parts.push(rest);
  return <>{parts}</>;
}
