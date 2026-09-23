# Contributing

The directory is small on purpose. A tool is listed only after someone has checked it by hand.

## Suggest a tool

Use the submit form on the site (`/submit`). It checks the basics against GitHub as you type —
public repository, not archived, README present, a detectable open-source license, at least
90 days old — and puts the result in a review queue. No GitHub account needed.

### Criteria

- **Public repository** on GitHub, not archived, with a README that explains what the tool does.
- **OSI-approved license** (MIT, Apache-2.0, GPL, AGPL, BSD, MPL…). Licenses that add commercial restrictions, such as "Apache-2.0 with conditions", are not listed.
- **Useful on its own**: an app, library or runtime people use directly, not a thin wrapper or a list of links.
- **At least 90 days old**, so it can receive a Health Score.

Paying for faster review, if it is ever offered, never skips these checks, never guarantees
approval and never changes a Health Score.

## Reviewing submissions (maintainers)

Submissions from the form land in `data/submissions/` as pull requests opened by the
`SUBMISSIONS_TOKEN` bot. The review steps are in [`data/submissions/README.md`](data/submissions/README.md):
check the criteria by hand, write the listing, move the entry into `data/tools.json`,
then run `pnpm snapshot` and the checks. Broken references fail the build on purpose.

Deploying the form's queue requires a fine-grained `SUBMISSIONS_TOKEN` with read/write
access to contents and pull requests. `pnpm snapshot` uses a separate `GITHUB_TOKEN`.

## Alternative-to pages

A page `/alternative-to/<slug>` is published only when at least three tools list that product in `alternativeTo`. The intro must explain why people look for an alternative (price, closed source, limits) without promoting the original product.

## Writing style

English, plain and short. Say what the tool does, not how great it is. No exclamation marks, no "revolutionary", no "blazing fast".
