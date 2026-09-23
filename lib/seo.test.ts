import assert from "node:assert/strict";
import { test } from "node:test";
import { licenseSuffix, metaDescription } from "./seo.ts";

test("keeps whole sentences within the limit", () => {
  const text = `${"a".repeat(100)}. ${"b".repeat(80)}.`;
  assert.equal(metaDescription(text), `${"a".repeat(100)}.`);
});

test("appends the suffix only when it fits", () => {
  assert.equal(metaDescription("Runs models locally.", "Open source, MIT license."), "Runs models locally. Open source, MIT license.");
  const long = `${"a".repeat(140)}.`;
  assert.equal(metaDescription(long, "Open source, MIT license."), long);
});

test("falls back to a word-boundary clip when the first sentence is too long", () => {
  const out = metaDescription(`${"word ".repeat(40)}end.`);
  assert.ok(out.length <= 155);
  assert.ok(out.endsWith("…"));
});

test("cuts a long first sentence at its first clause", () => {
  assert.equal(metaDescription(`Works on your repo: ${"word ".repeat(40)}end.`), "Works on your repo.");
});

test("does not split on dots inside words like C/C++ or version numbers", () => {
  assert.equal(metaDescription("Uses llama.cpp v1.2 on CPU. Second."), "Uses llama.cpp v1.2 on CPU. Second.");
});

test("license suffix is omitted when unknown", () => {
  assert.equal(licenseSuffix(null), undefined);
  assert.equal(licenseSuffix("MIT"), "Open source, MIT license.");
});
