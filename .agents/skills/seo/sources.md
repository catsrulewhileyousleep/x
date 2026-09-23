# Standards snapshot

Verified 2026-09-23 against Google Search Central. Re-check anything marked "changing" before relying on it.

| Topic | Current state | Source |
| --- | --- | --- |
| Ranking foundation | Helpful, reliable, people-first content; E-E-A-T is a quality lens, not a markup. No word-count target. | https://developers.google.com/search/docs/fundamentals/creating-helpful-content |
| Spam policies | Scaled content abuse, site reputation abuse (enforcement adjusted in the EEA, Aug 2026), expired domain abuse, unqualified paid links. | https://developers.google.com/search/docs/essentials/spam-policies |
| Paid links | Qualify with `rel="sponsored"` (or `nofollow`). | https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links |
| Core Web Vitals | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 at the 75th percentile of field data. INP replaced FID in March 2024. | https://developers.google.com/search/docs/appearance/core-web-vitals |
| Title links | Google may rewrite titles; unique, descriptive `<title>` matching the `<h1>` intent is what it prefers. No fixed length; ~60 chars avoids truncation. | https://developers.google.com/search/docs/appearance/title-link |
| Snippets | Meta description is used when it describes the page better than on-page text; `max-snippet`, `nosnippet`, `data-nosnippet` control length and use. | https://developers.google.com/search/docs/appearance/snippet |
| FAQ rich results | **Removed** from Search on 2026-05-07; docs removed 2026-06-15. Markup is harmless but earns nothing in Google. | https://developers.google.com/search/updates |
| HowTo rich results | Removed (desktop and mobile) since 2023. | https://developers.google.com/search/blog/2023/08/howto-faq-changes |
| Retired types (2025) | Book Actions, Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement, Vehicle Listing. | https://developers.google.com/search/blog/2025/06/simplifying-search-results |
| Review snippets | Self-serving reviews are not eligible; new guideline (Jul 2026) against fake and undisclosed incentivized reviews. | https://developers.google.com/search/docs/appearance/structured-data/review-snippet |
| Software app rich result | `SoftwareApplication` needs `name`, `offers.price` **and** either `aggregateRating` or `review` to be eligible. Without genuine user ratings it is still valid, descriptive markup. | https://developers.google.com/search/docs/appearance/structured-data/software-app |
| Breadcrumbs | `BreadcrumbList` still supported. | https://developers.google.com/search/docs/appearance/structured-data/breadcrumb |
| AI Overviews / AI Mode | No extra requirements: page must be indexed and eligible for a snippet. Grounded via core ranking (RAG, query fan-out). Google calls "AEO/GEO" just SEO. | https://developers.google.com/search/docs/appearance/ai-features |
| AI controls (changing) | `nosnippet`/`max-snippet` limit use in AI features. `Google-Extended` only governs Gemini training/grounding, not AI Overviews. Search Console toggle for generative features in testing since Jun 2026. | https://blog.google/products-and-platforms/products/search/new-controls-website-owners/ |
| Preferred sources (changing) | Users can pick preferred sources, also in AI Overviews/AI Mode; custom button added Aug 2026. | https://developers.google.com/search/updates |
| llms.txt | Community proposal. Google does not use it; some LLM tools do. Cheap to serve, never a ranking lever. | https://llmstxt.org |
| Favicon | Supported formats listed explicitly (Aug 2026). | https://developers.google.com/search/docs/appearance/favicon-in-search |
| Canonicalization | Re-evaluation after a change can take a while (Jul 2026 clarification). | https://developers.google.com/search/docs/crawling-indexing/canonicalization-troubleshooting |
