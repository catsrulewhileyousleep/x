import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { tools } from "@/lib/data";
import { repoUrl } from "@/lib/format";
import { ui } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Sponsor a listing",
  description:
    "A sponsored listing is pinned at the top of its category and labeled. It never affects a Health Score or the review criteria.",
  alternates: { canonical: "/sponsor" },
};

export default function SponsorPage() {
  const sponsored = tools.filter((t) => t.sponsored);
  return (
    <article>
      <PageHeader
        crumbs={[{ name: "Sponsor", href: "/sponsor" }]}
        title="Sponsor a listing"
        lede="One sponsored slot per category: pinned above the Health Score order, with a small text label. Nothing else about the listing changes."
      />

      <div className={ui.headerGap}>
        <Section title="What a sponsor gets">
          <ul className="list-disc space-y-1 pl-5 marker:text-fg-muted">
            <li>The listing is pinned at the top of one category page.</li>
            <li>A small “Sponsored” text label beside the tool name — no badge, no extra colors, no ad block.</li>
            <li>A plain link on this page under “Current sponsored listings”.</li>
          </ul>
        </Section>

        <Section title="What it never buys">
          <ul className="list-disc space-y-1 pl-5 marker:text-fg-muted">
            <li>A Health Score. Scores are computed from GitHub data by script and cannot be edited.</li>
            <li>A listing that fails the criteria. Sponsored tools are checked like any other.</li>
            <li>A higher place in search results, home pages or tool pages beyond the label and the category pin.</li>
          </ul>
        </Section>

        <Section title="Current sponsored listings">
          {sponsored.length === 0 ? (
            <p>None today. When there is one, it is named here and labeled everywhere it appears.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 marker:text-fg-muted">
              {sponsored.map((t) => (
                <li key={t.slug}>
                  <Link href={`/tool/${t.slug}`} className={ui.link}>
                    {t.name}
                  </Link>{" "}
                  — pinned in {t.categoryName}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Get in touch">
          <p className="max-w-[65ch] text-[15px] leading-relaxed text-pretty">
            One slot per category, first come first served, and this page always names every sponsor. Write to the
            maintainer through the{" "}
            <a href={repoUrl} className={ui.link}>
              repository profile
            </a>{" "}
            to start.
          </p>
        </Section>
      </div>
    </article>
  );
}
