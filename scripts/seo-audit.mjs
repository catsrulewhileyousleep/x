// On-page SEO audit over every URL in the sitemap. Run against a server: `pnpm dev` or `pnpm start`, then
// `BASE=http://localhost:3000 pnpm seo:audit`. Exits non-zero when any page has an issue.
const base = process.env.BASE ?? "http://127.0.0.1:3000";
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text();
const paths = [...sitemap.matchAll(/<loc>[^<]*?(\/[^<]*)<\/loc>/g)].map((m) => new URL(m[1], base).pathname);
const known = new Set(paths);
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const issues = [];
const titles = new Map();
const descs = new Map();
let pages = 0;
for (const p of paths) {
  const html = await (await fetch(base + p)).text();
  pages++;
  const title = decode(html.match(/<title>(.*?)<\/title>/s)?.[1] ?? "");
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const h1s = [...html.matchAll(/<h1[^>]*>/g)].length;
  const levels = [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => +m[1]);
  const lds = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
  const internal = [...html.matchAll(/href="(\/(?:tool|category|alternative-to)[^"#?]*)"/g)].map((m) => m[1]);
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\balt=/.test(m[0]));
  const noindex = /<meta name="robots" content="[^"]*noindex/.test(html);
  const ogUrl = html.match(/<meta property="og:url" content="([^"]*)"/)?.[1];
  if (!title) issues.push([p, "missing <title>"]);
  if (title.length > 60) issues.push([p, `title ${title.length} chars: ${title}`]);
  if (!desc) issues.push([p, "missing meta description"]);
  if (desc.length > 160) issues.push([p, `description ${desc.length} chars`]);
  if (!canonical || new URL(canonical).pathname !== p) issues.push([p, `canonical ${canonical}`]);
  if (h1s !== 1) issues.push([p, `${h1s} h1`]);
  levels.forEach((l, i) => { if (i && l > levels[i - 1] + 1) issues.push([p, `heading skips h${levels[i - 1]}→h${l}`]); });
  for (const m of lds) { try { JSON.parse(m[1]); } catch { issues.push([p, "invalid JSON-LD"]); } }
  for (const href of internal) if (!known.has(href)) issues.push([p, `link to non-sitemap page ${href}`]);
  if (imgs.length) issues.push([p, `${imgs.length} <img> without alt`]);
  if (noindex) issues.push([p, "noindex page listed in sitemap"]);
  if (ogUrl && ogUrl !== canonical) issues.push([p, `og:url ${ogUrl} differs from canonical`]);
  if (p.startsWith("/tool/")) {
    if (!ogUrl) issues.push([p, "missing og:url"]);
    if (desc.endsWith("…")) issues.push([p, "description cut mid-sentence"]);
    if (!lds.some((m) => m[1].includes('"SoftwareApplication"'))) issues.push([p, "missing SoftwareApplication JSON-LD"]);
  }
  titles.set(title, [...(titles.get(title) ?? []), p]);
  descs.set(desc, [...(descs.get(desc) ?? []), p]);
}
for (const [t, ps] of titles) if (ps.length > 1) issues.push([ps.join(", "), `duplicate title "${t}"`]);
for (const [, ps] of descs) if (ps.length > 1) issues.push([ps.join(", "), `duplicate description`]);

console.log(`${pages} pages audited, ${issues.length} issues`);
for (const [p, m] of issues.slice(0, 40)) console.log(" ", p, "—", m);
process.exitCode = issues.length ? 1 : 0;
