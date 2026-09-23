import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function LinkCard({ href, title, children, icon }: { href: string; title: string; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <Link href={href} className="link-card group flex h-full flex-col rounded-xl border border-hairline p-5 text-fg">
      <div className="flex items-center justify-between text-fg-muted">
        {icon}
        <ArrowUpRight aria-hidden="true" strokeWidth={1.75} className="size-4" />
      </div>
      <h3 className="mt-5 text-[15px] font-medium">{title}</h3>
      <p className="mt-1 text-[13px] leading-relaxed text-pretty text-fg-muted">{children}</p>
    </Link>
  );
}
