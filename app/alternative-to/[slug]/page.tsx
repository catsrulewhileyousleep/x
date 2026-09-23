import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativeList } from "@/components/alternative-list";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { ui } from "@/lib/ui";
import { ItemListSchema } from "@/components/item-list-schema";
import { ToolTable } from "@/components/tool-table";
import { alternatives, getAlternative, relatedAlternatives, toRow } from "@/lib/data";
import { clip } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return alternatives.map((a) => ({ slug: a.slug }));
}

const heading = (count: number, name: string) => `${count} open-source alternatives to ${name}`;

export async function generateMetadata({ params }: PageProps<"/alternative-to/[slug]">): Promise<Metadata> {
  const alt = getAlternative((await params).slug);
  if (!alt) return {};
  return {
    title: heading(alt.tools.length, alt.name),
    description: clip(alt.intro, 155),
    alternates: { canonical: `/alternative-to/${alt.slug}` },
  };
}

export default async function AlternativePage({ params }: PageProps<"/alternative-to/[slug]">) {
  const alt = getAlternative((await params).slug);
  if (!alt) notFound();
  const related = relatedAlternatives(alt);

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Alternatives", href: "/alternative-to" },
          { name: alt.name, href: `/alternative-to/${alt.slug}` },
        ]}
        title={heading(alt.tools.length, alt.name)}
        lede={alt.intro}
      />

      <div className={ui.headerGap}>
        <ToolTable rows={alt.tools.map((t) => toRow(t, t.why))} label={`${alt.name} alternatives`} />
      </div>

      <Section title={`Is there a free version of ${alt.name}?`} narrow>
        <p className="text-[15px] leading-relaxed text-pretty">
          {alt.freeTier.answer}{" "}
          <a href={alt.freeTier.sourceUrl} rel="nofollow noopener" className={ui.link}>
            Source
          </a>
        </p>
      </Section>

      {related.length > 0 && (
        <Section title="Related alternatives">
          <AlternativeList items={related} label="Related alternatives" />
        </Section>
      )}

      <ItemListSchema name={heading(alt.tools.length, alt.name)} tools={alt.tools} />
    </>
  );
}
