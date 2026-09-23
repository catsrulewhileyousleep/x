import type { Submission } from "./submissions.ts";

// Queues a submission as a one-file pull request against the directory repository.
// The submitter only ever sees the site; the PR queue is the moderation backend.

const API = "https://api.github.com";

export type QueueDeps = { token: string; repo: string; fetch?: typeof fetch; now?: () => number };

export async function queueSubmission(
  submission: Submission,
  { token, repo, fetch: doFetch = fetch, now = Date.now }: QueueDeps,
): Promise<{ ok: true; prUrl: string } | { ok: false; error: string }> {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    Authorization: `Bearer ${token}`,
  };
  const call = async (path: string, init?: RequestInit) => {
    const res = await doFetch(`${API}${path}`, {
      ...init,
      headers: { ...headers, ...(init?.body ? { "Content-Type": "application/json" } : {}) },
    });
    const body = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) throw new Error(`${res.status} ${path}: ${body?.message ?? ""}`);
    return body;
  };

  const stamp = now().toString(36);
  const branch = `submissions/${submission.slug}-${stamp}`;
  const file = `data/submissions/${submission.slug}-${stamp}.json`;
  try {
    const meta = await call(`/repos/${repo}`);
    const base = meta.default_branch;
    const ref = await call(`/repos/${repo}/git/ref/heads/${base}`);
    await call(`/repos/${repo}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: ref.object.sha }),
    });
    await call(`/repos/${repo}/contents/${file}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `submission: ${submission.name}`,
        branch,
        content: Buffer.from(`${JSON.stringify(submission, null, 2)}\n`).toString("base64"),
      }),
    });
    const pr = await call(`/repos/${repo}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: `Submission: ${submission.name}`,
        head: branch,
        base,
        body: [
          `**${submission.name}** — ${submission.tagline}`,
          "",
          `- Repository: https://github.com/${submission.repo}`,
          `- Category: \`${submission.category}\``,
          `- License: ${submission.github.license} · Stars: ${submission.github.stars}`,
          submission.replaces
            ? `- Replaces: ${submission.replaces.product} — ${submission.replaces.why}`
            : "- Replaces: —",
          "",
          "Reviewer checklist: check the criteria by hand, write the description and `fit`,",
          "map `replaces` to an existing alternative slug, move the entry into `data/tools.json`,",
          "run `pnpm snapshot`, then close this PR.",
        ].join("\n"),
      }),
    });
    return { ok: true, prUrl: pr.html_url };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "GitHub request failed" };
  }
}
