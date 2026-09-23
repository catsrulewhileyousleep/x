import assert from "node:assert/strict";
import { test } from "node:test";
import { badgeSvg, badgeWidth } from "./badge.ts";
import type { Health } from "./health.ts";

const scored = (score: number): Health => ({
  status: "scored",
  score,
  popularity: 50,
  maintenance: 50,
  daysSinceCommit: 10,
});
const insufficient: Health = { status: "insufficient", reason: "repo is archived" };

test("width follows the segment widths, so the pill fits its text", () => {
  // 12 (pad) + 74 ("AI Directory") + 12 (pad) + 14 ("92" at 7px/char) = 112.
  assert.equal(badgeWidth(scored(92)), 112);
  assert.equal(badgeWidth(scored(7)), 105);
});

test("svg carries the brand label, the value and an accessible name", () => {
  const svg = badgeSvg(scored(92));
  assert.match(svg, /AI Directory/);
  assert.match(svg, />92</);
  assert.match(svg, /aria-label="AI Directory health score: 92"/);
  assert.match(svg, /width="112" height="20"/);
});

test("unscored repos render n/a on the neutral fill, never a made-up score", () => {
  const svg = badgeSvg(insufficient);
  assert.match(svg, />n\/a</);
  assert.match(svg, /#868686/);
  assert.doesNotMatch(svg, /fill="#22c373"|fill="#eab532"|fill="#e94646"/);
});
