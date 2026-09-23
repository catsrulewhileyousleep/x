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
| Recognition rather than recall | Column headers always visible; filter options show counts; the header marks the current section; the palette lists every page before you type. |
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

## Say it once

Every fact has one home on a page. The data date lives in the footer. Health Score's breakdown sits inside the Health cell rather than in a second table. The license note sits under the license. Lists drop a column whose value every row shares, for example the category inside a category page. The selected filter option omits its count because the result line already states it. The palette and breadcrumbs are navigation, not content, and may name a page that is also linked elsewhere.

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
