import { alternatives, categories, toolsInCategory } from "@/lib/data";
import { siteName, siteUrl } from "@/lib/format";

export const dynamic = "force-static";

// Plain-text index for LLM crawlers (llmstxt.org): one line per tool, grouped by category.
export function GET() {
  const lines = [
    `# ${siteName}`,
    "",
    "> A small, hand-picked directory of open-source AI tools. Each tool is reviewed by hand and has a Health Score built from GitHub stars and commit activity.",
    "",
    `- [How the Health Score works](${siteUrl}/health-score)`,
    `- [How sponsored listings work](${siteUrl}/sponsor)`,
  ];
  for (const c of categories) {
    const list = toolsInCategory(c.slug);
    if (!list.length) continue;
    lines.push("", `## ${c.name}`, "");
    for (const t of list) {
      const license = t.license ? ` (${t.license})` : "";
      lines.push(`- [${t.name}](${siteUrl}/tool/${t.slug}): ${t.tagline}${license}`);
    }
  }
  if (alternatives.length) {
    lines.push("", "## Open-source alternatives", "");
    for (const a of alternatives) {
      lines.push(`- [Alternatives to ${a.name}](${siteUrl}/alternative-to/${a.slug}): ${a.tools.length} tools`);
    }
  }
  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
