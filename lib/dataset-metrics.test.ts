import test from "node:test";
import assert from "node:assert/strict";

import { filterToolsByCategory, latestIsoDate } from "./dataset-metrics.ts";
import type { ToolCategory } from "./types.ts";

type Categorized = { id: string; category: ToolCategory };

const sample: Categorized[] = [
  { id: "a", category: "agents" },
  { id: "b", category: "agents" },
  { id: "c", category: "governance" },
  { id: "d", category: "orchestration" },
];

test("filterToolsByCategory returns only matching records", () => {
  const agents = filterToolsByCategory(sample, "agents");
  assert.deepEqual(
    agents.map((item) => item.id),
    ["a", "b"],
  );
});

test("filterToolsByCategory yields the count both surfaces should share", () => {
  assert.equal(filterToolsByCategory(sample, "agents").length, 2);
  assert.equal(filterToolsByCategory(sample, "governance").length, 1);
  assert.equal(filterToolsByCategory(sample, "assistants").length, 0);
});

test("latestIsoDate picks the newest ISO date", () => {
  assert.equal(latestIsoDate(["2026-04-15", "2026-05-23", "2026-03-12"]), "2026-05-23");
});

test("latestIsoDate ignores empty and nullish candidates", () => {
  assert.equal(latestIsoDate([null, undefined, "", "2026-01-01"]), "2026-01-01");
});

test("latestIsoDate returns null when no valid candidate exists", () => {
  assert.equal(latestIsoDate([null, undefined, ""]), null);
});
