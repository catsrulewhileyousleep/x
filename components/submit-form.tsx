"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { submitTool, type SubmitState } from "@/app/submit/actions";
import { formatNumber } from "@/lib/format";
import { parseRepo, repoProblems, type RepoMeta } from "@/lib/submissions";
import { ui } from "@/lib/ui";

type Check =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "not-repo" }
  | { status: "listed"; slug: string; name: string }
  | { status: "unreachable" }
  | { status: "checked"; meta: RepoMeta | null; problems: string[]; hasReadme: boolean | null };

// Only the async result is state; everything before it is derived from the input,
// keyed by repo so a stale answer never shows for a newer URL.
type AsyncCheck =
  | { status: "idle" }
  | { status: "unreachable"; repo: string }
  | { status: "checked"; repo: string; meta: RepoMeta | null; problems: string[]; hasReadme: boolean | null };

const INPUT =
  "h-10 w-full rounded-lg border border-hairline bg-canvas px-3 text-base text-fg placeholder:text-fg-muted sm:text-[13px]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={ui.label}>{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-[12px] text-fg-muted">{hint}</span>}
    </label>
  );
}

export function SubmitForm({
  categories,
  listed,
}: {
  categories: { slug: string; name: string }[];
  listed: Record<string, { slug: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState(submitTool, { status: "idle" } satisfies SubmitState);
  const [repoInput, setRepoInput] = useState("");
  const [async, setAsync] = useState<AsyncCheck>({ status: "idle" });
  const [name, setName] = useState("");
  const nameTouched = useRef(false);
  const currentRepo = useRef<string | null>(null);

  const repo = repoInput.trim() ? parseRepo(repoInput) : null;
  const existing = repo ? listed[repo.toLowerCase()] : undefined;
  const check: Check =
    !repoInput.trim()
      ? { status: "idle" }
      : !repo
        ? { status: "not-repo" }
        : existing
          ? { status: "listed", ...existing }
          : async.status !== "idle" && async.repo === repo
            ? async
            : { status: "checking" };

  // Live preview of the criteria; the server re-checks everything on submit.
  useEffect(() => {
    if (!repo || existing) return;
    const controller = new AbortController();
    const isCurrent = () => !controller.signal.aborted && currentRepo.current === repo;
    const timer = setTimeout(async () => {
      try {
        const [repoRes, readmeRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${repo}`, { signal: controller.signal }),
          fetch(`https://api.github.com/repos/${repo}/readme`, { signal: controller.signal }),
        ]);
        if (!isCurrent()) return;
        if (!repoRes.ok) {
          setAsync(
            repoRes.status === 404
              ? { status: "checked", repo, meta: null, problems: [], hasReadme: null }
              : { status: "unreachable", repo },
          );
          return;
        }
        const data = await repoRes.json();
        if (!isCurrent()) return;
        const meta: RepoMeta = {
          fullName: data.full_name,
          stars: data.stargazers_count,
          license:
            data.license?.spdx_id && data.license.spdx_id !== "NOASSERTION" ? data.license.spdx_id : null,
          archived: data.archived,
          isPrivate: data.private,
          createdAt: data.created_at,
        };
        setName((current) => {
          if (!isCurrent() || nameTouched.current) return current;
          return data.name;
        });
        setAsync({ status: "checked", repo, meta, problems: repoProblems(meta), hasReadme: readmeRes.ok });
      } catch {
        if (isCurrent()) setAsync({ status: "unreachable", repo });
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [repo, existing]);

  const done = state.status === "ok";

  return (
    <form action={formAction} className="max-w-[65ch] space-y-5">
      {/* Honeypot: hidden from humans and assistive tech. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <Field label="GitHub repository" hint="The live check uses GitHub's public API.">
        <input
          name="repo"
          required
          value={repoInput}
          onChange={(e) => {
            const value = e.target.value;
            currentRepo.current = value.trim() ? parseRepo(value) : null;
            setRepoInput(value);
          }}
          placeholder="https://github.com/owner/repo"
          className={INPUT}
        />
      </Field>

      <RepoCheck check={check} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Tool name">
          <input
            name="name"
            required
            maxLength={60}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              nameTouched.current = true;
            }}
            className={INPUT}
          />
        </Field>
        <Field label="Category">
          <select name="category" required defaultValue="" className={INPUT}>
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="One-line description" hint="What it does, for whom. Up to 80 characters.">
        <input name="tagline" required maxLength={80} className={INPUT} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-[1fr_2fr]">
        <Field label="Replaces (optional)">
          <input name="product" maxLength={40} placeholder="e.g. GitHub Copilot" className={INPUT} />
        </Field>
        <Field label="Why it can replace it">
          <input name="why" maxLength={160} placeholder="One sentence, specific to the product" className={INPUT} />
        </Field>
      </div>

      <button
        type="submit"
        aria-busy={pending}
        disabled={pending || done || check.status === "listed"}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-fg px-3.5 text-[13px] font-medium text-canvas motion-safe:transition-[scale] motion-safe:duration-100 motion-safe:ease-out motion-safe:active:scale-[0.96] disabled:opacity-50"
      >
        {pending && <LoadingSpinner />}
        {done ? "Submitted" : "Submit for review"}
      </button>

      <div
        role="status"
        aria-atomic="true"
        className={
          pending
            ? "text-[13px] text-fg-muted"
            : done
              ? "border-l-2 border-health-high pl-3 text-[13px] text-pretty"
              : "sr-only"
        }
      >
        {pending ? (
          "Checking repository and submitting…"
        ) : done ? (
          <>
            <p>{state.message}</p>
            {state.prUrl && (
              <p className="mt-1">
                Track it in the{" "}
                <a href={state.prUrl} rel="noopener noreferrer" target="_blank" className={ui.link}>
                  review queue
                </a>
                .
              </p>
            )}
          </>
        ) : null}
      </div>

      {state.status === "error" && (
        <p role="alert" className="border-l-2 border-health-low pl-3 text-[13px] text-pretty">
          {state.message}
        </p>
      )}
    </form>
  );
}

function LoadingSpinner() {
  return (
    <span
      aria-hidden="true"
      className="size-3.5 shrink-0 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin motion-reduce:animate-none"
    />
  );
}

function RepoCheck({ check }: { check: Check }) {
  let message: React.ReactNode = null;
  if (check.status === "checking") {
    message = (
      <p className="inline-flex items-center gap-2 text-[13px] text-fg-muted">
        <LoadingSpinner />
        Checking against GitHub…
      </p>
    );
  } else if (check.status === "not-repo") {
    message = <p className="text-[13px]">That does not look like a GitHub repository.</p>;
  } else if (check.status === "listed") {
    message = (
      <p className="text-[13px]">
        Already listed:{" "}
        <Link href={`/tool/${check.slug}`} className={ui.link}>
          {check.name}
        </Link>
        .
      </p>
    );
  } else if (check.status === "unreachable") {
    message = (
      <p className="text-[13px] text-fg-muted">
        GitHub could not be reached. The server will retry on submit.
      </p>
    );
  } else if (check.status === "checked") {
    if (check.meta == null) {
      message = <p className="text-[13px]">Repository not found. It may be private.</p>;
    } else {
      const problems = [...check.problems];
      if (check.hasReadme === false) problems.push("The repository has no README.");
      message =
        problems.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-[13px] marker:text-fg-muted">
            {problems.map((problem) => (
              <li key={problem}>{problem}</li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-fg-muted">
            Meets the criteria: {check.meta.license}, {formatNumber(check.meta.stars)} stars
            {check.hasReadme ? ", README found." : "."}
          </p>
        );
    }
  }

  return (
    <div role="status" aria-atomic="true" className="min-h-5">
      {message}
    </div>
  );
}
