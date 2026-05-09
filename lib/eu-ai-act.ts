export const EU_AI_ACT_OFFICIAL_URL = "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai";

// Source of truth for milestone labels/dates: European Commission AI Act timeline.

export type EuAiActMilestone = {
  label: string;
  appliesOn: string;
  summary: string;
};

const euAiActMilestones: EuAiActMilestone[] = [
  {
    label: "Prohibited AI practices and AI literacy",
    appliesOn: "2025-02-02",
    summary: "Already applicable.",
  },
  {
    label: "Governance rules and general-purpose AI model obligations",
    appliesOn: "2025-08-02",
    summary: "Already applicable.",
  },
  {
    label: "Most AI Act obligations",
    appliesOn: "2026-08-02",
    summary: "Broad applicability date for most remaining AI Act obligations.",
  },
  {
    label: "Certain remaining high-risk AI obligations",
    appliesOn: "2027-08-02",
    summary: "Final high-risk obligations apply.",
  },
];

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

export function getDaysUntil(dateString: string, now = new Date()) {
  const target = startOfUtcDayMs(parseUtcDate(dateString));
  const today = startOfUtcDayMs(now);
  return (target - today) / 86_400_000;
}

export function getCurrentAndNextMilestones(now = new Date()) {
  const datedMilestones = euAiActMilestones.map((milestone) => ({
    ...milestone,
    daysUntil: getDaysUntil(milestone.appliesOn, now),
  }));

  const nextUpcomingMilestone = datedMilestones.find((milestone) => milestone.daysUntil >= 0);
  const hasUpcomingMilestone = Boolean(nextUpcomingMilestone);
  const nextMilestone = nextUpcomingMilestone ?? datedMilestones.at(-1)!;
  const currentMilestones = datedMilestones.filter((milestone) => milestone.daysUntil < 0);

  // We intentionally surface only the latest already-in-force tranche in banner copy.
  return {
    nextMilestone,
    currentMilestones,
    hasUpcomingMilestone,
  };
}
