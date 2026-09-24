import type { Metadata } from "next";
import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { commandGroups, snapshotAt } from "@/lib/data";
import { CommandPalette } from "@/components/command-palette";
import { BrandMark } from "@/components/brand-mark";
import { NavLink } from "@/components/nav-link";
import { Providers } from "@/components/providers";
import { ui } from "@/lib/ui";
import { ThemeToggle, themeScript } from "@/components/theme";
import { InlineScript } from "@/components/inline-script";
import { formatDate, repoUrl, siteName, siteUrl } from "@/lib/format";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `Open-source AI tools | ${siteName}`, template: `%s | ${siteName}` },
  description:
    "A small, hand-picked directory of open-source AI tools, with a transparent Health Score built from GitHub data.",
  openGraph: { type: "website", siteName },
  twitter: { card: "summary_large_image" },
  // Allow full-size image previews and uncapped snippets (Discover, AI Overviews). Pages that set
  // their own `robots` (noindex) replace this.
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={interTight.variable} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="relative font-sans">
        <Providers>
        <div className="isolate flex min-h-dvh flex-col">
        <a
          href="#main"
          className="absolute top-3 -left-[999px] z-10 rounded-md bg-fg px-3 py-2 text-[13px] font-medium text-canvas focus:left-3"
        >
          Skip to content
        </a>

        <header className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto] items-center gap-y-1 px-5 pt-4 pb-2 sm:flex sm:gap-6 sm:px-8 sm:py-5">
          <Link href="/" className="-mx-1 inline-flex items-center gap-2 px-1 py-2 text-[15px] font-semibold tracking-tight">
            <BrandMark size={22} />
            <span>{siteName}</span>
          </Link>
          <nav
            aria-label="Main"
            className="col-span-2 row-start-2 -ml-2.5 flex items-center gap-0.5 sm:row-auto sm:ml-0 sm:flex-1"
          >
            <NavLink href="/category">Categories</NavLink>
            <NavLink href="/alternative-to">Alternatives</NavLink>
            <NavLink href="/health-score">Health Score</NavLink>
          </nav>
          <div className="-mr-2 flex items-center gap-0.5">
            <CommandPalette groups={commandGroups()} />
            <ThemeToggle />
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 pt-8 pb-24 sm:px-8 sm:pt-14">
          {children}
        </main>

        <footer className="border-t border-hairline">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-10 text-[13px] text-fg-muted sm:flex-row sm:justify-between sm:px-8">
            <p>GitHub data from {formatDate(snapshotAt)}</p>
            <p>
                <Link href="/submit" className={ui.navLink}>
                  Submit a tool
                </Link>
                <span aria-hidden="true"> · </span>
                <Link href="/sponsor" className={ui.navLink}>
                  Sponsor
                </Link>
                <span aria-hidden="true"> · </span>
                <a href={repoUrl} className={ui.navLink}>
                  Source code
                </a>
            </p>
          </div>
        </footer>
        </div>
        </Providers>
      </body>
    </html>
  );
}
