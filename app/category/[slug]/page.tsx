import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlternativeList } from "@/components/alternative-list";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SponsoredSlotRow } from "@/components/sponsored-slot";
import { ui } from "@/lib/ui";
import { ItemListSchema } from "@/components/item-list-schema";
import { ToolTable } from "@/components/tool-table";
import { alternativesInCategory, categories, getCategory, MIN_INDEXABLE, toRow, toolsInCategory } from "@/lib/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  const count = toolsInCategory(category.slug).length;
  return {
    title: category.title,
    description: category.intro,
    alternates: { canonical: `/category/${category.slug}` },
    robots: count < MIN_INDEXABLE ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const category = getCategory((await params).slug);
  if (!category) notFound();
  const list = toolsInCategory(category.slug);
  const related = alternativesInCategory(category.slug);
  const hasSponsor = list.some((t) => t.sponsored);

  return (
    <>
      <PageHeader
        crumbs={[
          { name: "Categories", href: "/category" },
          { name: category.name, href: `/category/${category.slug}` },
        ]}
        title={category.title}
        lede={category.intro}
      />

      <div className={ui.headerGap}>
        <ToolTable
          rows={list.map((t) => toRow(t))}
          label={category.title}
          pinSponsored
          lead={hasSponsor ? undefined : <SponsoredSlotRow categoryName={category.name} />}
        />
        {list.some((t) => t.sponsored) && (
          <p className="mt-3 text-[13px] text-fg-muted">
            Sponsored listings are pinned and labeled. They never affect a Health Score.{" "}
            <Link href="/sponsor" className={ui.link}>
              How sponsoring works
            </Link>
          </p>
        )}
      </div>

      {related.length > 0 && (
        <Section title="Related alternatives">
          <AlternativeList items={related} label="Related alternatives" />
        </Section>
      )}

      <ItemListSchema name={category.title} tools={list} />
    </>
  );
}
