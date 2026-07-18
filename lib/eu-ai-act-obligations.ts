import obligationsData from "../data/eu-ai-act-obligations.json" with { type: "json" };
import type { EuAiActRole } from "./types.ts";

export type EuAiActActor = "provider" | "deployer" | "gpai-provider";
export type EuAiActObligationTier = Exclude<EuAiActRole, "not-applicable" | "unknown"> | "all";
export type EuAiActObligationKind = "mandatory" | "voluntary";

export type EuAiActDeferral = {
  proposedDate: string;
  status: string;
  sourceUrl: string;
};

export type EuAiActObligation = {
  id: string;
  articles: string;
  title: string;
  actors: EuAiActActor[];
  riskTiers: EuAiActObligationTier[];
  kind: EuAiActObligationKind;
  appliesFrom: string;
  deferral?: EuAiActDeferral;
  summary: string;
  sourceUrl: string;
};

export type EuAiActObligationsDataset = {
  asOf: string;
  statusSummary: string;
  statusSourceUrl: string;
  obligations: EuAiActObligation[];
};

const ACTORS: readonly EuAiActActor[] = ["provider", "deployer", "gpai-provider"];
const TIERS: readonly EuAiActObligationTier[] = ["prohibited", "high-risk", "limited-risk", "minimal-risk", "all"];
const KINDS: readonly EuAiActObligationKind[] = ["mandatory", "voluntary"];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isHttpsUrl(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("https://");
}

function isOneOf<T extends string>(allowed: readonly T[], value: unknown): value is T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value);
}

function parseDeferral(value: unknown, id: string): EuAiActDeferral | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "object" || value === null) {
    throw new Error(`eu-ai-act-obligations: invalid deferral on ${id}`);
  }
  const deferral = value as Record<string, unknown>;
  if (
    !isNonEmptyString(deferral.proposedDate) ||
    !ISO_DATE_PATTERN.test(deferral.proposedDate) ||
    !isNonEmptyString(deferral.status) ||
    !isHttpsUrl(deferral.sourceUrl)
  ) {
    throw new Error(`eu-ai-act-obligations: invalid deferral fields on ${id}`);
  }
  return {
    proposedDate: deferral.proposedDate,
    status: deferral.status,
    sourceUrl: deferral.sourceUrl,
  };
}

function parseObligation(value: unknown): EuAiActObligation {
  if (typeof value !== "object" || value === null) {
    throw new Error("eu-ai-act-obligations: obligation is not an object");
  }
  const record = value as Record<string, unknown>;
  const id = record.id;
  if (!isNonEmptyString(id)) {
    throw new Error("eu-ai-act-obligations: obligation missing id");
  }
  if (
    !isNonEmptyString(record.articles) ||
    !isNonEmptyString(record.title) ||
    !isNonEmptyString(record.summary) ||
    !isHttpsUrl(record.sourceUrl) ||
    !isNonEmptyString(record.appliesFrom) ||
    !ISO_DATE_PATTERN.test(record.appliesFrom) ||
    !isOneOf(KINDS, record.kind) ||
    !Array.isArray(record.actors) ||
    record.actors.length === 0 ||
    !record.actors.every((actor) => isOneOf(ACTORS, actor)) ||
    !Array.isArray(record.riskTiers) ||
    record.riskTiers.length === 0 ||
    !record.riskTiers.every((tier) => isOneOf(TIERS, tier))
  ) {
    throw new Error(`eu-ai-act-obligations: invalid fields on ${id}`);
  }
  return {
    id,
    articles: record.articles,
    title: record.title,
    actors: record.actors,
    riskTiers: record.riskTiers,
    kind: record.kind,
    appliesFrom: record.appliesFrom,
    deferral: parseDeferral(record.deferral, id),
    summary: record.summary,
    sourceUrl: record.sourceUrl,
  };
}

export function parseObligationsDataset(value: unknown): EuAiActObligationsDataset {
  if (typeof value !== "object" || value === null) {
    throw new Error("eu-ai-act-obligations: dataset is not an object");
  }
  const dataset = value as Record<string, unknown>;
  if (
    !isNonEmptyString(dataset.asOf) ||
    !ISO_DATE_PATTERN.test(dataset.asOf) ||
    !isNonEmptyString(dataset.statusSummary) ||
    !isHttpsUrl(dataset.statusSourceUrl) ||
    !Array.isArray(dataset.obligations) ||
    dataset.obligations.length === 0
  ) {
    throw new Error("eu-ai-act-obligations: invalid dataset envelope");
  }
  const obligations = dataset.obligations.map(parseObligation);
  const ids = new Set(obligations.map((obligation) => obligation.id));
  if (ids.size !== obligations.length) {
    throw new Error("eu-ai-act-obligations: duplicate obligation ids");
  }
  return {
    asOf: dataset.asOf,
    statusSummary: dataset.statusSummary,
    statusSourceUrl: dataset.statusSourceUrl,
    obligations,
  };
}

export const euAiActObligations: EuAiActObligationsDataset = parseObligationsDataset(obligationsData);

/**
 * Obligations implicated for a tool record's `governance.euAiAct.role` risk
 * tier. GPAI-provider obligations are excluded: they attach to model
 * providers, which is not derivable from a tool's risk tier. `not-applicable`
 * and `unknown` return an empty list — the rendering layer explains why.
 */
export function getObligationsForRiskTier(
  role: EuAiActRole,
  dataset: EuAiActObligationsDataset = euAiActObligations,
): EuAiActObligation[] {
  if (role === "not-applicable" || role === "unknown") return [];
  return dataset.obligations.filter(
    (obligation) =>
      !obligation.actors.every((actor) => actor === "gpai-provider") &&
      (obligation.riskTiers.includes("all") || obligation.riskTiers.includes(role)),
  );
}

export function getObligationsForActor(
  actor: EuAiActActor,
  dataset: EuAiActObligationsDataset = euAiActObligations,
): EuAiActObligation[] {
  return dataset.obligations.filter((obligation) => obligation.actors.includes(actor));
}
