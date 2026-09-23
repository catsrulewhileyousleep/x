import { JsonLd } from "@/components/json-ld";
import type { Tool } from "@/lib/data";
import { siteUrl } from "@/lib/format";

/** Items must be passed in the order they are displayed by default. */
export function ItemListSchema({ name, tools }: { name: string; tools: Tool[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name,
        numberOfItems: tools.length,
        itemListElement: tools.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.name,
          url: `${siteUrl}/tool/${t.slug}`,
        })),
      }}
    />
  );
}
