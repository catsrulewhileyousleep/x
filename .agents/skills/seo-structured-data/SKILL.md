---
name: seo-structured-data
description: JSON-LD for directory pages — which schema.org types Google still supports, required and recommended properties, what must never be marked up (self-serving ratings, FAQ/HowTo for rich results), entity @id linking and validation. Use when adding or reviewing structured data.
---

# Structured data

Markup describes what is visible on the page. It helps Google understand entities; it does not rank a page by itself, and markup that claims more than the page shows is a manual-action risk.

## Types used here

| Page | Types | Notes |
| --- | --- | --- |
| Every page with crumbs | `BreadcrumbList` | From `components/breadcrumbs.tsx`; items match the visible trail. |
| Home | `WebSite` with `@id` `${siteUrl}/#website` | Other pages reference this `@id` in `isPartOf`. No `SearchAction`: Google retired the sitelinks search box in 2024. |
| Tool | `WebPage` + `["SoftwareApplication", "SoftwareSourceCode"]` in one `@graph` | `mainEntity` links them by `@id` (`<url>#software`). |
| Category, alternative-to | `ItemList` of tool URLs in display order | `components/item-list-schema.tsx`. |

Tool entity properties and where they come from:

- `name`, `description` (full About), `applicationCategory` (Google's enum, mapped in `APP_CATEGORY`), `applicationSubCategory`, `keywords` (tags)
- `url` (website or repo), `codeRepository`, `sameAs`, `license` (SPDX URL), `programmingLanguage`, `dateCreated`, `dateModified` (last commit), `image` (org avatar) — all from the GitHub snapshot, omitted when null
- `offers` `{ price: "0" }` and `isAccessibleForFree`: every listed tool is open source

## Never mark up

- **`aggregateRating` / `review` from the Health Score.** It is our own metric, not user reviews; self-serving reviews are ineligible and the July 2026 guideline targets fake or incentivized reviews. This means the tool page is not eligible for the Software App rich result, which is the correct trade.
- **`FAQPage`** to win rich results: removed from Google Search on 2026-05-07. Visible FAQs that help readers may stay, markup optional.
- **`HowTo`**: removed since 2023.
- Guessed values: `operatingSystem`, `softwareVersion`, `downloadUrl` unless the data has them.
- Sponsored status as anything but visible text; paid links are handled with `rel="sponsored"`.

## Rules

- Output through `components/json-ld.tsx`, which escapes `<`.
- One `@graph` per page when entities reference each other; stable `@id`s built from the canonical URL.
- Absolute URLs from `siteUrl`.
- Retired types (2025): Book Actions, Course Info, Claim Review, Estimated Salary, Learning Video, Special Announcement, Vehicle Listing. Do not add them expecting rich results.

## Validate

```bash
curl -s localhost:3000/tool/<slug> | grep -o '<script type="application/ld+json">[^<]*' | sed 's/.*json">//' | python3 -m json.tool
pnpm seo:audit    # fails on invalid JSON-LD or a tool page without SoftwareApplication
```

Then check every value against the rendered page, and run the Rich Results Test and the Schema Markup Validator (https://validator.schema.org) on the deployed URL.
