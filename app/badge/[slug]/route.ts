import { tools, getTool } from "@/lib/data";
import { healthLevel } from "@/lib/health";

export const dynamicParams = false;

// The segment includes the extension so the public URL reads /badge/<slug>.svg.
export function generateStaticParams() {
  return tools.map((t) => ({ slug: `${t.slug}.svg` }));
}

// sRGB hex of the dark-theme health tokens; README renderers are not guaranteed to support oklch.
const fill = { high: "#22c373", mid: "#eab532", low: "#e94646", none: "#868686" } as const;

export async function GET(_req: Request, { params }: RouteContext<"/badge/[slug]">) {
  const tool = getTool((await params).slug.replace(/\.svg$/, ""));
  if (!tool) return new Response("Not found", { status: 404 });

  const h = tool.health;
  const value = h.status === "scored" ? String(h.score) : "n/a";
  const color = h.status === "scored" ? fill[healthLevel(h.score)] : fill.none;
  const label = "health";
  // Fixed-width estimate at 11px Verdana, the de facto badge font.
  const lw = 50;
  const vw = 12 + value.length * 7;
  const w = lw + vw;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${label}: ${value}">
<title>${label}: ${value}</title>
<clipPath id="r"><rect width="${w}" height="20" rx="3"/></clipPath>
<g clip-path="url(#r)"><rect width="${lw}" height="20" fill="#141414"/><rect x="${lw}" width="${vw}" height="20" fill="${color}"/></g>
<g font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" text-anchor="middle">
<text x="${lw / 2}" y="14" fill="#f8f8f8">${label}</text>
<text x="${lw + vw / 2}" y="14" fill="#070707">${value}</text>
</g>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Snapshots refresh at most daily; let CDNs and GitHub's image proxy cache accordingly.
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
