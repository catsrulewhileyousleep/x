# AI Directory

A small, hand-picked directory of open-source AI tools, with a transparent Health Score. Design principles: [DESIGN.md](DESIGN.md). Adding a tool: [CONTRIBUTING.md](CONTRIBUTING.md).

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # Health Score
pnpm lint && pnpm build
```

## Data

- `data/tools.json`: editorial content (tagline, description, `alternativeTo` with a "why it replaces" sentence).
- `data/categories.json`, `data/alternatives.json`: categories and the closed-source products used as comparison points.
- `data/github-snapshot.json`: generated, do not edit by hand. Refresh it with:

```bash
GITHUB_TOKEN=... pnpm snapshot
```

To refresh daily, copy `scripts/snapshot-workflow.yml` to `.github/workflows/snapshot.yml` (it is kept outside `.github/` because the bot that opened this PR cannot push workflow files). It runs the script and commits the result. Repos that were archived, moved or could not be fetched are listed under `needsReview`, and the workflow fails so maintainers notice. A failed fetch keeps the previous data.

`/alternative-to/[slug]` pages are only generated with at least 3 tools; categories with fewer than 2 tools are `noindex`. Broken references (category, alternative, repo without a snapshot) fail the build.

## Routes

| Route | Content |
| --- | --- |
| `/` | List view with search, category filter and sorting |
| `/tool/[slug]` | Tool details, Health Score breakdown, similar tools |
| `/category/[slug]` | Tools in one category |
| `/alternative-to/[slug]` | Open-source alternatives to a closed-source product |
| `/health-score` | Formula, limits and data source |
| `/badge/[slug].svg` | Embeddable Health badge |

Set `NEXT_PUBLIC_SITE_URL` when deploying so canonical URLs, the sitemap, JSON-LD and badge Markdown use the right domain.
