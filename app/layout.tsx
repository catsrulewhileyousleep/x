import type { Metadata } from "next";
import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { commands, indexableCategories, snapshotAt } from "@/lib/data";
import { CommandPalette } from "@/components/command-palette";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle, themeScript } from "@/components/theme";
import { InlineScript } from "@/components/inline-script";
import { formatDate, repoUrl, siteName, siteUrl, submitUrl } from "@/lib/format";
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={interTight.variable} suppressHydrationWarning>
      <head>
        <InlineScript html={themeScript} />
      </head>
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          href="#main"
          className="absolute top-3 -left-[999px] z-10 rounded-md bg-fg px-3 py-2 text-[13px] font-medium text-canvas focus:left-3"
        >
          Skip to content
        </a>

        <header className="mx-auto grid w-full max-w-5xl grid-cols-[1fr_auto] items-center gap-y-1 px-5 pt-4 pb-2 sm:flex sm:gap-6 sm:px-8 sm:py-5">
          <Link href="/" className="-mx-1 px-1 py-2 text-[15px] font-semibold tracking-tight">
            {siteName}
          </Link>
          <nav
            aria-label="Main"
            className="col-span-2 row-start-2 -ml-2.5 flex items-center gap-0.5 sm:row-auto sm:ml-0 sm:flex-1"
          >
            <NavLink href="/alternative-to">Alternatives</NavLink>
            <NavLink href="/health-score">Health Score</NavLink>
          </nav>
          <div className="-mr-2 flex items-center gap-0.5">
            <CommandPalette commands={commands()} />
            <ThemeToggle />
          </div>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 pt-8 pb-24 sm:px-8 sm:pt-14">
          {children}
        </main>

        <footer className="border-t border-hairline">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-5 py-12 text-[13px] sm:flex-row sm:justify-between sm:px-8">
            <nav aria-label="Categories">
              <ul className="grid grid-cols-2 gap-x-10 gap-y-2">
                {indexableCategories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/category/${c.slug}`} className="text-fg-muted hover:text-fg">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="space-y-2 text-fg-muted sm:text-right">
              <p>GitHub data from {formatDate(snapshotAt)}</p>
              <p>
                <a href={submitUrl} className="text-fg hover:underline">
                  Submit a tool
                </a>
                <span aria-hidden="true"> · </span>
                <a href={repoUrl} className="text-fg hover:underline">
                  Source code
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
