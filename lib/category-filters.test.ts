import test from "node:test";
import assert from "node:assert/strict";

import { filterTools, isDeploymentModel, isLicenseRiskLevel, type CategoryFilterState } from "./category-filters.ts";
import type { Tool } from "./types.ts";

test("isDeploymentModel accepts valid models and rejects others", () => {
  assert.equal(isDeploymentModel("self-hosted"), true);
  assert.equal(isDeploymentModel("saas"), true);
  assert.equal(isDeploymentModel("on-premises"), false);
  assert.equal(isDeploymentModel("all"), false);
});

test("isLicenseRiskLevel accepts valid levels and rejects others", () => {
  assert.equal(isLicenseRiskLevel("low"), true);
  assert.equal(isLicenseRiskLevel("high"), true);
  assert.equal(isLicenseRiskLevel("critical"), false);
  assert.equal(isLicenseRiskLevel("all"), false);
});

function makeTool(id: string, models: string[], level: string): Tool {
  return {
    id,
    name: id,
    governance: {
      deployment: { models },
      licenseRisk: { level },
    },
  } as unknown as Tool;
}

const baseState: CategoryFilterState = {
  type: "all",
  cloud: "all",
  license: "all",
  deployment: "all",
  licenseRisk: "all",
  sort: "name",
};

const sample: Tool[] = [
  makeTool("saas-high", ["saas"], "high"),
  makeTool("selfhosted-low", ["self-hosted"], "low"),
  makeTool("hybrid-medium", ["saas", "self-hosted"], "medium"),
];

test("filterTools narrows by deployment model", () => {
  const result = filterTools(sample, { ...baseState, deployment: "self-hosted" });
  assert.deepEqual(result.map((tool) => tool.id).sort(), ["hybrid-medium", "selfhosted-low"]);
});

test("filterTools narrows by license risk level", () => {
  const result = filterTools(sample, { ...baseState, licenseRisk: "low" });
  assert.deepEqual(
    result.map((tool) => tool.id),
    ["selfhosted-low"],
  );
});
