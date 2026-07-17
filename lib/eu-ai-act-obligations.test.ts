import test from "node:test";
import assert from "node:assert/strict";

import obligationsData from "../data/eu-ai-act-obligations.json" with { type: "json" };
import {
  euAiActObligations,
  getObligationsForActor,
  getObligationsForRiskTier,
  parseObligationsDataset,
} from "./eu-ai-act-obligations.ts";

test("obligations dataset parses and stays structurally explicit", () => {
  const dataset = parseObligationsDataset(obligationsData);
  assert.match(dataset.asOf, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(dataset.statusSummary.length > 100);
  assert.match(dataset.statusSourceUrl, /^https:\/\//);
  assert.equal(dataset.obligations.length, 11);
  for (const obligation of dataset.obligations) {
    assert.match(obligation.sourceUrl, /^https:\/\//);
    assert.match(obligation.appliesFrom, /^\d{4}-\d{2}-\d{2}$/);
    if (obligation.deferral) {
      assert.match(obligation.deferral.sourceUrl, /^https:\/\//);
      assert.ok(
        obligation.deferral.proposedDate > obligation.appliesFrom,
        `${obligation.id}: deferral must move the date later`,
      );
    }
  }
});

test("parseObligationsDataset rejects malformed input", () => {
  assert.throws(() => parseObligationsDataset(null), /dataset is not an object/);
  assert.throws(() => parseObligationsDataset({ asOf: "2026-07-17" }), /invalid dataset envelope/);
  assert.throws(
    () =>
      parseObligationsDataset({
        asOf: "2026-07-17",
        statusSummary: "x".repeat(120),
        statusSourceUrl: "https://example.com/",
        obligations: [{ id: "broken" }],
      }),
    /invalid fields on broken/,
  );
});

test("parseObligationsDataset rejects duplicate obligation ids", () => {
  const valid = euAiActObligations.obligations[0];
  assert.throws(
    () =>
      parseObligationsDataset({
        asOf: "2026-07-17",
        statusSummary: "x".repeat(120),
        statusSourceUrl: "https://example.com/",
        obligations: [valid, valid],
      }),
    /duplicate obligation ids/,
  );
});

test("high-risk tier maps to the full high-risk obligation set plus tier-wide duties", () => {
  const ids = getObligationsForRiskTier("high-risk").map((obligation) => obligation.id);
  assert.ok(ids.includes("ai-literacy"));
  assert.ok(ids.includes("high-risk-provider-requirements"));
  assert.ok(ids.includes("high-risk-deployer-duties"));
  assert.ok(ids.includes("fundamental-rights-impact-assessment"));
  assert.ok(ids.includes("post-market-monitoring-incidents"));
  assert.ok(!ids.includes("limited-risk-transparency"));
  assert.ok(!ids.includes("gpai-transparency"), "GPAI obligations never map from a tool risk tier");
});

test("limited and minimal tiers map to their own obligations", () => {
  const limited = getObligationsForRiskTier("limited-risk").map((obligation) => obligation.id);
  assert.deepEqual(limited, ["ai-literacy", "limited-risk-transparency"]);

  const minimal = getObligationsForRiskTier("minimal-risk").map((obligation) => obligation.id);
  assert.deepEqual(minimal, ["ai-literacy", "voluntary-codes-of-conduct"]);
});

test("not-applicable and unknown tiers map to no obligations", () => {
  assert.deepEqual(getObligationsForRiskTier("not-applicable"), []);
  assert.deepEqual(getObligationsForRiskTier("unknown"), []);
});

test("actor lookup returns GPAI obligations only for gpai-provider", () => {
  const gpai = getObligationsForActor("gpai-provider").map((obligation) => obligation.id);
  assert.deepEqual(gpai, ["gpai-transparency", "gpai-systemic-risk"]);

  const deployer = getObligationsForActor("deployer").map((obligation) => obligation.id);
  assert.ok(deployer.includes("high-risk-deployer-duties"));
  assert.ok(!deployer.includes("gpai-transparency"));
});
