import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { IndexList } from "@/components/index-list";
import { JsonLd } from "@/components/json-ld";
import { categories, toolsInCategory } from "@/lib/data";
import { siteUrl } from "@/lib/format";

export const metadata: Metadata = {
  title: "Categories of open-source AI tools",
  description: "Browse open-source AI tools by what they do: coding agents, local LLMs, AI search, text to speech and more.",
  alternates: { canonical: "/category" },
};

export default function CategoriesPage() {
  const list = categories
    .map((c) => ({ ...c, tools: toolsInCategory(c.slug) }))
    .filter((c) => c.tools.length > 0);

  return (
    <>
      <Breadcrumbs items={[{ name: "Categories", href: "/category" }]} />
      <h1 className="mt-6 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.03em]">Categories</h1>
      <p className="mt-4 max-w-[60ch] text-[15px] text-pretty text-fg-muted">
        Open-source AI tools, grouped by what they do.
      </p>

      <div className="mt-12">
        <IndexList
          label="Categories"
          columns={{ name: "Category", detail: "Top by Health", count: "Tools" }}
          rows={list.map((c) => ({
            href: `/category/${c.slug}`,
            name: c.name,
            detail: c.tools[0].name,
            count: c.tools.length,
          }))}
        />
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Categories of open-source AI tools",
          numberOfItems: list.length,
          itemListElement: list.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.title,
            url: `${siteUrl}/category/${c.slug}`,
          })),
        }}
      />
    </>
  );
}
