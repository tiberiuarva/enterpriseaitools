import milestoneData from "../data/eu-ai-act.json" with { type: "json" };

export const EU_AI_ACT_OFFICIAL_URL = "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai";

export type EuAiActMilestone = {
  label: string;
  appliesOn: string;
  summary: string;
};

type DatedEuAiActMilestone = EuAiActMilestone & {
  daysUntil: number;
};

// Source of truth for milestone labels/dates: European Commission AI Act timeline.
const euAiActMilestones: EuAiActMilestone[] = milestoneData;

function startOfUtcDayMs(value: Date) {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function parseUtcDate(dateString: string) {
  return new Date(`${dateString}T00:00:00Z`);
}

export function formatUtcDate(dateString: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parseUtcDate(dateString));
}

/**
 * @param dateString YYYY-MM-DD UTC date string from the official milestone dataset.
 */
export function getDaysUntil(dateString: string, now = new Date()) {
  const target = startOfUtcDayMs(parseUtcDate(dateString));
  const today = startOfUtcDayMs(now);
  return (target - today) / 86_400_000;
}

export function getCurrentAndNextMilestones(
  now = new Date(),
  milestones: EuAiActMilestone[] = euAiActMilestones,
): {
  nextMilestone: DatedEuAiActMilestone;
  currentMilestones: DatedEuAiActMilestone[];
  hasUpcomingMilestone: boolean;
} {
  const datedMilestones = milestones
    .map((milestone) => ({
      ...milestone,
      daysUntil: getDaysUntil(milestone.appliesOn, now),
    }))
    .sort((a, b) => a.appliesOn.localeCompare(b.appliesOn));

  if (datedMilestones.length === 0) {
    throw new Error("EU AI Act milestone dataset is empty");
  }

  const nextUpcomingMilestone = datedMilestones.find((milestone) => milestone.daysUntil >= 0);
  const hasUpcomingMilestone = Boolean(nextUpcomingMilestone);
  const nextMilestone = nextUpcomingMilestone ?? datedMilestones.at(-1)!;
  const currentMilestones = hasUpcomingMilestone
    ? datedMilestones.filter((milestone) => milestone.daysUntil < 0)
    : datedMilestones.filter((milestone) => milestone !== nextMilestone);

  // We intentionally surface only the latest already-in-force tranche in banner copy.
  return {
    nextMilestone,
    currentMilestones,
    hasUpcomingMilestone,
  };
}
