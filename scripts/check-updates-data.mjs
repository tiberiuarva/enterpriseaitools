import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const updatesPath = path.join(repoRoot, "data", "updates.json");
const toolsPath = path.join(repoRoot, "data", "tools.json");
const isoCalendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;

let updatesData;
try {
  updatesData = JSON.parse(await fs.readFile(updatesPath, "utf8"));
} catch (err) {
  console.error(`FAIL: could not read ${updatesPath}: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

let toolsData;
try {
  toolsData = JSON.parse(await fs.readFile(toolsPath, "utf8"));
} catch (err) {
  console.error(`FAIL: could not read ${toolsPath}: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

const findings = [];
const lastUpdated = updatesData.lastUpdated ?? "";
const parsedLastUpdated = new Date(`${lastUpdated}T00:00:00Z`);
const validLastUpdated =
  isoCalendarDatePattern.test(lastUpdated) &&
  !Number.isNaN(parsedLastUpdated.getTime()) &&
  parsedLastUpdated.toISOString().slice(0, 10) === lastUpdated;

if (!validLastUpdated) {
  findings.push("data/updates.json lastUpdated must be a valid ISO calendar date (YYYY-MM-DD).");
}

if (!Array.isArray(updatesData.updates)) {
  findings.push("data/updates.json updates must be an array.");
} else if (updatesData.updates.length === 0) {
  findings.push("data/updates.json updates must not be empty.");
} else if (validLastUpdated) {
  const newestUpdateDate = updatesData.updates.reduce((latest, update) => {
    const updateDate = update?.date;
    return typeof updateDate === "string" && updateDate > latest ? updateDate : latest;
  }, "");

  if (newestUpdateDate && lastUpdated < newestUpdateDate) {
    findings.push(`data/updates.json lastUpdated (${lastUpdated}) must be on or after newest update date (${newestUpdateDate}).`);
  }
}

if (Array.isArray(updatesData.updates) && Array.isArray(toolsData.tools)) {
  const newestReleaseUpdateByToolId = new Map();

  for (const update of updatesData.updates) {
    if (update?.type !== "release" || typeof update?.toolId !== "string" || typeof update?.date !== "string") {
      continue;
    }

    const previous = newestReleaseUpdateByToolId.get(update.toolId);
    if (!previous || update.date > previous.date) {
      newestReleaseUpdateByToolId.set(update.toolId, update);
    }
  }

  for (const tool of toolsData.tools) {
    if (!tool?.id || !tool?.version || !tool?.lastRelease) {
      continue;
    }

    const newestReleaseUpdate = newestReleaseUpdateByToolId.get(tool.id);
    if (newestReleaseUpdate && tool.lastRelease < newestReleaseUpdate.date) {
      findings.push(
        `Tool ${tool.id} lastRelease (${tool.lastRelease}) is older than its newest release update (${newestReleaseUpdate.date}; ${newestReleaseUpdate.id}).`,
      );
    }
  }
}

// License-change pairing (M5): every `license-change` update must correspond
// to a licenseHistory event on that tool (same date + sourceUrl), and every
// licenseHistory event inside the feed's operational window (>= the oldest
// update entry) must have a matching `license-change` update. Pre-window
// backfill events are licenseHistory-only by policy (see
// docs/research/license-history-backfill-2026-07-17.md).
if (Array.isArray(updatesData.updates) && Array.isArray(toolsData.tools)) {
  const oldestUpdateDate = updatesData.updates.reduce((oldest, update) => {
    const updateDate = update?.date;
    return typeof updateDate === "string" && (oldest === "" || updateDate < oldest) ? updateDate : oldest;
  }, "");
  const toolsById = new Map(toolsData.tools.map((tool) => [tool.id, tool]));

  for (const update of updatesData.updates) {
    if (update?.type !== "license-change") continue;
    const tool = toolsById.get(update.toolId);
    const match = tool?.licenseHistory?.find(
      (event) => event.date === update.date && event.sourceUrl === update.sourceUrl,
    );
    if (!match) {
      findings.push(
        `license-change update ${update.id} has no matching licenseHistory event on tool ${update.toolId} (same date + sourceUrl required).`,
      );
    }
  }

  for (const tool of toolsData.tools) {
    for (const event of tool.licenseHistory ?? []) {
      if (oldestUpdateDate && event.date < oldestUpdateDate) continue;
      const match = updatesData.updates.find(
        (update) =>
          update?.type === "license-change" &&
          update.toolId === tool.id &&
          update.date === event.date &&
          update.sourceUrl === event.sourceUrl,
      );
      if (!match) {
        findings.push(
          `licenseHistory event ${tool.id}@${event.date} is inside the feed window (>= ${oldestUpdateDate}) but has no license-change update entry.`,
        );
      }
    }
  }
}

if (findings.length > 0) {
  console.error("Updates data check FAILED:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log(`Updates data check passed: lastUpdated=${updatesData.lastUpdated}, updates=${updatesData.updates.length}.`);
