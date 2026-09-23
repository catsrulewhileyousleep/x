import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { ui } from "@/lib/ui";
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
      <PageHeader
        crumbs={[{ name: "Categories", href: "/category" }]}
        title="Categories"
        lede="Open-source AI tools, grouped by what they do."
      />

      <div className={ui.headerGap}>
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
