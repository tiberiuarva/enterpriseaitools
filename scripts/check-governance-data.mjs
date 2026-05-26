import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const toolsPath = path.join(repoRoot, "data", "tools.json");

const CLAIM_STATUS = new Set(["yes", "partial", "no", "not-applicable", "unknown"]);
const ASSERTED_STATUS = new Set(["yes", "partial", "no"]);
const DEPLOYMENT_MODELS = new Set(["saas", "self-hosted", "on-prem", "sovereign", "hybrid"]);
const EU_AI_ACT_ROLES = new Set(["prohibited", "high-risk", "limited-risk", "minimal-risk", "not-applicable", "unknown"]);
const LICENSE_RISK_LEVELS = new Set(["low", "medium", "high", "unknown"]);
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SIMPLE_CLAIMS = ["dataResidency", "auditLogging", "soc2", "iso27001", "iso42001"];

function isAbsoluteUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateClaim(findings, toolId, field, claim) {
  if (typeof claim !== "object" || claim === null) {
    findings.push(`${toolId}: governance.${field} is missing or not an object`);
    return;
  }
  if (!CLAIM_STATUS.has(claim.status)) {
    findings.push(`${toolId}: governance.${field}.status "${claim.status}" is not a valid status`);
  }
  if (typeof claim.detail !== "string" || claim.detail.trim().length === 0) {
    findings.push(`${toolId}: governance.${field}.detail must be a non-empty string`);
  }
  if (ASSERTED_STATUS.has(claim.status) && !isAbsoluteUrl(claim.sourceUrl)) {
    findings.push(`${toolId}: governance.${field} asserts "${claim.status}" but has no valid sourceUrl`);
  }
}

const toolsJson = JSON.parse(await fs.readFile(toolsPath, "utf8"));
const tools = toolsJson.tools ?? [];

const findings = [];

for (const tool of tools) {
  const toolId = `${tool.category}/${tool.id}`;
  const governance = tool.governance;

  if (typeof governance !== "object" || governance === null) {
    findings.push(`${toolId}: missing required "governance" object`);
    continue;
  }

  for (const field of SIMPLE_CLAIMS) {
    validateClaim(findings, toolId, field, governance[field]);
  }

  validateClaim(findings, toolId, "deployment", governance.deployment);
  const models = governance.deployment?.models;
  if (!Array.isArray(models) || models.length === 0) {
    findings.push(`${toolId}: governance.deployment.models must be a non-empty array`);
  } else {
    const invalid = models.filter((model) => !DEPLOYMENT_MODELS.has(model));
    if (invalid.length > 0) {
      findings.push(`${toolId}: governance.deployment.models has invalid values: ${invalid.join(", ")}`);
    }
  }

  validateClaim(findings, toolId, "euAiAct", governance.euAiAct);
  if (!EU_AI_ACT_ROLES.has(governance.euAiAct?.role)) {
    findings.push(`${toolId}: governance.euAiAct.role "${governance.euAiAct?.role}" is not valid`);
  }

  validateClaim(findings, toolId, "licenseRisk", governance.licenseRisk);
  if (!LICENSE_RISK_LEVELS.has(governance.licenseRisk?.level)) {
    findings.push(`${toolId}: governance.licenseRisk.level "${governance.licenseRisk?.level}" is not valid`);
  }

  if (!ISO_DATE.test(governance.reviewedAt ?? "")) {
    findings.push(`${toolId}: governance.reviewedAt must be an ISO date (YYYY-MM-DD)`);
  }
}

if (findings.length > 0) {
  console.error("Governance data check FAILED:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  console.error(`\n${findings.length} governance issue(s) across ${tools.length} tools.`);
  process.exitCode = 1;
} else {
  console.log(`Governance data check passed: all ${tools.length} tools carry a complete, source-backed governance posture.`);
}
