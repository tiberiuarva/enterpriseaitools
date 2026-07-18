import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const toolsPath = path.join(repoRoot, "data", "tools.json");

const GENERIC_STRENGTH_PATTERNS = [
  /^mit licensed$/i,
  /^mit open source$/i,
  /^apache 2\.0 licensed$/i,
  /^apache 2\.0 open source$/i,
  /^large adoption$/i,
  /^large open source adoption$/i,
  /^active ecosystem$/i,
  /^active project status$/i,
  /^commercial support$/i,
  /^free oss availability$/i,
  /^simple oss availability$/i,
  /^visual workflow builder$/i,
  /^known coding assistant brand$/i,
  /^self-host(?:able|ed)(?: deployment)?$/i,
  /^self-hosted or cloud deployment$/i,
];

const toolsJson = JSON.parse(await fs.readFile(toolsPath, "utf8"));
const tools = toolsJson.tools ?? [];

const genericStrengthFindings = [];
const missingStrengthFindings = [];
const missingCloudBadgeCandidates = [];
const licenseHistoryFindings = [];

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LICENSE_DIRECTIONS = new Set(["open", "restrictive"]);

function checkLicenseHistory(tool) {
  const history = tool.licenseHistory;
  if (history === undefined) return;
  if (!Array.isArray(history) || history.length === 0) {
    licenseHistoryFindings.push(`${tool.id}: licenseHistory must be a non-empty array or absent`);
    return;
  }
  let previousDate = "";
  for (const [index, event] of history.entries()) {
    const label = `${tool.id}.licenseHistory[${index}]`;
    if (!ISO_DATE_PATTERN.test(event.date ?? "")) licenseHistoryFindings.push(`${label}: invalid date`);
    if (event.date < previousDate) licenseHistoryFindings.push(`${label}: events must ascend by date`);
    previousDate = event.date ?? previousDate;
    if (!event.fromLicense || !event.toLicense) licenseHistoryFindings.push(`${label}: fromLicense/toLicense required`);
    if (!LICENSE_DIRECTIONS.has(event.direction)) licenseHistoryFindings.push(`${label}: direction must be open|restrictive`);
    if (typeof event.sourceUrl !== "string" || !event.sourceUrl.startsWith("https://")) {
      licenseHistoryFindings.push(`${label}: https sourceUrl required`);
    }
    if (event.convertsOn !== undefined && !ISO_DATE_PATTERN.test(event.convertsOn)) {
      licenseHistoryFindings.push(`${label}: convertsOn must be an ISO date`);
    }
    if (event.convertsOn !== undefined && !event.convertsTo) {
      licenseHistoryFindings.push(`${label}: convertsTo required when convertsOn is set`);
    }
  }
  const latest = history[history.length - 1];
  if (latest?.toLicense && latest.toLicense !== tool.license) {
    licenseHistoryFindings.push(
      `${tool.id}: latest licenseHistory event (${latest.toLicense}) does not match license label (${tool.license})`,
    );
  }
}

for (const tool of tools) {
  checkLicenseHistory(tool);
  const strengths = tool.strengths ?? [];

  if (strengths.length === 0) {
    missingStrengthFindings.push({
      id: tool.id,
      name: tool.name,
      category: tool.category,
    });
  }

  const genericStrengthHits = strengths.filter((strength) =>
    GENERIC_STRENGTH_PATTERNS.some((pattern) => pattern.test(strength)),
  );

  if (genericStrengthHits.length > 0) {
    genericStrengthFindings.push({
      id: tool.id,
      name: tool.name,
      category: tool.category,
      strengths: genericStrengthHits,
    });
  }

  if (!tool.clouds?.length && !tool.cloudBadgeReviewedAt) {
    missingCloudBadgeCandidates.push({
      id: tool.id,
      name: tool.name,
      category: tool.category,
      type: tool.type,
      vendor: tool.vendor ?? null,
    });
  }
}

if (missingStrengthFindings.length > 0) {
  console.error("Tool-card strengths missing:");

  for (const finding of missingStrengthFindings) {
    console.error(`- ${finding.category}/${finding.id} (${finding.name})`);
  }
}

if (genericStrengthFindings.length > 0) {
  console.error("Generic tool-card strengths still present:");

  for (const finding of genericStrengthFindings) {
    console.error(`- ${finding.category}/${finding.id} (${finding.name}): ${finding.strengths.join(", ")}`);
  }
}

// Advisory only for this incremental pass: missing cloud badges are reported for review, not CI-failing yet.
if (missingCloudBadgeCandidates.length > 0) {
  console.log("Cloud badge review candidates (reported, not failing):");

  for (const finding of missingCloudBadgeCandidates) {
    console.log(`- ${finding.category}/${finding.id} [${finding.type}] ${finding.name}${finding.vendor ? ` — ${finding.vendor}` : ""}`);
  }
}

if (licenseHistoryFindings.length > 0) {
  console.error("License-history schema violations:");

  for (const finding of licenseHistoryFindings) {
    console.error(`- ${finding}`);
  }
}

const hasFailingFindings =
  missingStrengthFindings.length > 0 || genericStrengthFindings.length > 0 || licenseHistoryFindings.length > 0;

if (hasFailingFindings) {
  console.error(
    `Tool-card data check FAILED: ${missingStrengthFindings.length} tools missing strengths; ${genericStrengthFindings.length} tools still using generic strength placeholders; ${licenseHistoryFindings.length} license-history violations.`,
  );
  process.exitCode = 1;
} else if (missingCloudBadgeCandidates.length > 0) {
  console.log("Tool-card data check passed: no missing/generic strengths; cloud-badge candidates still need review.");
} else {
  console.log("Tool-card data check passed: no missing/generic strengths, and the current cloud-badge review set is complete.");
}
