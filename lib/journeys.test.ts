import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { CATEGORY_ORDER } from "./categories.ts";
import { JOURNEYS } from "./journeys.ts";

describe("journeys", () => {
  it("have unique URL-safe ids and complete copy", () => {
    assert.equal(new Set(JOURNEYS.map((journey) => journey.id)).size, JOURNEYS.length);
    for (const journey of JOURNEYS) {
      assert.match(journey.id, /^[a-z0-9-]+$/);
      assert.ok(journey.question.trim().length > 0 && journey.summary.trim().length > 0);
      assert.ok(journey.steps.length >= 3, `${journey.id} needs at least 3 steps`);
    }
  });

  it("only point at real categories, each once per journey", () => {
    for (const journey of JOURNEYS) {
      const categories = journey.steps.map((step) => step.category);
      assert.equal(new Set(categories).size, categories.length, `${journey.id} repeats a category`);
      for (const step of journey.steps) {
        assert.ok(CATEGORY_ORDER.includes(step.category), `${journey.id}: unknown category ${step.category}`);
        assert.ok(step.decide.trim().length > 0);
      }
    }
  });
});
