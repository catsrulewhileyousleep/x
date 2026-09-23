# Submission queue

Each file here is one submission from the site's `/submit` form, opened as a pull
request by the `SUBMISSIONS_TOKEN` bot. Nothing in this directory is published.

To review a submission:

1. Check the criteria in `CONTRIBUTING.md` by hand — the form only checks the basics.
2. Write the `description` and `fit`, and map `replaces` to an existing slug in
   `data/alternatives.json` (add the target there first, if it is new).
3. Move the entry into `data/tools.json` and delete the file from this directory.
4. Run `pnpm snapshot`, then `pnpm test && pnpm lint && pnpm build`.
