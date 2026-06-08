import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  FRESHNESS_THRESHOLD_DAYS,
  daysBetween,
  getFreshnessStatus,
  parseIsoCalendarDate,
} from "./freshness.ts";

describe("freshness", () => {
  it("parses an ISO calendar date", () => {
    const parsed = parseIsoCalendarDate("2026-01-15");
    assert.equal(parsed.toISOString(), "2026-01-15T00:00:00.000Z");
  });

  it("throws on a non-ISO date", () => {
    assert.throws(() => parseIsoCalendarDate("01/15/2026"));
    assert.throws(() => parseIsoCalendarDate("2026-13-01"));
  });

  it("computes whole days between two ISO dates", () => {
    assert.equal(daysBetween("2026-01-01", "2026-01-10"), 9);
    assert.equal(daysBetween("2026-01-10", "2026-01-01"), -9);
    assert.equal(daysBetween("2026-01-01", "2026-01-01"), 0);
  });

  it("marks a record as fresh inside the threshold", () => {
    assert.equal(getFreshnessStatus("2026-05-01", "2026-06-01"), "fresh");
  });

  it("marks a record as stale past the threshold", () => {
    const reviewed = "2026-01-01";
    const today = "2026-04-01"; // 90 days, > 60 default
    assert.equal(getFreshnessStatus(reviewed, today), "stale");
  });

  it("uses an explicit threshold when provided", () => {
    assert.equal(getFreshnessStatus("2026-05-01", "2026-06-15", 30), "stale");
    assert.equal(getFreshnessStatus("2026-05-01", "2026-06-15", 60), "fresh");
  });

  it("exposes the documented default threshold", () => {
    assert.equal(FRESHNESS_THRESHOLD_DAYS, 60);
  });
});
