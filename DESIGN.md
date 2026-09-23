# Design principles

"Less, but better." Every decision below maps to a specific place in the code. If something does not help people find and judge a tool, it is not there.

## Dieter Rams: ten principles for good design

| Principle | Applied |
| --- | --- |
| Innovative | Health Score shows its formula on every tool page instead of being a black box. |
| Useful | A list view instead of a card grid: name, score, stars and license scan down in columns. |
| Aesthetic | One typeface (Inter Tight), a monochrome OKLCH scale, one accent color. |
| Understandable | Column headers are mandatory; no number explains itself. |
| Unobtrusive | No badges, no shadows, no decorative icons; only hairlines between rows. |
| Honest | Archived, new or incomplete repos show "Not enough data" rather than a guessed score. Licenses GitHub cannot detect say how they were verified. |
| Long-lasting | Static pages (SSG), no "hacker terminal" trend styling. |
| Thorough to the last detail | `tabular-nums`, numbers right-aligned under their headers, `text-wrap: balance/pretty`, sort arrows that never shift the header. |
| Environmentally friendly | No component library; client JavaScript only for search, filtering, sorting, the palette and the theme. |
| As little design as possible | One H1, one list and one primary action per page. |

## Don Norman: human-centered design

- **Affordances and signifiers**: the whole row is a real link (an `<a>` stretched over the row) and highlights on hover; the sort arrow only appears on the sorted column; external links carry ↗.
- **Feedback**: the result count lives in a `role="status"` region; each filter option shows how many tools it would leave, and options that would empty the list are disabled; "Copy badge" confirms with "Copied".
- **Mapping**: clicking a column header sorts that column; breadcrumbs mirror the site hierarchy (Home / Categories / Category / Tool);
- **Constraints**: broken references (category, alternative, snapshot) fail the build instead of shipping dead links.
- **Conceptual model**: Health Score has only two parts, easy to remember and explain.

## Jakob Nielsen: ten usability heuristics

| Heuristic | Applied |
| --- | --- |
| Visibility of system status | The data date appears on the home page, tool pages and footer. |
| Match with the real world | Plain English, developer terms kept as they are (stars, license). |
| User control and freedom | `Esc` clears search and closes the palette; "clear the filters" in the empty state; Back returns to the same search, filter, sort and page. Filters never change the URL. |
| Consistency and standards | One list component on the home, category, alternative-to and "Similar tools" views. `⌘K` and `/` follow common conventions. |
| Error prevention | Search matches tags and licenses too; filter options that would return nothing are disabled; missing values always sort last. |
| Recognition rather than recall | Column headers always visible; filter triggers summarize their choice and options show counts; the header marks the current section; the palette lists every page, grouped, before you type. |
| Flexibility and efficiency | `/` focuses search, `⌘K` / `Ctrl K` jumps to any page, full keyboard support. |
| Aesthetic and minimalist design | Nothing in a row beyond name, tagline, score, stars and license. |
| Help users recover from errors | The empty state names the query and the way out; an empty directory is treated as a data error with reload and report links. |
| Help and documentation | `/health-score` explains the formula, its limits, its source and what changed between versions. |

## John Maeda: the laws of simplicity

| Law | Applied |
| --- | --- |
| Reduce | Contributor counts were dropped because GitHub does not return exact numbers for large repos. |
| Organize | Categories are grouped by words, not colors. |
| Time | No motion except a 100ms background change on hover and the chevron turn (respects `prefers-reduced-motion`). The palette opens instantly because it is used often. |
| Learn | Read one row and you can read them all. The alternatives list reuses the same row pattern. |
| Differences | Color is reserved for state: the accent for active filters, the current section and focus, three health colors for score bands. |
| Context | Generous space around the H1, dense lists. |
| Emotion | Large type with negative tracking gives character without decoration. |
| Trust | Each alternative-to page needs at least 3 tools, each with an editor-written "why it replaces" sentence. |
| Failure | Some things are left out on purpose: compare pages (need real search demand first) and a hosted submission queue. |
| The one | Subtract the obvious, add the meaningful. |

## One component per role

Consistency comes from having one definition per role, not from discipline:

