// Per-tool data freshness helpers. The threshold is documented in
// `data/SCHEMA.md` under the "Data freshness" section.

export const FRESHNESS_THRESHOLD_DAYS = 60;

const isoCalendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoCalendarDate(value: string): Date {
  if (!isoCalendarDatePattern.test(value)) {
    throw new Error(`Invalid ISO calendar date: ${value}`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ISO calendar date: ${value}`);
  }
  return parsed;
}

export function daysBetween(fromIso: string, toIso: string): number {
  const from = parseIsoCalendarDate(fromIso).getTime();
  const to = parseIsoCalendarDate(toIso).getTime();
  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

export type FreshnessStatus = "fresh" | "stale";

export function getFreshnessStatus(
  reviewedAt: string,
  today: string,
  thresholdDays: number = FRESHNESS_THRESHOLD_DAYS,
): FreshnessStatus {
  return daysBetween(reviewedAt, today) > thresholdDays ? "stale" : "fresh";
}
