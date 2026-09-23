import { MIN_REPO_AGE_DAYS } from "./health.ts";

// Pure submission helpers shared by the client form (live preview) and the server
// action (authoritative check). Keep this file free of server-only APIs.

export type Submission = {
  slug: string;
  name: string;
  repo: string;
  category: string;
  tagline: string;
  replaces?: { product: string; why: string };
  github: { stars: number; license: string; createdAt: string };
  submittedAt: string;
};

export type RepoMeta = {
  fullName: string;
  stars: number;
  license: string | null;
  archived: boolean;
  isPrivate: boolean;
  createdAt: string;
};

/** Accepts "owner/repo", "https://github.com/owner/repo" and deeper paths. */
export function parseRepo(input: string): string | null {
  const match = input
    .trim()
    .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
    .replace(/^github\.com\//i, "")
    .match(/^([\w.-]+)\/([\w.-]+?)(?:\.git)?(?:\/.*)?$/);
  return match ? `${match[1]}/${match[2]}` : null;
}

export function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Criteria a repository must meet before the submission reaches the queue. */
export function repoProblems(meta: RepoMeta, now = Date.now()): string[] {
  const problems: string[] = [];
  if (meta.isPrivate) problems.push("The repository is private.");
  if (meta.archived) problems.push("The repository is archived.");
  if (!meta.license)
    problems.push("No open-source license could be detected. OSI-approved licenses only.");
  const ageDays = (now - Date.parse(meta.createdAt)) / 86_400_000;
  if (!(ageDays >= MIN_REPO_AGE_DAYS))
    problems.push(`The repository is less than ${MIN_REPO_AGE_DAYS} days old, so it cannot be scored yet.`);
  return problems;
}