| Role | Source |
| --- | --- |
| Page opening (breadcrumbs, title, one sentence) | `components/page-header.tsx`, on every page. The home page uses the larger `hero` title. |
| Titled block | `components/section.tsx`: same heading, same gap before it (`ui.sectionGap`), same space after. |
| Inline link, navigation link, lede, prose, small label | `lib/ui.ts` |
| List of tools | `components/tool-table.tsx`: name plus exactly one secondary line |
| List of categories or alternatives | `components/index-list.tsx`: same row pattern as the tool list |
| Interactive primitives | `components/ui/`, built on [Base UI](https://base-ui.com) and styled with the same tokens: `tooltip`, `popover`, `checkbox`, `radio`, `avatar`. The ⌘K palette uses Base UI `Dialog` and `Autocomplete`. |

Base UI supplies behavior and accessibility: focus management, keyboard support, ARIA state and collision-aware positioning. The design stays in our tokens. Rules for the primitives:

- **Tooltips** are supplementary only. Base UI disables them on touch, so they refine what is already visible: the exact star count behind "69.1k", what the Health column measures, what "Copy badge" copies, and the name of the icon-only theme toggle. Nothing a reader needs lives only in a tooltip.
- **Filters** are popovers of real checkboxes (Category, License: several can be chosen) and radios (Health: a threshold). Each trigger summarizes its choice ("Category: 2", "Health: 70+"). Options show faceted counts and are disabled when they would empty the list.
- **Popups** share one surface (`popupSurface`), scale from their trigger (`--transform-origin`) and skip the scale under reduced motion.
- **Avatars** fall back to the project's initial after a short delay, so a fast logo never flashes a letter.

A search for `<h1`, `<h2` or an inline `underline` class outside these files should come back empty.

## Say it once

Every fact has one home on a page.

- The data date lives in the footer.
- Health Score's breakdown sits inside the Health cell, and the license note under the license.
- On an alternative page, a row's secondary line is the editor's "why it replaces" sentence instead of the tagline, because that is what the page is for.
- A tool already recommended under "Who it's for" is not listed again under "Similar tools".
- Free-tier answers state the fact and link the source once.
- Lists drop a column whose value every row shares, and the selected filter option omits its count because the result line states it.

The palette and breadcrumbs are navigation, not content, and may name a page that is also linked elsewhere.

## Project pages and search

Google's June 2026 guidance for AI Overviews and AI Mode is that optimizing for them is still SEO. Pages need to be indexable, eligible for snippets and genuinely useful. No special files or markup are required. So project pages follow the same structure a person needs to decide:

1. **What it is**: name as the H1, tagline as the lede, links to the site and repo.
2. **Facts**: Health, Stars, License, Language, Last commit, as a `<dl>` with a machine-readable `<time>`.
3. **About {tool}**: what it does, written by an editor rather than copied from the README.
4. **Who it's for**: "Good fit" and "Look elsewhere", with a link to the tool that fits better. This is the page's own point of view, the part other directories do not have.
5. **Replaces**: the alternative-to pages it appears on, each with the reason.
6. **Similar tools**: the rest of the category by Health.

On-page rules, enforced by `pnpm seo:audit`:

- Titles are 60 characters or fewer, and the site name is dropped before the tagline is cut.
- Meta descriptions are 155 characters or fewer, cut at a word boundary.
- Every page has one H1, headings never skip a level, and the canonical URL points to the page itself.
- JSON-LD parses, and every internal link points to a page in the sitemap.

JSON-LD is a `WebPage` (with `dateModified` set to the data snapshot) whose `mainEntity` is a `SoftwareApplication`. There are no ratings, so there is no rich result. Ratings will not be invented to get one, and there is no llms.txt, since Google says neither helps.

## Color

Tokens come from the brief (§6). Light values are re-derived rather than inverted. WCAG contrast, measured from the declared OKLCH values:

| Pair | Dark | Light |
| --- | --- | --- |
| Primary text / background | 18.99 | 17.34 |
| Secondary text / background | 5.52 | 5.75 |
| Secondary text / surface (hovered row) | 5.07 | 5.26 |
| Accent border on an active filter / background | 5.26 | 5.64 |
| Focus ring / surface | 7.26 | 5.16 |

White text on the accent only reaches 3.61:1 in dark mode, so active filters use an accent border instead of an accent fill. Health dots are decorative (the number carries the meaning) and stay at 3:1 or more against both surfaces.

The theme is set by one attribute, `data-theme` on `<html>`, written by an inline script before first paint. Transitions are disabled for the frame of a theme switch so the change snaps instead of smearing. Until someone picks a theme, the site follows the OS, including changes while the page is open; picking the OS's own theme returns to following it, so two states are enough. The browser `theme-color` follows the active theme.
