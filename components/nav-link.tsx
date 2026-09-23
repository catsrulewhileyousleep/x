"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Active when on the section itself or anywhere below it (/category matches /category/x). */
export function NavLink({ href, children }: { href: string; children: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      data-glide-item
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-11 items-center rounded-lg px-2.5 py-2 underline-offset-[6px] hover:text-fg ${
        active ? "text-fg underline decoration-accent decoration-2" : "text-fg-muted"
      }`}
    >
      {children}
    </Link>
  );
}
