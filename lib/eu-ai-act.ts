export const EU_AI_ACT_OFFICIAL_URL = "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai";

export type EuAiActMilestone = {
  slug: string;
  label: string;
  appliesOn: string;
  summary: string;
};

export const euAiActMilestones: EuAiActMilestone[] = [
  {
    slug: "prohibited-practices",
    label: "Prohibited AI practices and AI literacy",
    appliesOn: "2025-02-02",
    summary: "Already applicable.",
  },
  {
    slug: "gpai-obligations",
    label: "General-purpose AI model obligations",
    appliesOn: "2025-08-02",
    summary: "Already applicable.",
  },
  {
    slug: "broad-applicability",
    label: "Most AI Act obligations",
    appliesOn: "2026-08-02",
    summary: "Broad applicability date for most remaining AI Act obligations.",
  },
  {
    slug: "high-risk-legacy-systems",
    label: "Certain remaining high-risk AI obligations",
    appliesOn: "2027-08-02",
    summary: "Later applicability date for the remaining high-risk tranche referenced by the Commission timeline.",
  },
];

function startOfUtcDay(value: Date) {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

export function parseUtcDate(dateString: string) {
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
  const target = startOfUtcDay(parseUtcDate(dateString));
  const today = startOfUtcDay(now);
  return Math.ceil((target - today) / 86_400_000);
}

export function getCurrentAndNextMilestones(now = new Date()) {
  const datedMilestones = euAiActMilestones.map((milestone) => ({
    ...milestone,
    daysUntil: getDaysUntil(milestone.appliesOn, now),
  }));

  const nextMilestone = datedMilestones.find((milestone) => milestone.daysUntil >= 0) ?? datedMilestones[datedMilestones.length - 1];
  const currentMilestones = datedMilestones.filter((milestone) => milestone.daysUntil < 0);

  return {
    nextMilestone,
    currentMilestones,
  };
}
