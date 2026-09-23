import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlternativeList } from "@/components/alternative-list";
import { Breadcrumbs } from "@/components/breadcrumbs";
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

  return (
    <>
      <Breadcrumbs
        items={[
          { name: "Categories", href: "/category" },
          { name: category.name, href: `/category/${category.slug}` },
        ]}
      />
      <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em] text-balance">
        {category.title}
      </h1>
      <p className="mt-4 max-w-[60ch] text-[15px] text-pretty text-fg-muted">{category.intro}</p>

      <div className="mt-12">
        <ToolTable rows={list.map((t) => toRow(t))} label={category.title} />
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-16">
          <h2 id="related" className="mb-3 text-[15px] font-medium">
            Related alternatives
          </h2>
          <AlternativeList items={related} label="Related alternatives" />
        </section>
      )}

      <ItemListSchema name={category.title} tools={list} />
    </>
  );
}
