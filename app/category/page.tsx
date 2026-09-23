import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HubList } from "@/components/hub-list";
import { categories, toolsInCategory } from "@/lib/data";

export const metadata: Metadata = {
  title: "Categories",
  description: "Every category of open-source AI tools in the directory, from coding agents to text to speech.",
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
        {list.length} groups of tools, each sorted by Health Score.
      </p>
      <HubList
        label="Categories"
        items={list.map((c) => ({
          href: `/category/${c.slug}`,
          title: c.name,
          description: c.intro,
          count: c.tools.length,
          examples: c.tools.slice(0, 3).map((t) => t.name),
        }))}
      />
    </>
  );
}
