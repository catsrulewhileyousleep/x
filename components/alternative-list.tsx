import { IndexList } from "@/components/index-list";
import type { Alternative } from "@/lib/data";

/** The category column only appears on the hub; inside a category it would repeat the page's subject. */
export function AlternativeList({
  items,
  label,
  showCategory = false,
}: {
  items: Alternative[];
  label: string;
  showCategory?: boolean;
}) {
  return (
    <IndexList
      label={label}
      columns={{ name: "Product", detail: showCategory ? "Category" : undefined, count: "Alternatives" }}
      rows={items.map((a) => ({
        href: `/alternative-to/${a.slug}`,
        name: a.name,
        detail: a.categoryName,
        count: a.tools.length,
      }))}
    />
  );
}
