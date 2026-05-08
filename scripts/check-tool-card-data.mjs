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

for (const tool of tools) {
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

const hasFailingFindings = missingStrengthFindings.length > 0 || genericStrengthFindings.length > 0;

if (hasFailingFindings) {
  console.error(
    `Tool-card data check FAILED: ${missingStrengthFindings.length} tools missing strengths; ${genericStrengthFindings.length} tools still using generic strength placeholders.`,
  );
  process.exitCode = 1;
} else if (missingCloudBadgeCandidates.length > 0) {
  console.log("Tool-card data check passed: no missing/generic strengths; cloud-badge candidates still need review.");
} else {
  console.log("Tool-card data check passed: no missing/generic strengths, and the current cloud-badge review set is complete.");
}
