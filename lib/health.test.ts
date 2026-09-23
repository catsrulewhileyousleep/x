import { test } from "node:test";
import assert from "node:assert/strict";
import { computeHealth, maintenanceScore, popularityScore } from "./health.ts";

const snapshotAt = "2026-09-23T00:00:00Z";
const base = {
  stars: 1000,
  lastCommitAt: "2026-09-20T00:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
  archived: false,
  isPrivate: false,
};

test("maintenance is 100 up to 30 days, linear to 0 at 365, then 0", () => {
  assert.equal(maintenanceScore(0), 100);
  assert.equal(maintenanceScore(30), 100);
  assert.equal(maintenanceScore(197.5), 50);
  assert.equal(maintenanceScore(365), 0);
  assert.equal(maintenanceScore(900), 0);
});

test("popularity is log-scaled against the dataset maximum", () => {
  assert.equal(popularityScore(100_000, 100_000), 100);
  assert.equal(popularityScore(0, 100_000), 0);
  const mid = popularityScore(316, 100_000);
  assert.ok(mid > 49 && mid < 51, `expected ~50, got ${mid}`);
});

test("score combines 40% popularity and 60% maintenance", () => {
  const h = computeHealth(base, 1000, snapshotAt);
  assert.equal(h.status, "scored");
  if (h.status === "scored") {
    assert.equal(h.score, 100);
    assert.equal(h.daysSinceCommit, 3);
  }
  const stale = computeHealth({ ...base, lastCommitAt: "2024-01-01T00:00:00Z" }, 1000, snapshotAt);
  assert.equal(stale.status === "scored" && stale.score, 40);
});

test("missing, archived, private or new repos are not scored", () => {
  for (const input of [
    { ...base, stars: null },
    { ...base, lastCommitAt: null },
    { ...base, archived: true },
    { ...base, isPrivate: true },
    { ...base, createdAt: "2026-08-01T00:00:00Z" },
  ]) {
    assert.equal(computeHealth(input, 1000, snapshotAt).status, "insufficient");
  }
});
