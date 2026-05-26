import type { DeploymentModel, LicenseRiskLevel, Tool, ToolType } from "@/lib/types";

export type CategoryFilterState = {
  type: "all" | ToolType;
  cloud: "all" | "azure" | "aws" | "gcp";
  license: string;
  deployment: "all" | DeploymentModel;
  licenseRisk: "all" | LicenseRiskLevel;
  sort: "name" | "stars" | "updated";
};

const DEPLOYMENT_MODELS: DeploymentModel[] = ["saas", "self-hosted", "on-prem", "sovereign", "hybrid"];
const LICENSE_RISK_LEVELS: LicenseRiskLevel[] = ["low", "medium", "high", "unknown"];

export function isDeploymentModel(value: string): value is DeploymentModel {
  return (DEPLOYMENT_MODELS as string[]).includes(value);
}

export function isLicenseRiskLevel(value: string): value is LicenseRiskLevel {
  return (LICENSE_RISK_LEVELS as string[]).includes(value);
}

export function parseCategoryFilterState(searchParams?: Record<string, string | string[] | undefined>): CategoryFilterState {
  const type = typeof searchParams?.type === "string" ? searchParams.type : "all";
  const cloud = typeof searchParams?.cloud === "string" ? searchParams.cloud : "all";
  const license = typeof searchParams?.license === "string" ? searchParams.license : "all";
  const deployment = typeof searchParams?.deployment === "string" ? searchParams.deployment : "all";
  const licenseRisk = typeof searchParams?.licenseRisk === "string" ? searchParams.licenseRisk : "all";
  const sort = typeof searchParams?.sort === "string" ? searchParams.sort : "name";

  return {
    type: type === "vendor" || type === "opensource" || type === "commercial" ? type : "all",
    cloud: cloud === "azure" || cloud === "aws" || cloud === "gcp" ? cloud : "all",
    license,
    deployment: isDeploymentModel(deployment) ? deployment : "all",
    licenseRisk: isLicenseRiskLevel(licenseRisk) ? licenseRisk : "all",
    sort: sort === "stars" || sort === "updated" ? sort : "name",
  };
}

export function filterTools(tools: Tool[], state: CategoryFilterState) {
  return [...tools]
    .filter((tool) => state.type === "all" || tool.type === state.type)
    .filter((tool) => state.cloud === "all" || tool.clouds?.includes(state.cloud))
    .filter((tool) => state.license === "all" || tool.license === state.license)
    .filter((tool) => state.deployment === "all" || tool.governance.deployment.models.includes(state.deployment))
    .filter((tool) => state.licenseRisk === "all" || tool.governance.licenseRisk.level === state.licenseRisk)
    .sort((a, b) => {
      if (state.sort === "stars") return (b.githubStars ?? 0) - (a.githubStars ?? 0);
      if (state.sort === "updated") return (b.lastRelease ?? "").localeCompare(a.lastRelease ?? "");
      return a.name.localeCompare(b.name);
    });
}

export function getAvailableLicenses(tools: Tool[]) {
  return Array.from(new Set(tools.map((tool) => tool.license))).sort((a, b) => a.localeCompare(b));
}
