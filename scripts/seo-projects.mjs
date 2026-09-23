// Per-project SEO audit of every tool entry, straight from data/ (no server needed).
// `pnpm seo:projects` prints one row per tool; errors exit non-zero, warnings do not.
// Rules and thresholds are explained in .agents/skills/seo-content/SKILL.md.
import tools from "../data/tools.json" with { type: "json" };
import snapshot from "../data/github-snapshot.json" with { type: "json" };
import { licenseSuffix, metaDescription } from "../lib/seo.ts";

const SITE_SUFFIX = " | AI Directory";
const TITLE_MAX = 60;
const DESC_MIN = 70;
const DESC_GOOD = 110;
const THIN_WORDS = 30;
const BANNED = /!|\b(revolutionary|blazing|game-chang|cutting-edge|best-in-class|ultimate)/i;

const rows = [];
const seen = { tagline: new Map(), desc: new Map() };

for (const t of tools) {
  const repo = snapshot.repos[t.repo];
  const license = repo?.license ?? t.licenseOverride?.spdx ?? null;
  const title = `${t.name} — ${t.tagline}`;
  const desc = metaDescription(t.description.join(" "), licenseSuffix(license));
  const words = t.description.join(" ").split(/\s+/).length;
  const errors = [];
  const warnings = [];

  if (title.length > TITLE_MAX) errors.push(`title ${title.length} > ${TITLE_MAX} chars`);
  if (desc.endsWith("…")) errors.push("description cut mid-sentence");
  if (desc.length < DESC_MIN) errors.push(`description ${desc.length} < ${DESC_MIN} chars`);
  else if (desc.length < DESC_GOOD) warnings.push(`description ${desc.length} chars, room for more`);
  if (BANNED.test(`${t.tagline} ${t.description.join(" ")}`)) errors.push("hype wording (CONTRIBUTING.md)");
  if (t.tagline.toLowerCase().split(/[^a-z0-9.+-]+/).includes(t.name.toLowerCase())) warnings.push("tagline repeats the name");
  if (words < THIN_WORDS) warnings.push(`About is ${words} words`);
  if (t.tags.length < 2) warnings.push("fewer than 2 tags");
  if (!repo) errors.push("no GitHub snapshot");

  for (const [key, value] of [["tagline", t.tagline], ["desc", desc]]) {
    const other = seen[key].get(value);
    if (other) errors.push(`${key === "desc" ? "description" : "tagline"} duplicates ${other}`);
    else seen[key].set(value, t.slug);
  }

  rows.push({
    slug: t.slug,
    title: `${title.length}${title.length + SITE_SUFFIX.length > TITLE_MAX ? "" : "+"}`,
    desc: desc.length,
    words,
    alts: t.alternativeTo.length,
    errors,
    warnings,
  });
}

const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad("tool", 24)}${pad("title", 7)}${pad("desc", 6)}${pad("words", 7)}${pad("alts", 6)}notes`);
for (const r of rows) {
  const notes = [...r.errors.map((e) => `✗ ${e}`), ...r.warnings.map((w) => `· ${w}`)].join("; ");
  console.log(`${pad(r.slug, 24)}${pad(r.title, 7)}${pad(r.desc, 6)}${pad(r.words, 7)}${pad(r.alts, 6)}${notes}`);
}
const errorCount = rows.reduce((n, r) => n + r.errors.length, 0);
const warnCount = rows.reduce((n, r) => n + r.warnings.length, 0);
console.log(`\n${rows.length} projects, ${errorCount} errors, ${warnCount} warnings. "+" = title keeps the site suffix.`);
process.exitCode = errorCount ? 1 : 0;
