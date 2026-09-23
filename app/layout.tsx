import type { Metadata } from "next";
import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { alternatives, indexableCategories, snapshotAt } from "@/lib/data";
import { formatDate, repoUrl, siteName, siteUrl } from "@/lib/format";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `Công cụ AI mã nguồn mở | ${siteName}`, template: `%s | ${siteName}` },
  description:
    "Danh mục nhỏ, được tuyển chọn thủ công các công cụ AI mã nguồn mở, kèm Health Score minh bạch từ dữ liệu GitHub.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={interTight.variable}>
      <body className="flex min-h-dvh flex-col font-sans">
        <a
          href="#main"
          className="absolute top-3 -left-[999px] z-10 rounded-md bg-fg px-3 py-2 text-[13px] font-medium text-canvas focus:left-3"
        >
          Bỏ qua đến nội dung
        </a>

        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-5 sm:px-8">
          <Link href="/" className="-mx-1 px-1 py-1 text-[15px] font-semibold tracking-tight">
            {siteName}
          </Link>
          <nav aria-label="Chính">
            <Link href="/health-score" className="-mx-1 px-1 py-1 text-fg-muted hover:text-fg">
              Cách tính Health Score
            </Link>
          </nav>
        </header>

        <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 pt-8 pb-24 sm:px-8 sm:pt-14">
          {children}
        </main>

        <footer className="border-t border-hairline">
          <div className="mx-auto grid w-full max-w-5xl gap-10 px-5 py-12 text-[13px] sm:grid-cols-3 sm:px-8">
            <FooterLinks
              title="Danh mục"
              links={indexableCategories.map((c) => ({ href: `/category/${c.slug}`, name: c.name }))}
            />
            <FooterLinks
              title="Lựa chọn thay thế"
              links={alternatives.map((a) => ({ href: `/alternative-to/${a.slug}`, name: a.name }))}
            />
            <div className="text-fg-muted">
              <p>
                Dữ liệu GitHub cập nhật ngày {formatDate(snapshotAt)}. Mọi tool được kiểm tra thủ công
                trước khi đăng.
              </p>
              <p className="mt-3">
                <a href={repoUrl} className="text-fg hover:underline">
                  Mã nguồn và đóng góp
                </a>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function FooterLinks({ title, links }: { title: string; links: { href: string; name: string }[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="font-medium text-fg">{title}</h2>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-fg-muted hover:text-fg">
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
