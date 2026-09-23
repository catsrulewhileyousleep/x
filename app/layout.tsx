import type { Metadata } from "next";
import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { commandGroups, snapshotAt } from "@/lib/data";
import { CommandPalette } from "@/components/command-palette";
import { NavLink } from "@/components/nav-link";
import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { Glide } from "@/components/ui/glide";
import { PreferencesMenu } from "@/components/ui/preferences-menu";
import { ThemeToggle, themeScript } from "@/components/theme";
import { InlineScript } from "@/components/inline-script";
import { siteName, siteUrl } from "@/lib/format";
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

        <header className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto] items-center gap-y-1 px-5 pt-4 pb-2 sm:px-8 md:flex md:gap-6 md:py-5">
          <Link href="/" className="-mx-1 inline-flex min-h-11 items-center gap-2.5 px-1 py-2 text-[15px] font-semibold tracking-tight">
            <span aria-hidden="true" className="brand-mark" />
            {siteName}
          </Link>
          <nav
            aria-label="Main"
            className="col-span-2 row-start-2 -ml-2.5 md:row-auto md:ml-0 md:flex-1"
          >
            <Glide className="flex items-center gap-0.5">
            <NavLink href="/category">Categories</NavLink>
            <NavLink href="/alternative-to">Alternatives</NavLink>
            <NavLink href="/health-score">Health Score</NavLink>
            </Glide>
          </nav>
          <div className="-mr-2 flex items-center gap-0.5">
            <CommandPalette groups={commandGroups()} />
            <ThemeToggle />
            <PreferencesMenu />
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 pt-8 pb-24 sm:px-8 sm:pt-14">
          {children}
        </main>

        <SiteFooter updated={snapshotAt} />
        </div>
        </Providers>
      </body>
    </html>
  );
}
