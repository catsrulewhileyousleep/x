---
name: seo
description: Runs a full SEO pass on one project page, one page type or the whole site, routing to seo-technical, seo-content, seo-structured-data and seo-ai-search and consolidating one ranked report with fixes. Use when asked to "do SEO", audit or improve search visibility, or optimize the page for a listed project/tool.
---

# SEO

This skill orchestrates. The rules live in the domain skills; never restate or override them here.

| Domain | Skill | Owns |
| --- | --- | --- |
| Crawl, index, canonical, sitemap, robots, performance | `seo-technical` | Whether Google can find, render and index the page |
| Titles, descriptions, headings, body copy, internal links | `seo-content` | Whether the page deserves to rank and earns the click |
| JSON-LD | `seo-structured-data` | Whether markup is valid, eligible and truthful |
| AI Overviews, AI Mode, LLM crawlers | `seo-ai-search` | Whether the page can be cited in generative answers |

The standards these skills encode are dated in [sources.md](sources.md). Before claiming something is "the latest standard", check that file's date. If it is more than three months old, or the task depends on a feature listed there as changing, re-check the linked Google Search Central page and update `sources.md` in the same change.

## 1. Resolve the scope

- **One project** (e.g. "SEO for Aider"): the tool entry in `data/tools.json`, its `/tool/<slug>` page, its OG image, and every page that links to it (category, alternative-to, similar tools, `/llms.txt`).
- **Every project**: all tool entries. Run `pnpm seo:projects` first. It lists each tool with title length, meta description length, About word count and number of `alternativeTo` links, and flags errors and warnings.
- **Site**: every URL in the sitemap. Run `pnpm build && pnpm start`, then `pnpm seo:audit`.

State the scope in the report. Never imply you checked pages you did not render.

## 2. Recon

Read `AGENTS.md`, `CONTRIBUTING.md` (writing style, listing criteria), `DESIGN.md` and the Next.js metadata docs under `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`. This Next.js version merges `metadata` shallowly: a page that sets `openGraph` or `robots` replaces the layout's whole object.

Where things live here:

- Copy: `data/tools.json`, `data/categories.json`, `data/alternatives.json`
- Metadata: `generateMetadata` in each `app/**/page.tsx`, defaults in `app/layout.tsx`
- Description helper: `lib/seo.ts` (`metaDescription`, `licenseSuffix`)
- JSON-LD: `components/json-ld.tsx`, `components/breadcrumbs.tsx`, `components/item-list-schema.tsx`, the `@graph` in `app/tool/[slug]/page.tsx`
- Discovery: `app/sitemap.ts`, `app/robots.ts`, `app/llms.txt/route.ts`

## 3. Run the domains in order

Foundational failures hide everything above them, so go in this order and finish each before the next:

1. `seo-technical`: an unindexable page makes the rest moot.
2. `seo-content`
3. `seo-structured-data`
4. `seo-ai-search`

## 4. Verify with evidence

Every finding cites what you saw: rendered HTML (`curl -s localhost:3000/tool/<slug>`), a script result, or a doc line. Required checks before reporting done:

```bash
pnpm seo:projects                 # per-project data rules, exits 1 on errors
pnpm lint && pnpm typecheck && pnpm test
pnpm build && pnpm start &        # then:
pnpm seo:audit                    # every sitemap URL, exits 1 on issues
```

Paste JSON-LD into the Rich Results Test (https://search.google.com/test/rich-results) when the page is public. Locally, confirm it parses and that every value appears on the visible page.

## 5. Report

Ranked, at most 15 findings, each with severity, location, evidence and the fix:

- **Blocker**: not indexable, wrong canonical, noindex on a page that should rank, broken JSON-LD, markup describing content that is not on the page, policy risk (spam, scaled content, unqualified paid links).
- **High**: missing or duplicate title/description, thin or duplicate page, orphan page, rich result ineligible for a fixable reason.
- **Medium**: weak snippet, missing internal link, image without alt, slow LCP/INP on a template.
- **Low**: polish.

End with what you verified, what you could not (e.g. real Core Web Vitals need field data from Search Console), and which content claims need a maintainer to confirm.

## Guardrails

- Never invent facts about a project to lengthen copy. Every added sentence must come from its README, docs or GitHub data, and follow the writing style in `CONTRIBUTING.md`.
- Never add ratings, reviews, FAQ or HowTo markup to win rich results. See `seo-structured-data`.
- Never generate pages to target keywords without unique value per page. The existing thresholds (`MIN_ALTERNATIVES`, `MIN_INDEXABLE` in `lib/data.ts`) exist for this reason; do not lower them to add URLs.
