import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(process.cwd());
const toolsPath = path.join(repoRoot, "data", "tools.json");

const GENERIC_STRENGTHS = new Set([
  "MIT licensed",
  "Apache 2.0 licensed",
  "Large adoption",
  "Active ecosystem",
  "Commercial support",
  "Free OSS availability",
  "Self-hostable",
  "Visual workflow builder",
  "Known coding assistant brand",
  "Simple OSS availability",
]);

const REVIEWED_NO_CLOUD_BADGE = new Set([
  "lakera-guard",
  "arthur-genai-engine",
  "cursor",
  "windsurf",
]);

const toolsJson = JSON.parse(await fs.readFile(toolsPath, "utf8"));
const tools = toolsJson.tools ?? [];

const genericStrengthFindings = [];
const missingCloudBadgeCandidates = [];

for (const tool of tools) {
  const genericStrengthHits = (tool.strengths ?? []).filter((strength) => GENERIC_STRENGTHS.has(strength));

  if (genericStrengthHits.length > 0) {
    genericStrengthFindings.push({
      id: tool.id,
      name: tool.name,
      category: tool.category,
      strengths: genericStrengthHits,
    });
  }

  if (!tool.clouds?.length && !REVIEWED_NO_CLOUD_BADGE.has(tool.id)) {
    missingCloudBadgeCandidates.push({
      id: tool.id,
      name: tool.name,
      category: tool.category,
      type: tool.type,
      vendor: tool.vendor ?? null,
    });
  }
}

if (genericStrengthFindings.length > 0) {
  console.error("Generic tool-card strengths still present:");

  for (const finding of genericStrengthFindings) {
    console.error(`- ${finding.category}/${finding.id} (${finding.name}): ${finding.strengths.join(", ")}`);
  }
}

if (missingCloudBadgeCandidates.length > 0) {
  console.log("Cloud badge review candidates (reported, not failing):");

  for (const finding of missingCloudBadgeCandidates) {
    console.log(`- ${finding.category}/${finding.id} [${finding.type}] ${finding.name}${finding.vendor ? ` — ${finding.vendor}` : ""}`);
  }
} else {
  console.log("Cloud badge review complete for the current tool-card pass.");
}

if (genericStrengthFindings.length > 0) {
  process.exitCode = 1;
} else {
  console.log("Tool-card data check passed: no generic strength placeholders found.");
}
