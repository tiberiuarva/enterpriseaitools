import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// Diff successive data/snapshots/<YYYY-MM-DD>.json files and emit auto-detected
// change events per tool (license, deployment, audit logging, SOC 2 / ISO 27001 /
// ISO 42001, EU AI Act role, license risk, status, version, lastRelease,
// githubStars). Writes data/snapshot-diffs.json with the union of all detected
// events across every adjacent snapshot pair. M7 deliverable.

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const snapshotsDir = path.join(repoRoot, "data", "snapshots");
const outputPath = path.join(repoRoot, "data", "snapshot-diffs.json");

const TRACKED_TOOL_FIELDS = [
  "license",
  "version",
  "lastRelease",
  "status",
  "githubStars",
];
const GOVERNANCE_FIELDS = [
  "dataResidency",
  "auditLogging",
  "soc2",
  "iso27001",
  "iso42001",
];

const HIGH_IMPACT_FIELDS = new Set([
  "license",
  "soc2",
  "iso27001",
  "iso42001",
  "licenseRisk.level",
  "status",
]);

function isSnapshotFile(name) {
  return /^\d{4}-\d{2}-\d{2}\.json$/.test(name);
}

async function readSnapshot(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (err) {
    console.error(`FAIL: could not read ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

function stableStringify(value) {
  if (value === null || value === undefined) return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value !== "object") return JSON.stringify(value);
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
}

function diffPair(prev, next) {
  const events = [];
  const prevTools = new Map((prev.tools ?? []).map((tool) => [tool.id, tool]));
  const nextTools = new Map((next.tools ?? []).map((tool) => [tool.id, tool]));

  for (const [id, nextTool] of nextTools) {
    const prevTool = prevTools.get(id);
    if (!prevTool) {
      events.push({
        toolId: id,
        toolName: nextTool.name,
        from: prev.snapshotDate,
        to: next.snapshotDate,
        field: "tracked",
        previous: null,
        current: "added",
        highImpact: false,
      });
      continue;
    }

    for (const field of TRACKED_TOOL_FIELDS) {
      if (prevTool[field] !== nextTool[field]) {
        events.push({
          toolId: id,
          toolName: nextTool.name,
          from: prev.snapshotDate,
          to: next.snapshotDate,
          field,
          previous: prevTool[field] ?? null,
          current: nextTool[field] ?? null,
          highImpact: HIGH_IMPACT_FIELDS.has(field),
        });
      }
    }

    const prevG = prevTool.governance ?? {};
    const nextG = nextTool.governance ?? {};

    for (const field of GOVERNANCE_FIELDS) {
      const prevStatus = prevG[field]?.status ?? null;
      const nextStatus = nextG[field]?.status ?? null;
      if (prevStatus !== nextStatus) {
        events.push({
          toolId: id,
          toolName: nextTool.name,
          from: prev.snapshotDate,
          to: next.snapshotDate,
          field: `governance.${field}`,
          previous: prevStatus,
          current: nextStatus,
          highImpact: HIGH_IMPACT_FIELDS.has(field),
        });
      }
    }

    if (stableStringify(prevG.deployment ?? null) !== stableStringify(nextG.deployment ?? null)) {
      events.push({
        toolId: id,
        toolName: nextTool.name,
        from: prev.snapshotDate,
        to: next.snapshotDate,
        field: "governance.deployment",
        previous: prevG.deployment ?? null,
        current: nextG.deployment ?? null,
        highImpact: false,
      });
    }

    if ((prevG.euAiAct?.role ?? null) !== (nextG.euAiAct?.role ?? null)) {
      events.push({
        toolId: id,
        toolName: nextTool.name,
        from: prev.snapshotDate,
        to: next.snapshotDate,
        field: "governance.euAiAct.role",
        previous: prevG.euAiAct?.role ?? null,
        current: nextG.euAiAct?.role ?? null,
        highImpact: false,
      });
    }

    if ((prevG.licenseRisk?.level ?? null) !== (nextG.licenseRisk?.level ?? null)) {
      events.push({
        toolId: id,
        toolName: nextTool.name,
        from: prev.snapshotDate,
        to: next.snapshotDate,
        field: "governance.licenseRisk.level",
        previous: prevG.licenseRisk?.level ?? null,
        current: nextG.licenseRisk?.level ?? null,
        highImpact: true,
      });
    }
  }

  for (const [id, prevTool] of prevTools) {
    if (!nextTools.has(id)) {
      events.push({
        toolId: id,
        toolName: prevTool.name,
        from: prev.snapshotDate,
        to: next.snapshotDate,
        field: "tracked",
        previous: "tracked",
        current: "removed",
        highImpact: true,
      });
    }
  }

  return events;
}

let entries;
try {
  entries = (await fs.readdir(snapshotsDir)).filter(isSnapshotFile).sort();
} catch (err) {
  console.error(`FAIL: could not read ${snapshotsDir}: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

const events = [];
for (let index = 1; index < entries.length; index += 1) {
  const prev = await readSnapshot(path.join(snapshotsDir, entries[index - 1]));
  const next = await readSnapshot(path.join(snapshotsDir, entries[index]));
  events.push(...diffPair(prev, next));
}

events.sort((a, b) => (b.to.localeCompare(a.to) || a.toolName.localeCompare(b.toolName) || a.field.localeCompare(b.field)));

const output = {
  generatedAt: new Date().toISOString().slice(0, 10),
  snapshotCount: entries.length,
  events,
};

await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${events.length} snapshot-diff event(s) across ${entries.length} snapshot(s).`);
