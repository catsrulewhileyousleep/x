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

test("popularity is log-scaled between fixed anchors and clamped", () => {
  assert.equal(popularityScore(1_000), 0);
  assert.equal(popularityScore(200_000), 100);
  assert.equal(popularityScore(0), 0);
  assert.equal(popularityScore(500), 0);
  assert.equal(popularityScore(2_000_000), 100);
  // Geometric midpoint of the anchors, ~14.1k stars, sits at 50.
  const mid = popularityScore(Math.sqrt(1_000 * 200_000));
  assert.ok(Math.abs(mid - 50) < 1e-9, `expected 50, got ${mid}`);
  assert.ok(popularityScore(50_000) > popularityScore(5_000));
});


test("score combines 40% popularity and 60% maintenance", () => {
  const top = computeHealth({ ...base, stars: 200_000 }, snapshotAt);
  assert.equal(top.status, "scored");
  if (top.status === "scored") {
    assert.equal(top.score, 100);
    assert.equal(top.daysSinceCommit, 3);
  }
  const stale = computeHealth({ ...base, stars: 200_000, lastCommitAt: "2024-01-01T00:00:00Z" }, snapshotAt);
  assert.equal(stale.status === "scored" && stale.score, 40);
  const small = computeHealth({ ...base, stars: 1_000 }, snapshotAt);
  assert.equal(small.status === "scored" && small.score, 60);
});

test("missing, archived, private or new repos are not scored", () => {
  for (const input of [
    { ...base, stars: null },
    { ...base, lastCommitAt: null },
    { ...base, archived: true },
    { ...base, isPrivate: true },
    { ...base, createdAt: "2026-08-01T00:00:00Z" },
  ]) {
    assert.equal(computeHealth(input, snapshotAt).status, "insufficient");
  }
});
