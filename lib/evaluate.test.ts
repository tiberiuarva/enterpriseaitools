import test from "node:test";
import assert from "node:assert/strict";

import { evaluateTools, scoreTool, EVALUATE_QUESTIONS, type IntakeAnswers } from "./evaluate.ts";
import type { GovernanceStatus, Tool } from "./types.ts";

type ToolSpec = {
  id: string;
  category?: Tool["category"];
  type?: Tool["type"];
  models?: string[];
  residency?: GovernanceStatus;
  audit?: GovernanceStatus;
  soc2?: GovernanceStatus;
  iso27001?: GovernanceStatus;
  iso42001?: GovernanceStatus;
  licenseLevel?: string;
  status?: Tool["status"];
};

function makeTool(spec: ToolSpec): Tool {
  const claim = (status: GovernanceStatus = "unknown") => ({ status, detail: "x" });
  return {
    id: spec.id,
    name: spec.id,
    category: spec.category ?? "agents",
    type: spec.type ?? "opensource",
    status: spec.status ?? "active",
    governance: {
      dataResidency: claim(spec.residency),
      deployment: { ...claim("yes"), models: spec.models ?? ["self-hosted"] },
      auditLogging: claim(spec.audit),
      soc2: claim(spec.soc2),
      iso27001: claim(spec.iso27001),
      iso42001: claim(spec.iso42001),
      euAiAct: { ...claim("not-applicable"), role: "not-applicable" },
      licenseRisk: { ...claim("yes"), level: spec.licenseLevel ?? "low" },
      reviewedAt: "2026-05-26",
    },
  } as unknown as Tool;
}

const baseAnswers: IntakeAnswers = {
  category: "agents",
  sector: "general",
  dataSensitivity: "low",
  deployment: "saas-ok",
  jurisdiction: "global",
  euAiAct: "limited",
  ossTolerance: "proprietary-ok",
  certifications: "not-needed",
  auditLogging: "not-needed",
};

test("there are 9 intake questions covering the governance dimensions", () => {
  assert.equal(EVALUATE_QUESTIONS.length, 9);
  assert.ok(EVALUATE_QUESTIONS.some((q) => q.id === "category"));
  assert.ok(EVALUATE_QUESTIONS.some((q) => q.id === "deployment"));
});

test("category is a hard filter", () => {
  const tools = [makeTool({ id: "a", category: "agents" }), makeTool({ id: "b", category: "governance" })];
  const results = evaluateTools(tools, baseAnswers);
  assert.deepEqual(results.map((r) => r.tool.id), ["a"]);
});

test("self-hosted-required removes managed-only tools", () => {
  const tools = [
    makeTool({ id: "saas-only", models: ["saas"] }),
    makeTool({ id: "selfhost", models: ["self-hosted"] }),
  ];
  const results = evaluateTools(tools, { ...baseAnswers, deployment: "self-hosted-required" });
  assert.deepEqual(results.map((r) => r.tool.id), ["selfhost"]);
});

test("permissive-required filters out vendor/proprietary tools", () => {
  const tools = [makeTool({ id: "vendorish", type: "vendor", models: ["saas"] }), makeTool({ id: "oss", type: "opensource" })];
  const results = evaluateTools(tools, { ...baseAnswers, ossTolerance: "permissive-required" });
  assert.deepEqual(results.map((r) => r.tool.id), ["oss"]);
});

test("SOC 2 requirement ranks certified tools above non-certified and records a caution", () => {
  const tools = [
    makeTool({ id: "no-cert", soc2: "no" }),
    makeTool({ id: "certified", soc2: "yes" }),
  ];
  const results = evaluateTools(tools, { ...baseAnswers, certifications: "soc2-required" });
  assert.equal(results[0].tool.id, "certified");
  assert.ok(results[0].matches.some((m) => m.includes("SOC 2")));
  const laggard = results.find((r) => r.tool.id === "no-cert");
  assert.ok(laggard && laggard.cautions.some((c) => c.includes("SOC 2")));
});

test("regulated sector amplifies certification weight", () => {
  const tool = makeTool({ id: "c", soc2: "yes" });
  const general = scoreTool(tool, { ...baseAnswers, certifications: "soc2-required", sector: "general" });
  const regulated = scoreTool(tool, { ...baseAnswers, certifications: "soc2-required", sector: "regulated" });
  assert.ok(regulated.score > general.score);
});

test("high EU AI Act exposure rewards ISO 42001 and cautions when absent", () => {
  const withCert = scoreTool(makeTool({ id: "y", iso42001: "yes" }), { ...baseAnswers, euAiAct: "high-risk" });
  const without = scoreTool(makeTool({ id: "n", iso42001: "unknown" }), { ...baseAnswers, euAiAct: "high-risk" });
  assert.ok(withCert.score > without.score);
  assert.ok(without.cautions.some((c) => c.includes("ISO 42001")));
});
