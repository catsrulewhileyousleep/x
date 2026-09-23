import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativeList } from "@/components/alternative-list";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ItemListSchema } from "@/components/item-list-schema";
import { ToolTable } from "@/components/tool-table";
import { alternatives, getAlternative, relatedAlternatives, toRow } from "@/lib/data";

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
    description: alt.intro,
    alternates: { canonical: `/alternative-to/${alt.slug}` },
  };
}

export default async function AlternativePage({ params }: PageProps<"/alternative-to/[slug]">) {
  const alt = getAlternative((await params).slug);
  if (!alt) notFound();
  const related = relatedAlternatives(alt);

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Alternatives", href: "/alternative-to" },
          { name: alt.name, href: `/alternative-to/${alt.slug}` },
        ]}
      />
      <h1 className="mt-6 max-w-[22ch] text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
        {heading(alt.tools.length, alt.name)}
      </h1>
      <p className="mt-4 max-w-[60ch] text-[15px] text-pretty text-fg-muted">{alt.intro}</p>

      <div className="mt-12">
        <ToolTable rows={alt.tools.map((t) => toRow(t, t.why))} label={`${alt.name} alternatives`} />
      </div>

      <section aria-labelledby="free" className="mt-16 max-w-[65ch]">
        <h2 id="free" className="text-[15px] font-medium">
          Is there a free version of {alt.name}?
        </h2>
        <p className="mt-2 text-pretty text-fg-muted">
          {alt.freeTier.answer}{" "}
          <a
            href={alt.freeTier.sourceUrl}
            rel="nofollow noopener"
            className="text-fg underline decoration-fg-muted underline-offset-[0.2em] hover:decoration-fg"
          >
            Source
          </a>
        </p>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="mb-3 text-[15px] font-medium">
            Related alternatives
          </h2>
          <AlternativeList items={related} label="Related alternatives" />
        </section>
      )}

      <ItemListSchema name={heading(alt.tools.length, alt.name)} tools={alt.tools} />
    </>
  );
}
