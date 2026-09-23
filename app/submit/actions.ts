"use server";

import { categories } from "@/lib/data";
import { repoSlug } from "@/lib/format";
import { queueSubmission } from "@/lib/submission-queue";
import { parseRepo, repoProblems, slugify, type RepoMeta, type Submission } from "@/lib/submissions";

export type SubmitState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "ok"; message: string; prUrl?: string };

const GH_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

async function fetchRepo(repo: string): Promise<RepoMeta | null> {
  const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: GH_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    fullName: data.full_name,
    stars: data.stargazers_count,
    license:
      data.license?.spdx_id && data.license.spdx_id !== "NOASSERTION" ? data.license.spdx_id : null,
    archived: data.archived,
    isPrivate: data.private,
    createdAt: data.created_at,
  };
}

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function submitTool(_prev: SubmitState, formData: FormData): Promise<SubmitState> {
  // Honeypot: bots fill every field; humans never see this one.
  if (field(formData, "website")) return { status: "ok", message: "Thanks. It will be reviewed." };

  const repo = parseRepo(field(formData, "repo"));
  if (!repo) return { status: "error", message: "Enter a GitHub repository, e.g. https://github.com/owner/repo." };

  const name = field(formData, "name");
  const tagline = field(formData, "tagline");
  const category = field(formData, "category");
  const product = field(formData, "product");
  const why = field(formData, "why");

  if (!name || name.length > 60)
    return { status: "error", message: "Give the tool a name of up to 60 characters." };
  if (!tagline || tagline.length > 80)
    return { status: "error", message: "Give a one-line description of up to 80 characters." };
  if (!categories.some((c) => c.slug === category))
    return { status: "error", message: "Choose one of the listed categories." };
  if (product && (!why || why.length > 160))
    return {
      status: "error",
      message: "Name a product it replaces only with one sentence on why (up to 160 characters).",
    };

  // Re-check server-side: the client's verdict is a preview, not the gate.
  const meta = await fetchRepo(repo);
  if (!meta) return { status: "error", message: "The repository could not be found. Is it public?" };
  if (meta.fullName.toLowerCase() !== repo.toLowerCase())
    return { status: "error", message: `The repository has moved to ${meta.fullName}. Submit that instead.` };
  const readme = await fetch(`https://api.github.com/repos/${meta.fullName}/readme`, { headers: GH_HEADERS });
  if (!readme.ok) return { status: "error", message: "The repository has no README, so there is nothing to review." };
  const problems = repoProblems(meta);
  if (problems.length > 0) return { status: "error", message: problems.join(" ") };

  const submission: Submission = {
    slug: slugify(name) || slugify(meta.fullName.split("/")[1] ?? ""),
    name,
    repo: meta.fullName,
    category,
    tagline,
    ...(product && why ? { replaces: { product, why } } : {}),
    github: { stars: meta.stars, license: meta.license ?? "unknown", createdAt: meta.createdAt },
    submittedAt: new Date().toISOString(),
  };

  const token = process.env.SUBMISSIONS_TOKEN;
  if (!token) {
    console.error("submit: SUBMISSIONS_TOKEN is not set; submission dropped:", submission.repo);
    return { status: "error", message: "Submissions are unavailable right now. Please try again later." };
  }
  const queued = await queueSubmission(submission, { token, repo: repoSlug });
  if (!queued.ok) {
    console.error("submit: queueing failed:", queued.error);
    return { status: "error", message: "Submissions are unavailable right now. Please try again later." };
  }
  return {
    status: "ok",
    message: "Submitted for review. A maintainer checks every listing by hand before it is published.",
    prUrl: queued.prUrl,
  };
}
