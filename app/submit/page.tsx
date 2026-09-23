import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SubmitForm } from "@/components/submit-form";
import { categories } from "@/lib/data";
import { ui } from "@/lib/ui";

export const metadata: Metadata = {
  title: "Submit a tool",
  description:
    "Suggest an open-source AI tool. The form checks the basics against GitHub before a maintainer reviews it by hand.",
  alternates: { canonical: "/submit" },
  robots: { index: false, follow: true },
};

export default function SubmitPage() {
  return (
    <article>
      <PageHeader
        crumbs={[{ name: "Submit a tool", href: "/submit" }]}
        title="Submit a tool"
        lede="The form checks the basics against GitHub as you type. Everything that passes is queued for a maintainer who reviews it by hand."
      />

      <div className={ui.headerGap}>
        <Section title="Criteria">
          <ul className="list-disc space-y-1 pl-5 marker:text-fg-muted">
            <li>A public repository on GitHub, not archived, with a README that explains the tool.</li>
            <li>An OSI-approved license (MIT, Apache-2.0, GPL, AGPL, BSD, MPL…).</li>
            <li>Useful on its own: an app, library or runtime, not a thin wrapper or a list of links.</li>
            <li>At least 90 days old, so it can receive a Health Score.</li>
          </ul>
        </Section>

        <Section title="The form">
          <SubmitForm categories={categories.map(({ slug, name }) => ({ slug, name }))} />
        </Section>

        <Section title="What happens next">
          <p className="max-w-[65ch] text-[15px] leading-relaxed text-pretty">
            A maintainer checks the submission against the criteria, writes the listing, refreshes the GitHub data
            and publishes. There is no timeline and no shortcut: paying never skips the checks and never changes a
            Health Score.
          </p>
        </Section>
      </div>
    </article>
  );
}
