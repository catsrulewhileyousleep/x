---
name: seo-ai-search
description: Visibility in AI Overviews, AI Mode and LLM assistants — eligibility, snippet controls, Google-Extended vs Googlebot, AI crawler rules in robots.txt, llms.txt, and writing passages that can be cited. Use when asked about GEO/AEO, AI search, llms.txt or AI crawlers.
---

# AI search

Google's position (AI features guide, 2026): there are no extra technical requirements. A page appears as a supporting link in AI Overviews or AI Mode when it is indexed and eligible for a snippet, and those features retrieve through core ranking (grounding plus query fan-out). "AEO" and "GEO" are SEO. So `seo-technical` and `seo-content` come first; this skill covers what is specific.

## Eligibility and controls

- Do not set `nosnippet` or a small `max-snippet` on pages that should be cited; the layout sets `max-snippet:-1`.
- `data-nosnippet` on an element keeps it out of snippets and AI answers. Use it only for text that should not be quoted (none today).
- `Google-Extended` in robots.txt controls Gemini training and grounding outside Search. Blocking it does **not** remove pages from AI Overviews. This site allows it; changing that is a product decision, not an SEO fix.
- The Search Console toggle for generative features (in testing since June 2026) is set in Search Console, not in code.
- Other assistants crawl with their own agents (e.g. `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`). `app/robots.ts` allows all by default. Blocking a search-oriented bot removes the site from that assistant's answers.

## Content that gets cited

Query fan-out means a question like "best local LLM runner for a Mac" is split into sub-queries. Pages win when a passage answers one sub-query on its own:

- The first About sentence defines the tool in one line (what, where it runs).
- "Good fit" / "Look elsewhere" answer comparison questions directly and name the other tool.
- Facts in text, not only in images: license, language, last commit, stars are in the HTML.
- Unique, non-commodity information (the Health Score and its inputs, editorial comparisons) is what Google's 2026 guidance asks for; restating a README is commodity.

## llms.txt

`/llms.txt` (`app/llms.txt/route.ts`) is a Markdown index generated from the data: tools per category with tagline and license, plus alternative pages. It follows the llmstxt.org proposal. Google does not use it; some LLM tools do. Keep it generated, never hand-edited, and never list noindex pages there.

## Checks

```bash
curl -s localhost:3000/llms.txt | head -20
curl -s localhost:3000/robots.txt
curl -s localhost:3000/tool/<slug> | grep -E 'googlebot|nosnippet'
```

Measuring: Search Console includes AI Overviews and AI Mode clicks and impressions in the Performance report (web search type); there is no separate filter to rely on.
