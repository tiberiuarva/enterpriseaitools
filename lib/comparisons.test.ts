import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { comparisonPairs, getComparisonPair } from "./comparisons.ts";

describe("comparisons", () => {
  it("exposes a non-empty list of comparison pairs", () => {
    assert.ok(Array.isArray(comparisonPairs));
    assert.ok(comparisonPairs.length > 0);
  });

  it("every pair has the required fields", () => {
    for (const pair of comparisonPairs) {
      assert.equal(typeof pair.slug, "string");
      assert.ok(pair.slug.length > 0);
      assert.ok(Array.isArray(pair.toolIds));
      assert.ok(pair.toolIds.length >= 2 && pair.toolIds.length <= 3);
      assert.equal(typeof pair.title, "string");
      assert.ok(pair.title.length > 0);
      assert.equal(typeof pair.description, "string");
      assert.ok(pair.description.length > 0);
    }
  });

  it("slugs are unique", () => {
    const slugs = comparisonPairs.map((pair) => pair.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it("getComparisonPair returns the matching pair for a known slug", () => {
    const known = comparisonPairs[0];
    const found = getComparisonPair(known.slug);
    assert.ok(found);
    assert.equal(found?.slug, known.slug);
    assert.deepEqual(found?.toolIds, known.toolIds);
  });

  it("getComparisonPair returns undefined for an unknown slug", () => {
    assert.equal(getComparisonPair("not-a-real-comparison-slug"), undefined);
  });
});
