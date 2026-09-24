// Refreshes the GitHub snapshot; failed repos retain their previous entry for review.
import { readFile, writeFile } from "node:fs/promises";
import { fetchBatch } from "./github-graph.mjs";

const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
if (!token) throw new Error("GITHUB_TOKEN or GH_TOKEN is required for GitHub GraphQL");

const file = new URL("../data/github-snapshot.json", import.meta.url);
const previous = JSON.parse(await readFile(file, "utf8"));
const tools = JSON.parse(await readFile(new URL("../data/tools.json", import.meta.url)));
const repos = [...new Set(tools.map(({ repo }) => repo))];
const out = { fetchedAt: new Date().toISOString(), repos: {}, needsReview: [] };

for (let start = 0; start < repos.length; start += 10) {
  const batch = repos.slice(start, start + 10);
  let results;
  try {
    results = await fetchBatch(batch, token);
  } catch (error) {
    results = batch.map((repo) => ({ repo, snapshot: null, reason: error.message }));
  }
  for (const { repo, snapshot, reason } of results) {
    out.repos[repo] = snapshot ?? previous.repos?.[repo] ?? null;
    if (!snapshot) {
      out.needsReview.push({ repo, reason });
      continue;
    }
    if (snapshot.archived) out.needsReview.push({ repo, reason: "archived" });
    if (snapshot.isPrivate) out.needsReview.push({ repo, reason: "private" });
    if (snapshot.fullName.toLowerCase() !== repo.toLowerCase())
      out.needsReview.push({ repo, reason: `moved to ${snapshot.fullName}` });
  }
}

await writeFile(file, JSON.stringify(out, null, 2) + "\n");
console.log(`Fetched ${repos.length} repos, ${out.needsReview.length} need review.`);
for (const r of out.needsReview) console.log(`needs review: ${r.repo} (${r.reason})`);
