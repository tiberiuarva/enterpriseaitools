import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// Weekly time-series snapshot: writes data/snapshots/<YYYY-MM-DD>.json with a
// compact drift fingerprint of every tool and platform. Idempotent within a date
// (overwrites the same-day file). Additive across dates in normal operation —
// no date argument means today's date and one file per date; passing an
// explicit date argument overwrites that date's file. The snapshot directory is
// the persistent record of how the dataset moves week to week and drives the
// M4 "what changed" view.

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const toolsPath = path.join(repoRoot, "data", "tools.json");
const platformsPath = path.join(repoRoot, "data", "platforms.json");
const snapshotsDir = path.join(repoRoot, "data", "snapshots");

const explicitDate = process.argv.find((arg) => /^\d{4}-\d{2}-\d{2}$/.test(arg));
const snapshotDate = explicitDate ?? new Date().toISOString().slice(0, 10);

function digestClaim(claim) {
  if (!claim || typeof claim !== "object") return null;
  return { status: claim.status ?? null };
}

function digestTool(tool) {
  const g = tool.governance ?? {};
  return {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    license: tool.license ?? null,
    version: tool.version ?? null,
    lastRelease: tool.lastRelease ?? null,
    status: tool.status ?? null,
    githubStars: typeof tool.githubStars === "number" ? tool.githubStars : null,
    governance: {
      dataResidency: digestClaim(g.dataResidency),
      deployment: g.deployment
        ? { status: g.deployment.status ?? null, models: Array.isArray(g.deployment.models) ? [...g.deployment.models].sort() : [] }
        : null,
      auditLogging: digestClaim(g.auditLogging),
      soc2: digestClaim(g.soc2),
      iso27001: digestClaim(g.iso27001),
      iso42001: digestClaim(g.iso42001),
      euAiAct: g.euAiAct
        ? { status: g.euAiAct.status ?? null, role: g.euAiAct.role ?? null }
        : null,
      licenseRisk: g.licenseRisk
        ? { status: g.licenseRisk.status ?? null, level: g.licenseRisk.level ?? null }
        : null,
      reviewedAt: g.reviewedAt ?? null,
    },
  };
}

function digestPlatform(platform) {
  return {
    id: platform.id,
    name: platform.name,
    formerNames: Array.isArray(platform.formerNames) ? [...platform.formerNames] : [],
    modelCount: platform.modelCount ?? null,
    onPremises: platform.onPremises ?? null,
    regions: platform.regions ?? null,
    compliance: Array.isArray(platform.compliance) ? [...platform.compliance].sort() : [],
    lastUpdated: platform.lastUpdated ?? null,
  };
}

let toolsJson;
let platformsJson;
try {
  toolsJson = JSON.parse(await fs.readFile(toolsPath, "utf8"));
} catch (err) {
  console.error(`FAIL: could not read data/tools.json: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
try {
  platformsJson = JSON.parse(await fs.readFile(platformsPath, "utf8"));
} catch (err) {
  console.error(`FAIL: could not read data/platforms.json: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

if (!Array.isArray(toolsJson.tools)) {
  console.error("FAIL: data/tools.json does not contain a tools array.");
  process.exit(1);
}
if (!Array.isArray(platformsJson.platforms)) {
  console.error("FAIL: data/platforms.json does not contain a platforms array.");
  process.exit(1);
}

const snapshot = {
  snapshotDate,
  toolsLastUpdated: toolsJson.lastUpdated ?? null,
  tools: (toolsJson.tools ?? [])
    .map(digestTool)
    .sort((a, b) => a.id.localeCompare(b.id)),
  platforms: (platformsJson.platforms ?? [])
    .map(digestPlatform)
    .sort((a, b) => a.id.localeCompare(b.id)),
};

try {
  await fs.mkdir(snapshotsDir, { recursive: true });
} catch (err) {
  console.error(`FAIL: could not create snapshots directory: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}
const outputPath = path.join(snapshotsDir, `${snapshotDate}.json`);
try {
  await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
} catch (err) {
  console.error(`FAIL: could not write ${outputPath}: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

console.log(`Wrote snapshot ${snapshotDate}: ${snapshot.tools.length} tools, ${snapshot.platforms.length} platforms.`);
