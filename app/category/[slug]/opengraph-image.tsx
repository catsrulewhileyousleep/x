import { ogContentType, ogImage, ogSize } from "@/lib/og";
import { categories, getCategory, toolsInCategory } from "@/lib/data";

export const alt = "Category of open-source AI tools";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const category = getCategory((await params).slug)!;
  const list = toolsInCategory(category.slug);
  return ogImage({
    eyebrow: "Category",
    title: category.title,
    subtitle: list.slice(0, 4).map((t) => t.name).join(", "),
    meta: [{ label: `${list.length} tools, sorted by Health Score` }],
  });
}
