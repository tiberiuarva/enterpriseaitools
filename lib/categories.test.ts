import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { CATEGORIES, CATEGORY_ORDER } from "./categories.ts";

const keys = Object.keys(CATEGORIES);

describe("categories", () => {
  it("CATEGORY_ORDER lists every category exactly once", () => {
    assert.equal(new Set(CATEGORY_ORDER).size, CATEGORY_ORDER.length, "CATEGORY_ORDER has duplicates");
    assert.deepEqual([...CATEGORY_ORDER].sort(), [...keys].sort());
  });

  it("each entry's slug matches its key", () => {
    for (const key of keys) {
      assert.equal(CATEGORIES[key as keyof typeof CATEGORIES].slug, key);
    }
  });

  it("meta descriptions fit search snippets (90–160 chars)", () => {
    for (const category of CATEGORY_ORDER) {
      const { length } = CATEGORIES[category].metaDescription;
      assert.ok(length >= 90 && length <= 160, `${category} metaDescription is ${length} chars`);
    }
  });

  it("labels are non-empty and icons are unique", () => {
    for (const category of CATEGORY_ORDER) {
      const meta = CATEGORIES[category];
      for (const field of ["navLabel", "title", "summary", "intro", "evaluateLabel"] as const) {
        assert.ok(meta[field].trim().length > 0, `${category}.${field} is empty`);
      }
    }
    const icons = CATEGORY_ORDER.map((category) => CATEGORIES[category].iconName);
    assert.equal(new Set(icons).size, icons.length, "two categories share an icon");
  });

  // Node scripts cannot import TS, so the generator keeps its own copy of the
  // titles and order; this keeps feeds and llms.txt from drifting.
  it("scripts/generate-seo-artifacts.mjs mirrors titles and order", () => {
    const script = readFileSync(new URL("../scripts/generate-seo-artifacts.mjs", import.meta.url), "utf8");
    const block = script.match(/const CATEGORY_LABELS = \{([\s\S]*?)\};/);
    assert.ok(block, "CATEGORY_LABELS block not found");
    const entries = [...block[1].matchAll(/^\s*"?([a-z-]+)"?:\s*"([^"]+)",?$/gm)].map((match) => [match[1], match[2]]);
    assert.deepEqual(
      entries,
      CATEGORY_ORDER.map((category) => [category, CATEGORIES[category].title]),
    );
  });

  it("scripts/check-open-data.mjs and logo-audit-report.mjs list every category", () => {
    for (const file of ["check-open-data.mjs", "logo-audit-report.mjs"]) {
      const script = readFileSync(new URL(`../scripts/${file}`, import.meta.url), "utf8");
      for (const category of CATEGORY_ORDER) {
        assert.ok(script.includes(`"${category}"`), `${file} is missing category ${category}`);
      }
    }
  });
});
