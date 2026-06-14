import test from "node:test";
import assert from "node:assert/strict";

import milestoneData from "../data/eu-ai-act.json" with { type: "json" };
import { getCurrentAndNextMilestones, getDaysUntil } from "./eu-ai-act.ts";

test("milestone dataset stays structurally explicit", () => {
  assert.equal(milestoneData.length, 4);
  assert.deepEqual(
    milestoneData.map((milestone) => milestone.appliesOn),
    ["2025-02-02", "2025-08-02", "2026-08-02", "2027-08-02"],
  );
  for (const milestone of milestoneData) {
    assert.match(milestone.appliesOn, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(milestone.label.length > 0);
    assert.ok(milestone.summary.length > 0);
    assert.match(milestone.sourceUrl, /^https:\/\//);
  }
});

test("getDaysUntil normalizes to UTC midnight", () => {
  assert.equal(getDaysUntil("2026-08-02", new Date("2026-08-01T23:59:59-07:00")), 0);
  assert.equal(getDaysUntil("2026-08-02", new Date("2026-08-02T00:00:01+14:00")), 1);
});

test("getCurrentAndNextMilestones keeps today's tranche as upcoming", () => {
  const result = getCurrentAndNextMilestones(new Date("2026-08-02T12:00:00Z"));

  assert.equal(result.hasUpcomingMilestone, true);
  assert.equal(result.nextMilestone.appliesOn, "2026-08-02");
  assert.equal(result.nextMilestone.daysUntil, 0);
  assert.deepEqual(
    result.currentMilestones.map((milestone) => milestone.appliesOn),
    ["2025-02-02", "2025-08-02"],
  );
});

test("getCurrentAndNextMilestones rolls a passed tranche into current milestones the next day", () => {
  const result = getCurrentAndNextMilestones(new Date("2026-08-03T00:00:00Z"));

  assert.equal(result.hasUpcomingMilestone, true);
  assert.equal(result.nextMilestone.appliesOn, "2027-08-02");
  assert.deepEqual(
    result.currentMilestones.map((milestone) => milestone.appliesOn),
    ["2025-02-02", "2025-08-02", "2026-08-02"],
  );
});

test("getCurrentAndNextMilestones falls back to the final tranche after all milestones pass", () => {
  const result = getCurrentAndNextMilestones(new Date("2027-08-03T00:00:00Z"));

  assert.equal(result.hasUpcomingMilestone, false);
  assert.equal(result.nextMilestone.appliesOn, "2027-08-02");
  assert.equal(result.nextMilestone.daysUntil, -1);
  assert.deepEqual(
    result.currentMilestones.map((milestone) => milestone.appliesOn),
    ["2025-02-02", "2025-08-02", "2026-08-02"],
  );
});

test("getCurrentAndNextMilestones sorts out-of-order milestone data before picking the next tranche", () => {
  const result = getCurrentAndNextMilestones(
    new Date("2026-08-01T00:00:00Z"),
    [
      {
        label: "2027 tranche",
        appliesOn: "2027-08-02",
        summary: "Final tranche.",
        sourceUrl: "https://example.com/2027",
      },
      {
        label: "2025 tranche",
        appliesOn: "2025-08-02",
        summary: "Earlier tranche.",
        sourceUrl: "https://example.com/2025",
      },
      {
        label: "2026 tranche",
        appliesOn: "2026-08-02",
        summary: "Next tranche.",
        sourceUrl: "https://example.com/2026",
      },
    ],
  );

  assert.equal(result.nextMilestone.appliesOn, "2026-08-02");
  assert.deepEqual(
    result.currentMilestones.map((milestone) => milestone.appliesOn),
    ["2025-08-02"],
  );
});

test("getCurrentAndNextMilestones keeps single-milestone fallback semantics stable", () => {
  const milestone = {
    label: "Only tranche",
    appliesOn: "2027-08-02",
    summary: "Single tranche.",
    sourceUrl: "https://example.com/only",
  };

  const upcomingResult = getCurrentAndNextMilestones(new Date("2027-08-01T00:00:00Z"), [milestone]);
  assert.equal(upcomingResult.nextMilestone.appliesOn, "2027-08-02");
  assert.deepEqual(upcomingResult.currentMilestones, []);

  const pastResult = getCurrentAndNextMilestones(new Date("2027-08-03T00:00:00Z"), [milestone]);
  assert.equal(pastResult.hasUpcomingMilestone, false);
  assert.equal(pastResult.nextMilestone.appliesOn, "2027-08-02");
  assert.deepEqual(pastResult.currentMilestones, []);
});
