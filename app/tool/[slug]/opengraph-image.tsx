import { ogContentType, ogHealth, ogImage, ogSize, type OgMeta } from "@/lib/og";
import { getTool, tools } from "@/lib/data";
import { formatStars } from "@/lib/format";
import { healthLevel } from "@/lib/health";

export const alt = "Tool summary with Health Score, stars and license";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const tool = getTool((await params).slug)!;
  const h = tool.health;
  const meta: OgMeta[] = [
    h.status === "scored"
      ? { label: `Health ${h.score}`, dot: ogHealth[healthLevel(h.score)] }
      : { label: "Health: not enough data" },
    { label: `${formatStars(tool.stars)} stars` },
    ...(tool.license ? [{ label: tool.license }] : []),
  ];
  return ogImage({ eyebrow: tool.categoryName, title: tool.name, subtitle: tool.tagline, meta });
}
