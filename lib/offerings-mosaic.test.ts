import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import type { VendorOverview, VendorProminence } from "./types.ts";
import { balancedRows, familyChipLabel, familyTiles, headsPerRow, lensActive, lensMatches, mosaicSpans, searchTerms, tileWeight } from "./offerings-mosaic.ts";

const entry = (id: string, prominence: VendorProminence) => ({ id, prominence });

describe("familyTiles", () => {
  test("makes the first headline the anchor and orders the rest by prominence", () => {
    const tiles = familyTiles([entry("a", "detail"), entry("b", "headline"), entry("c", "standard"), entry("d", "headline")], true);
    assert.deepEqual(
      tiles.map((tile) => `${tile.entry.id}:${tile.tier}`),
      ["b:anchor", "d:flagship", "c:core", "a:support"],
    );
  });

  test("keeps data order inside a tier", () => {
    const tiles = familyTiles([entry("a", "standard"), entry("b", "standard"), entry("c", "standard")], true);
    assert.deepEqual(
      tiles.map((tile) => tile.entry.id),
      ["a", "b", "c"],
    );
  });

  test("gives no anchor to a quiet family or a family without headlines", () => {
    assert.deepEqual(
      familyTiles([entry("a", "headline"), entry("b", "headline")], false).map((tile) => tile.tier),
      ["flagship", "flagship"],
    );
    assert.deepEqual(
      familyTiles([entry("a", "standard"), entry("b", "detail")], true).map((tile) => tile.tier),
      ["core", "support"],
    );
  });
});

describe("tileWeight", () => {
  test("headline tiles weigh the same whatever their name; the rest grow with it", () => {
    assert.equal(tileWeight("anchor", "A"), tileWeight("flagship", "A much longer product name"));
    assert.ok(tileWeight("core", "Prompt caching") > tileWeight("core", "Hooks"));
    assert.ok(tileWeight("core", "Hooks") > tileWeight("support", "Hooks"));
    assert.ok(tileWeight("flagship", "Bun") > tileWeight("core", "Customer-managed encryption keys"));
  });
});

describe("mosaicSpans", () => {
  const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

  test("fills every row of the grid exactly", () => {
    for (const [weights, perRow] of [
      [[6, 35, 23, 20, 10], 2],
      [[13, 8, 12, 12, 7], 3],
      [[1, 1, 1, 1, 1, 1, 1], 4],
      [[100, 1, 1], 3],
    ] as const) {
      const spans = mosaicSpans(weights, perRow);
      for (let start = 0; start < spans.length; start += perRow) assert.equal(sum(spans.slice(start, start + perRow)), 12, `${weights} row ${start}`);
    }
  });

  test("sizes blocks by weight but never below the minimum span", () => {
    assert.deepEqual(mosaicSpans([6, 35, 23, 20, 10], 2), [3, 9, 6, 6, 12]);
    assert.deepEqual(mosaicSpans([100, 1, 1], 3), [6, 3, 3]);
  });

  test("splits evenly when weights are equal or empty", () => {
    assert.deepEqual(mosaicSpans([5, 5, 5], 3), [4, 4, 4]);
    assert.deepEqual(mosaicSpans([0, 0], 2), [6, 6]);
    assert.deepEqual(mosaicSpans([], 3), []);
  });

  test("lowers the minimum when a row has more blocks than it allows", () => {
    assert.deepEqual(mosaicSpans([1, 1, 1, 1, 1, 1], 6), [2, 2, 2, 2, 2, 2]);
  });

  test("lays out the Anthropic families without a ragged row", () => {
    const overview = JSON.parse(readFileSync(new URL("../data/stacks/anthropic.json", import.meta.url), "utf8")) as VendorOverview;
    for (const [clusters, perRow] of [
      [["products"], 2],
      [["ecosystem", "company"], 3],
    ] as const) {
      const families = overview.domains.filter((domain) => (clusters as readonly string[]).includes(domain.cluster));
      const weights = families.map((domain) =>
        familyTiles(
          overview.entries.filter((item) => item.domainId === domain.id && !item.parentId),
          true,
        ).reduce((total, tile) => total + tileWeight(tile.tier, tile.entry.name), 0),
      );
      const spans = mosaicSpans(weights, perRow);
      assert.equal(spans.length, families.length);
      assert.ok(spans.every((span) => span >= 3));
      for (let start = 0; start < spans.length; start += perRow) assert.equal(sum(spans.slice(start, start + perRow)), 12);
    }
  });
});

