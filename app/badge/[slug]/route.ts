import { tools, getTool } from "@/lib/data";
import { badgeSvg } from "@/lib/badge";

export const dynamicParams = false;

// The segment includes the extension so the public URL reads /badge/<slug>.svg.
export function generateStaticParams() {
  return tools.map((t) => ({ slug: `${t.slug}.svg` }));
}

export async function GET(_req: Request, { params }: RouteContext<"/badge/[slug]">) {
  const tool = getTool((await params).slug.replace(/\.svg$/, ""));
  if (!tool) return new Response("Not found", { status: 404 });
  return new Response(badgeSvg(tool.health), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Snapshots refresh at most daily; let CDNs and GitHub's image proxy cache accordingly,
      // and serve a stale badge for up to a week while the new one propagates.
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
