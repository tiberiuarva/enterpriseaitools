import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SCHEMA_APPLICATION_CATEGORY } from "./application-categories.ts";
import { CATEGORY_ORDER } from "./categories.ts";

describe("SCHEMA_APPLICATION_CATEGORY", () => {
  it("maps every category, and nothing else, to a schema.org application category", () => {
    assert.deepEqual(Object.keys(SCHEMA_APPLICATION_CATEGORY).sort(), [...CATEGORY_ORDER].sort());
    for (const category of CATEGORY_ORDER) {
      assert.match(SCHEMA_APPLICATION_CATEGORY[category], /^(Developer|Business|Security)Application$/);
    }
  });
});