describe("headline rows", () => {
  test("wider blocks fit more headline tiles per row", () => {
    assert.deepEqual(
      [3, 4, 5, 6, 8, 9, 12].map(headsPerRow),
      [1, 2, 2, 3, 3, 4, 5],
    );
    assert.equal(headsPerRow(1), 1);
  });

  test("balances rows, shorter first, without exceeding the maximum", () => {
    assert.deepEqual(balancedRows(4, 3), [2, 2]);
    assert.deepEqual(balancedRows(5, 3), [2, 3]);
    assert.deepEqual(balancedRows(5, 5), [5]);
    assert.deepEqual(balancedRows(7, 3), [2, 2, 3]);
    assert.deepEqual(balancedRows(4, 1), [1, 1, 1, 1]);
    assert.deepEqual(balancedRows(3, 0), [1, 1, 1]);
    assert.deepEqual(balancedRows(0, 3), []);
  });
});

describe("lens matching", () => {
  const tile = { facets: "new preview", audience: "developers enterprise", search: "claude managed agents hosted agent runtime" };
  const none = { facet: "", audiences: [], terms: [] };

  test("an empty lens lights everything and is not active", () => {
    assert.equal(lensActive(none), false);
    assert.equal(lensMatches(tile, none), true);
    assert.equal(lensMatches({ facets: "", audience: "", search: "" }, none), true);
  });

  test("matches a facet as a whole word", () => {
    assert.equal(lensMatches(tile, { ...none, facet: "new" }), true);
    assert.equal(lensMatches({ ...tile, facets: "preview" }, { ...none, facet: "new" }), false);
    assert.equal(lensMatches({ ...tile, facets: "renew" }, { ...none, facet: "new" }), false);
  });

  test("an audience lens needs any one of its audiences", () => {
    assert.equal(lensMatches(tile, { ...none, audiences: ["admins", "enterprise"] }), true);
    assert.equal(lensMatches(tile, { ...none, audiences: ["public-sector", "education"] }), false);
  });

  test("search needs every term and combines with the other filters", () => {
    assert.equal(lensMatches(tile, { ...none, terms: searchTerms("  Managed   AGENT ") }), true);
    assert.equal(lensMatches(tile, { ...none, terms: searchTerms("managed slack") }), false);
    assert.equal(lensMatches(tile, { facet: "new", audiences: ["researchers"], terms: ["managed"] }), false);
    assert.equal(lensActive({ ...none, terms: searchTerms("x") }), true);
    assert.deepEqual(searchTerms("   "), []);
  });
});

describe("familyChipLabel", () => {
  test("drops the flagship prefix from descriptive family names only", () => {
    assert.equal(familyChipLabel("Claude models", "Claude"), "Models");
    assert.equal(familyChipLabel("Claude apps", "Claude"), "Apps");
    assert.equal(familyChipLabel("Claude Code", "Claude"), "Claude Code");
    assert.equal(familyChipLabel("Claude Developer Platform", "Claude"), "Developer Platform");
    assert.equal(familyChipLabel("Research", "Claude"), "Research");
    assert.equal(familyChipLabel("Claude", "Claude"), "Claude");
    assert.equal(familyChipLabel("Claude 4 family", "Claude"), "Claude 4 family");
    assert.equal(familyChipLabel("Research", ""), "Research");
  });
});
