import { ogContentType, ogImage, ogSize } from "@/lib/og";
import { alternatives, getAlternative } from "@/lib/data";

export const alt = "Open-source alternatives to a closed-source product";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return alternatives.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const alt = getAlternative((await params).slug)!;
  return ogImage({
    eyebrow: "Alternatives",
    title: `${alt.tools.length} open-source alternatives to ${alt.name}`,
    subtitle: alt.tools.slice(0, 4).map((t) => t.name).join(", "),
    meta: [{ label: "Each one checked by an editor" }],
  });
}
