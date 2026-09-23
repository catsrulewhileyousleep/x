# AI Directory

A small, hand-picked directory of open-source AI tools, with a transparent Health Score. Design principles: [DESIGN.md](DESIGN.md). Adding a tool: [CONTRIBUTING.md](CONTRIBUTING.md).

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # data and submission unit tests
pnpm lint && pnpm build
pnpm seo:audit  # against a running server; BASE defaults to http://127.0.0.1:3000
pnpm seo:projects # per-project SEO checks on data/tools.json, no server needed
```

Browser regression tests use a running app (prefer `pnpm build && pnpm start` in
another terminal; `pnpm dev` also works):

```bash
pnpm exec playwright install chromium # once; add --with-deps on a fresh Linux host
pnpm test:e2e                         # BASE defaults to http://127.0.0.1:3000
```

The browser suite covers keyboard dialogs, hover/touch highlights, reduced motion,
sound preferences, narrow layouts and delayed repository checks. GitHub requests
are stubbed; the submission test only exercises local validation and never creates
a review-queue entry.

SEO rules for agents and maintainers live in `.agents/skills/seo*` (entry point: `seo`), with a dated standards snapshot in `.agents/skills/seo/sources.md`.

## Data

- `data/tools.json`: editorial content (tagline, description, `alternativeTo` with a "why it replaces" sentence).
- `data/categories.json`, `data/alternatives.json`: categories and the closed-source products used as comparison points.
- `data/submissions/`: the review queue fed by the `/submit` form. Nothing here is published.
- `data/github-snapshot.json`: generated, do not edit by hand. Refresh it with:

```bash
GITHUB_TOKEN=... pnpm snapshot
```

To refresh daily, copy `scripts/snapshot-workflow.yml` to `.github/workflows/snapshot.yml` (it is kept outside `.github/` because the bot that opened this PR cannot push workflow files). It runs the script and commits the result. Repos that were archived, moved or could not be fetched are listed under `needsReview`, and the workflow fails so maintainers notice. A failed fetch keeps the previous data.

`/alternative-to/[slug]` pages are only generated with at least 3 tools; categories with fewer than 2 tools are `noindex`. Broken references (category, alternative, repo without a snapshot) fail the build.

## Routes

| Route | Content |
| --- | --- |
| `/` | List view with search, filters (category, license, Health Score), sorting and pagination (20 per page) |
| `/tool/[slug]` | Tool details, Health Score breakdown, similar tools |
| `/category`, `/category/[slug]` | All categories; tools in one category |
| `/alternative-to`, `/alternative-to/[slug]` | All alternative pages; alternatives to one product |
| `/health-score` | Formula, limits and data source |
| `/submit` | Submit a tool: live GitHub checks, then a hand-reviewed queue (noindex) |
| `/sponsor` | How sponsored listings work; always names current sponsors |
| `/badge/[slug].svg` | Embeddable Health badge |
| `/llms.txt` | Plain-text index of every tool for LLM crawlers ([llmstxt.org](https://llmstxt.org)) |
| `…/opengraph-image` | Generated 1200×630 share image for home, tool, category and alternative pages |

## Submissions and sponsoring

The `/submit` form validates against GitHub's public API in the browser, re-validates on the
server, then queues the entry as a pull request in `data/submissions/` using a
`SUBMISSIONS_TOKEN` (fine-grained PAT, contents + pull requests read/write). Review steps:
`data/submissions/README.md`.

Sponsored listings are set with `"sponsored": true` on a tool entry: pinned at the top of
their category page, labeled "Sponsored" in every list, disclosed on `/sponsor`, and never
scored or ranked differently.

Share images use Inter Tight from `assets/fonts` (SIL Open Font License, see `assets/fonts/OFL.txt`).

Set `NEXT_PUBLIC_SITE_URL` when deploying so canonical URLs, the sitemap, JSON-LD and badge Markdown use the right domain.
