// Fetches a GitHub snapshot for every repo referenced in data/tools.json.
// Usage: GITHUB_TOKEN=... node scripts/snapshot.mjs
import { readFile, writeFile } from "node:fs/promises";

const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

async function gh(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res;
}

async function snapshot(repo) {
  const meta = await (await gh(`/repos/${repo}`)).json();
  const [commit] = await (
    await gh(`/repos/${meta.full_name}/commits?sha=${meta.default_branch}&per_page=1`)
  ).json();
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

const tools = JSON.parse(await readFile(new URL("../data/tools.json", import.meta.url)));
const repos = tools.map((t) => t.repo);
const out = { fetchedAt: new Date().toISOString(), repos: {} };
for (const repo of repos) {
  try {
    out.repos[repo] = await snapshot(repo);
    console.log("ok", repo);
  } catch (err) {
    // Missing data is recorded, never invented.
    out.repos[repo] = null;
    console.warn("fail", repo, err.message);
  }
}
await writeFile(
  new URL("../data/github-snapshot.json", import.meta.url),
  JSON.stringify(out, null, 2) + "\n",
);
