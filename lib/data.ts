import toolsJson from "@/data/tools.json";
import categoriesJson from "@/data/categories.json";
import alternativesJson from "@/data/alternatives.json";
import snapshotJson from "@/data/github-snapshot.json";
import { computeHealth, type Health } from "@/lib/health";

export type Category = { slug: string; name: string; title: string; intro: string };

export type AlternativeTarget = {
  slug: string;
  name: string;
  category: string;
  intro: string;
  freeTier?: { answer: string; sourceUrl: string };
};

type ToolEntry = {
  slug: string;
  name: string;
  repo: string;
  category: string;
  tagline: string;
  description: string[];
  tags: string[];
  licenseOverride?: { spdx: string; note: string };
  alternativeTo: { slug: string; why: string }[];
};

type RepoSnapshot = {
  fullName: string;
  stars: number;
  license: string | null;
  archived: boolean;
  isPrivate: boolean;
  defaultBranch: string;
  lastCommitAt: string | null;
  createdAt: string;
  language: string | null;
  homepage: string | null;
  avatarUrl: string | null;
};

export type Tool = Omit<ToolEntry, "licenseOverride"> & {
  categoryName: string;
  githubUrl: string;
  website: string | null;
  avatarUrl: string | null;
  stars: number | null;
  license: string | null;
  licenseNote: string | null;
  lastCommitAt: string | null;
  createdAt: string | null;
  language: string | null;
  health: Health;
};

/** Alternative-to pages need enough real options to be worth more than a list of names. */
export const MIN_ALTERNATIVES = 3;
/** Category pages below this are kept out of the index. */
export const MIN_INDEXABLE = 2;

const snapshot = snapshotJson as { fetchedAt: string; repos: Record<string, RepoSnapshot | null> };
export const snapshotAt = snapshot.fetchedAt;

export const categories = categoriesJson as Category[];
const alternativeTargets = alternativesJson as AlternativeTarget[];
const entries = toolsJson as ToolEntry[];

const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));
const targetBySlug = new Map(alternativeTargets.map((t) => [t.slug, t]));

const maxStars = Math.max(0, ...Object.values(snapshot.repos).map((r) => r?.stars ?? 0));

// Fail the build on broken references instead of shipping dead links.
for (const e of entries) {
  if (!categoryBySlug.has(e.category)) throw new Error(`${e.slug}: unknown category ${e.category}`);
  for (const a of e.alternativeTo) {
    if (!targetBySlug.has(a.slug)) throw new Error(`${e.slug}: unknown alternative ${a.slug}`);
  }
  if (!(e.repo in snapshot.repos)) throw new Error(`${e.slug}: run scripts/snapshot.mjs`);
}

export const tools: Tool[] = entries.map(({ licenseOverride, ...e }) => {
  const repo = snapshot.repos[e.repo];
  return {
    ...e,
    categoryName: categoryBySlug.get(e.category)!.name,
    githubUrl: `https://github.com/${repo?.fullName ?? e.repo}`,
    website: repo?.homepage ?? null,
    avatarUrl: repo?.avatarUrl ?? null,
    stars: repo?.stars ?? null,
    license: repo?.license ?? licenseOverride?.spdx ?? null,
    licenseNote: repo?.license ? null : (licenseOverride?.note ?? null),
    lastCommitAt: repo?.lastCommitAt ?? null,
    createdAt: repo?.createdAt ?? null,
    language: repo?.language ?? null,
    health: repo
      ? computeHealth(repo, maxStars, snapshot.fetchedAt)
      : { status: "insufficient", reason: "Chưa lấy được dữ liệu GitHub." },
  };
});

export function scoreOf(tool: Tool): number | null {
  return tool.health.status === "scored" ? tool.health.score : null;
}

export function byHealth(a: Tool, b: Tool): number {
  return (scoreOf(b) ?? -1) - (scoreOf(a) ?? -1) || a.name.localeCompare(b.name);
}

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}

export function getCategory(slug: string) {
  return categoryBySlug.get(slug);
}

export function toolsInCategory(slug: string) {
  return tools.filter((t) => t.category === slug).sort(byHealth);
}

export function similarTools(tool: Tool, limit = 4) {
  return toolsInCategory(tool.category)
    .filter((t) => t.slug !== tool.slug)
    .slice(0, limit);
}

export type Alternative = AlternativeTarget & {
  tools: (Tool & { why: string })[];
};

export const alternatives: Alternative[] = alternativeTargets
  .map((target) => ({
    ...target,
    tools: tools
      .flatMap((t) => {
        const link = t.alternativeTo.find((a) => a.slug === target.slug);
        return link ? [{ ...t, why: link.why }] : [];
      })
      .sort(byHealth),
  }))
  .filter((a) => a.tools.length >= MIN_ALTERNATIVES);

export function getAlternative(slug: string) {
  return alternatives.find((a) => a.slug === slug);
}

/** Published alternative-to pages a tool can link to. */
export function replacesFor(tool: Tool) {
  return tool.alternativeTo.flatMap((a) => {
    const target = getAlternative(a.slug);
    return target ? [{ ...a, name: target.name }] : [];
  });
}

export function relatedAlternatives(current: Alternative, limit = 3) {
  return alternatives
    .filter((a) => a.slug !== current.slug)
    .sort((a, b) => Number(b.category === current.category) - Number(a.category === current.category))
    .slice(0, limit);
}

export const indexableCategories = categories.filter(
  (c) => toolsInCategory(c.slug).length >= MIN_INDEXABLE,
);

/** Slim, serializable shape for the client list view. */
export function toRow(t: Tool, why?: string) {
  return {
    slug: t.slug,
    name: t.name,
    tagline: t.tagline,
    category: t.category,
    categoryName: t.categoryName,
    tags: t.tags,
    license: t.license,
    stars: t.stars,
    health: t.health,
    avatarUrl: t.avatarUrl,
    ...(why ? { why } : {}),
  };
}
