import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  const best = alt.tools[0];
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
        <ToolTable rows={alt.tools.map((t) => toRow(t, t.why))} label={`Alternatives to ${alt.name}`} />
      </div>

      <section className="mt-16 max-w-[65ch]">
        <h2 className="text-[15px] font-medium">Frequently asked questions</h2>
        <dl className="mt-4 space-y-6">
          <div>
            <dt className="font-medium">What is the best open-source alternative to {alt.name}?</dt>
            <dd className="mt-1 text-pretty text-fg-muted">
              By current Health Score,{" "}
              <Link href={`/tool/${best.slug}`} className="text-fg underline decoration-fg-muted hover:decoration-fg">
                {best.name}
              </Link>{" "}
              ranks first. Health Score only reflects popularity and commit recency, so read each line to
              find the tool that fits how you work.
            </dd>
          </div>
          {alt.freeTier && (
            <div>
              <dt className="font-medium">Is there a free version of {alt.name}?</dt>
              <dd className="mt-1 text-pretty text-fg-muted">
                {alt.freeTier.answer}{" "}
                <a href={alt.freeTier.sourceUrl} rel="nofollow noopener" className="text-fg underline decoration-fg-muted hover:decoration-fg">
                  Source
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-[15px] font-medium">More alternatives</h2>
          <ul className="mt-3 space-y-2">
            {related.map((a) => (
              <li key={a.slug}>
                <Link href={`/alternative-to/${a.slug}`} className="text-fg-muted hover:text-fg">
                  Open-source alternatives to {a.name} ({a.tools.length})
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ItemListSchema name={heading(alt.tools.length, alt.name)} tools={alt.tools} />
    </>
  );
}
