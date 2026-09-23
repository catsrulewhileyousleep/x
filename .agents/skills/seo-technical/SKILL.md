---
name: seo-technical
description: Crawl, render and index checks — status codes, canonical URLs, robots meta and robots.txt, sitemaps, noindex rules, internal link graph, Core Web Vitals and Next.js metadata pitfalls. Use when a page is not indexed, shows the wrong URL, or before shipping a new route.
---

# Technical SEO

Goal: every page that should rank returns 200, is crawlable, renders its content in the server HTML, declares one self-referencing canonical, and is reachable through internal links and the sitemap. Every page that should not rank says so.

## Indexability

- One URL per piece of content. `alternates.canonical` is a path; `metadataBase` in `app/layout.tsx` makes it absolute from `NEXT_PUBLIC_SITE_URL`. A deploy without that variable ships `localhost` canonicals: treat as a blocker.
- Thin or utility pages get `robots: { index: false, follow: true }` (e.g. `/submit`, categories below `MIN_INDEXABLE`). They must not appear in `app/sitemap.ts`.
- Metadata merges shallowly. A page that sets `robots` or `openGraph` replaces the layout object entirely, so repeat the fields it still needs (`siteName`, `type`).
- The site-wide `googleBot` directives (`max-image-preview:large`, `max-snippet:-1`) are what allow large images in Discover and full snippets in AI features. Do not drop them without a reason.
- Unknown slugs must 404 (`dynamicParams = false` + `notFound()`), never render an empty 200.

## Sitemap and robots

- `app/sitemap.ts` lists only indexable, canonical URLs. `lastModified` must reflect a real change (here, the GitHub snapshot time), not `new Date()` at build.
- Tool URLs carry their OG image (`images`) for image search.
- `app/robots.ts` must not block CSS/JS or `/_next/`. Blocking a URL in robots.txt does not remove it from the index; use `noindex` for that, and leave it crawlable so Google can see the tag.

## Links

- Every indexable page needs at least one crawlable `<a href>` from another indexable page. `pnpm seo:audit` flags links to URLs missing from the sitemap.
- Outbound links to projects use `rel="nofollow noopener"`; paid (`sponsored: true`) listings must use `rel="sponsored"`.
- Link text names the destination ("Aider", "Alternatives to Cursor"), not "click here".

## Rendering and performance

- Content that should rank must be in the server-rendered HTML. Check with `curl`, not the browser.
- Core Web Vitals thresholds at p75 field data: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Lab tools only hint; Search Console's CWV report is the evidence. Common template fixes: size avatars and images, avoid layout shift from late fonts (`next/font` already handles this), keep client components out of the critical path.
- OG images are 1200×630 and static per slug.

## Checks

```bash
curl -sI localhost:3000/tool/<slug>                               # 200
curl -s localhost:3000/tool/<slug> | grep -E 'canonical|robots|og:url'
curl -s localhost:3000/tool/does-not-exist -o /dev/null -w '%{http_code}\n'   # 404
pnpm seo:audit
```
