# Contributing

The directory is small on purpose. A tool is listed only after someone has checked it by hand.

## Suggest a tool

The easiest way is the [Submit a tool](https://github.com/catsrulewhileyousleep/x/issues/new?template=submit-tool.yml) issue form. You can also open a pull request directly (see below).

### Criteria

- **Public repository** on GitHub, not archived, with a README that explains what the tool does.
- **OSI-approved license** (MIT, Apache-2.0, GPL, AGPL, BSD, MPL…). Licenses that add commercial restrictions, such as "Apache-2.0 with conditions", are not listed.
- **Useful on its own**: an app, library or runtime people use directly, not a thin wrapper or a list of links.
- **At least 90 days old**, so it can receive a Health Score.

Paying for faster review, if it is ever offered, never skips these checks, never guarantees approval and never changes a Health Score.

## Add a tool with a pull request

1. Add an entry to `data/tools.json`:

   ```json
   {
     "slug": "tool-name",
     "name": "Tool Name",
     "repo": "owner/repo",
     "category": "coding-agents",
     "tagline": "What it does, in under 80 characters",
     "description": [
       "What it does and who it is for. Write it yourself; do not paste the README.",
       "What sets it apart."
     ],
     "tags": ["terminal", "cli"],
     "alternativeTo": [
       { "slug": "github-copilot", "why": "One sentence on what it shares with, and how it differs from, the product." }
     ]
   }
   ```

   - `category` must match a slug in `data/categories.json`.
   - `alternativeTo` slugs must exist in `data/alternatives.json`. Only add one when the tool genuinely replaces the product, and always write the `why`.
   - If GitHub cannot detect the license, add `"licenseOverride": { "spdx": "Apache-2.0", "note": "Why it was verified manually." }`.

2. Refresh the GitHub data:

   ```bash
   GITHUB_TOKEN=... pnpm snapshot
   ```

3. Check that everything builds. Broken references fail the build on purpose:

   ```bash
   pnpm test && pnpm lint && pnpm build
   ```

## Alternative-to pages

A page `/alternative-to/<slug>` is published only when at least three tools list that product in `alternativeTo`. The intro must explain why people look for an alternative (price, closed source, limits) without promoting the original product.

## Writing style

English, plain and short. Say what the tool does, not how great it is. No exclamation marks, no "revolutionary", no "blazing fast".
