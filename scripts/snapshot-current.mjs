import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// Weekly time-series snapshot: writes data/snapshots/<YYYY-MM-DD>.json with a
// compact drift fingerprint of every tool and platform. Idempotent within a date
// (overwrites the same-day file) and additive across dates (never overwrites a
// prior date), so the snapshot directory is the persistent record of how the
// dataset moves week to week. Drives the "what changed" view in M4.

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

const toolsJson = JSON.parse(await fs.readFile(toolsPath, "utf8"));
const platformsJson = JSON.parse(await fs.readFile(platformsPath, "utf8"));

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

await fs.mkdir(snapshotsDir, { recursive: true });
const outputPath = path.join(snapshotsDir, `${snapshotDate}.json`);
await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(`Wrote snapshot ${snapshotDate}: ${snapshot.tools.length} tools, ${snapshot.platforms.length} platforms.`);
