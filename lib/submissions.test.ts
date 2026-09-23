import assert from "node:assert/strict";
import { test } from "node:test";
import { parseRepo, repoProblems, slugify, type Submission } from "./submissions.ts";
import { queueSubmission } from "./submission-queue.ts";

test("parseRepo accepts the shapes people paste", () => {
  assert.equal(parseRepo("https://github.com/cline/cline"), "cline/cline");
  assert.equal(parseRepo("https://github.com/cline/cline/tree/main"), "cline/cline");
  assert.equal(parseRepo("github.com/cline/cline"), "cline/cline");
  assert.equal(parseRepo("cline/cline.git"), "cline/cline");
  assert.equal(parseRepo("cline/cline/"), "cline/cline");
  assert.equal(parseRepo("https://gitlab.com/cline/cline"), null);
  assert.equal(parseRepo("not a repo"), null);
});

test("repoProblems states each unmet criterion", () => {
  const now = Date.parse("2026-09-23");
  const fine = {
    fullName: "a/b",
    stars: 100,
    license: "MIT",
    archived: false,
    isPrivate: false,
    createdAt: "2024-01-01",
  };
  assert.deepEqual(repoProblems(fine, now), []);
  const bad = { ...fine, license: null, archived: true, createdAt: "2026-09-01" };
  assert.equal(repoProblems(bad, now).length, 3);
});

test("slugify matches the tool slug convention", () => {
  assert.equal(slugify("Some Tool — Name"), "some-tool-name");
  assert.equal(slugify("  Ollama "), "ollama");
});

test("queueSubmission creates a branch, commits the JSON and opens a PR", async () => {
  const submission: Submission = {
    slug: "example",
    name: "Example",
    repo: "owner/example",
    category: "coding-agents",
    tagline: "Does one thing well",
    github: { stars: 10, license: "MIT", createdAt: "2024-01-01" },
    submittedAt: "2026-09-23T00:00:00.000Z",
  };
  type Call = { method: string; path: string; body: Record<string, unknown> | null };
  const calls: Call[] = [];
  const fake = (async (url: string | URL, init: RequestInit = {}) => {
    const path = new URL(url).pathname;
    calls.push({
      method: init.method ?? "GET",
      path,
      body: init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null,
    });
    if (path === "/repos/directory/directory") return { ok: true, json: async () => ({ default_branch: "main" }) };
    if (path === "/repos/directory/directory/git/ref/heads/main")
      return { ok: true, json: async () => ({ object: { sha: "abc123" } }) };
    if (path === "/repos/directory/directory/git/refs") return { ok: true, status: 201, json: async () => ({}) };
    if (path.startsWith("/repos/directory/directory/contents/data/submissions/"))
      return { ok: true, json: async () => ({}) };
    if (path === "/repos/directory/directory/pulls")
      return { ok: true, json: async () => ({ html_url: "https://github.com/directory/directory/pull/9" }) };
    return { ok: false, status: 404, json: async () => ({ message: "nope" }) };
  }) as unknown as typeof fetch;

  const result = await queueSubmission(submission, {
    token: "t",
    repo: "directory/directory",
    fetch: fake,
    now: () => 0x100,
  });
  assert.deepEqual(result, { ok: true, prUrl: "https://github.com/directory/directory/pull/9" });
  assert.deepEqual(
    calls.map((c) => `${c.method} ${c.path}`),
    [
      "GET /repos/directory/directory",
      "GET /repos/directory/directory/git/ref/heads/main",
      "POST /repos/directory/directory/git/refs",
      "PUT /repos/directory/directory/contents/data/submissions/example-74.json",
      "POST /repos/directory/directory/pulls",
    ],
  );
  assert.equal(calls[2]!.body!.ref, "refs/heads/submissions/example-74");
  assert.equal(calls[2]!.body!.sha, "abc123");
  assert.equal(calls[3]!.body!.branch, "submissions/example-74");
  assert.equal(JSON.parse(Buffer.from(String(calls[3]!.body!.content), "base64").toString()).slug, "example");
  assert.equal(calls[4]!.body!.base, "main");
  assert.equal(calls[4]!.body!.head, "submissions/example-74");
});
