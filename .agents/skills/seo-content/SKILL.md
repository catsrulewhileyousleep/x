---
name: seo-content
description: Page-level SEO copy for each listed project and for category and alternative pages — title, meta description, H1 and heading outline, About copy, internal links and duplicate/thin checks, following Google's helpful-content guidance and this repo's writing style. Use when writing or reviewing a tool entry in data/tools.json or any page's metadata.
---

# SEO content

Google ranks pages that answer the searcher better than the alternatives. For a directory, the value is the editor's judgment: what the tool does, who it suits, when to pick something else, and live GitHub health. Keep that, and keep it unique to each page.

Voice is set by `CONTRIBUTING.md`: English, plain and short, no exclamation marks, no hype. SEO never overrides it.

## Per-project checklist (`data/tools.json`)

Run `pnpm seo:projects`. It implements the measurable rules below; the rest need judgment.

| Field | Rule | Why |
| --- | --- | --- |
| `name` + `tagline` | Title is `Name — tagline`. ≤ 60 chars total, or the site suffix is dropped automatically. The tagline says what it is in words people search ("terminal coding agent", "text-to-speech"), without repeating the name. Unique across tools. | Title link and primary relevance signal |
| `description[0]` | Opens with the name and a concrete verb: what it does, for whom or where it runs. The meta description is built from whole sentences of `description` up to 155 chars (`lib/seo.ts`), plus the license when it fits, so the first sentence should be ≤ ~120 chars and stand alone. | Snippet and AI Overview grounding |
| `description` | 2–3 sentences, at least ~30 words, each adding a fact: platform, model support, deployment, license caveats, project status. Facts only from the README, docs or GitHub data. | Thin pages lose to the project's own README |
| `fit` / `elsewhere` | Start with "You". `elsewhere` names and links at least one other listed tool. | Unique judgment + internal links |
| `tags` | 2–4, lowercase, what people filter by. | Search and on-site discovery |
| `alternativeTo` | Only when the tool truly replaces the product; `why` is one sentence comparing on a concrete axis. Three tools publish an `/alternative-to/` page. | "X alternative" queries |

The script's thresholds:

- **Error**: title over 60 chars even without the suffix, description cut mid-sentence or under 70 chars, hype wording, duplicate tagline or description, missing snapshot.
- **Warning**: description under 110 chars, About under 30 words, tagline repeats the name, fewer than 2 tags.

Warnings are prompts, not quotas. Do not pad copy to clear one; a short, accurate page beats a long, vague one.

## Other page types

- **Category** (`data/categories.json`): `title` is the query ("Open-source coding agents"), `intro` says what the category covers and how to choose. Pages below `MIN_INDEXABLE` stay `noindex`.
- **Alternative-to** (`data/alternatives.json`): `intro` explains why people look for an alternative (price, closed source, limits) without promoting the original. `freeTier` must cite a source URL.
- **Static pages**: unique title and description each; the audit fails on duplicates.

## Structure

- Exactly one `<h1>`, matching the title's intent; sections use `<h2>` without skipping levels.
- Put the answer first: the lede (tagline) and first About sentence should answer "what is X" on their own.
- Show freshness only when true: last commit and snapshot date come from GitHub data.

## Quality bar (helpful content)

Ask of every page: would someone who searched the tool's name or "<product> alternative" learn something here they would not get from the README alone? The Health Score, the fit/elsewhere judgment and the comparison are that something. Scaled, templated text across many pages with only the name swapped is a spam-policy risk, not an SEO win.
