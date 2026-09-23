// Fetches a GitHub snapshot for every repo referenced in data/tools.json.
// Usage: GITHUB_TOKEN=... node scripts/snapshot.mjs
// Repos that fail, disappear or get archived are listed under `needsReview`; a failed fetch
// keeps the previous entry so one bad request never wipes good data.
import { readFile, writeFile } from "node:fs/promises";

const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) {
    const err = new Error(`${res.status} ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

async function snapshot(repo) {
  const meta = await gh(`/repos/${repo}`);
  const [commit] = await gh(`/repos/${meta.full_name}/commits?sha=${meta.default_branch}&per_page=1`);
  const spdx = meta.license?.spdx_id;
  return {
    fullName: meta.full_name,
    stars: meta.stargazers_count,
    license: spdx && spdx !== "NOASSERTION" ? spdx : null,
    archived: meta.archived,
    isPrivate: meta.private,
    defaultBranch: meta.default_branch,
    lastCommitAt: commit?.commit?.committer?.date ?? null,
    createdAt: meta.created_at,
    language: meta.language,
    homepage: meta.homepage || null,
    avatarUrl: meta.owner?.avatar_url ?? null,
  };
}

const file = new URL("../data/github-snapshot.json", import.meta.url);
const previous = await readFile(file, "utf8").then(JSON.parse).catch(() => ({ repos: {} }));
const tools = JSON.parse(await readFile(new URL("../data/tools.json", import.meta.url)));

const out = { fetchedAt: new Date().toISOString(), repos: {}, needsReview: [] };
for (const { repo } of tools) {
  try {
    const snap = await snapshot(repo);
    out.repos[repo] = snap;
    if (snap.archived) out.needsReview.push({ repo, reason: "archived" });
    if (snap.isPrivate) out.needsReview.push({ repo, reason: "private" });
    if (snap.fullName.toLowerCase() !== repo.toLowerCase()) {
      out.needsReview.push({ repo, reason: `moved to ${snap.fullName}` });
    }
  } catch (err) {
    out.repos[repo] = previous.repos?.[repo] ?? null;
    out.needsReview.push({ repo, reason: err.status === 404 ? "not found or private" : err.message });
  }
}

await writeFile(file, JSON.stringify(out, null, 2) + "\n");
console.log(`Fetched ${tools.length} repos, ${out.needsReview.length} need review.`);
for (const r of out.needsReview) console.log(`needs review: ${r.repo} (${r.reason})`);
