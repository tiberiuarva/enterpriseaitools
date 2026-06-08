import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

// Reports tools whose governance.reviewedAt is older than the freshness
// threshold documented in data/SCHEMA.md (default 60 days). Wired into the
// /radar prep step so the weekly scan re-verifies stale records first.
// Exits 0 with a printed report. Exits 1 only on read/parse errors so it can
// run as informational gating during /radar without blocking the build.

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const toolsPath = path.join(repoRoot, "data", "tools.json");

const FRESHNESS_THRESHOLD_DAYS = 60;
const isoCalendarDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const explicitToday = process.argv.find((arg) => /^--today=\d{4}-\d{2}-\d{2}$/.test(arg));
const today = explicitToday ? explicitToday.slice("--today=".length) : new Date().toISOString().slice(0, 10);

function parseDate(value, label) {
  if (!isoCalendarDatePattern.test(value)) {
    console.error(`FAIL: invalid ISO calendar date for ${label}: ${value}`);
    process.exit(1);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    console.error(`FAIL: unparseable ISO calendar date for ${label}: ${value}`);
    process.exit(1);
  }
  return parsed;
}

function daysBetween(fromIso, toIso) {
  const from = parseDate(fromIso, "reviewedAt").getTime();
  const to = parseDate(toIso, "today").getTime();
  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

let toolsData;
try {
  toolsData = JSON.parse(await fs.readFile(toolsPath, "utf8"));
} catch (err) {
  console.error(`FAIL: could not read ${toolsPath}: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
}

const tools = Array.isArray(toolsData.tools) ? toolsData.tools : [];
const stale = [];
const missing = [];

for (const tool of tools) {
  const reviewedAt = tool?.governance?.reviewedAt;
  if (!reviewedAt) {
    missing.push(tool?.id ?? "<unknown>");
    continue;
  }
  const age = daysBetween(reviewedAt, today);
  if (age > FRESHNESS_THRESHOLD_DAYS) {
    stale.push({ id: tool.id, name: tool.name, reviewedAt, age });
  }
}

stale.sort((a, b) => b.age - a.age || a.name.localeCompare(b.name));

console.log(`Data freshness report — today=${today}, threshold=${FRESHNESS_THRESHOLD_DAYS}d, tools=${tools.length}.`);
if (missing.length > 0) {
  console.log(`Missing governance.reviewedAt on ${missing.length} tool(s): ${missing.join(", ")}`);
}
if (stale.length === 0) {
  console.log("All tracked tools were verified within the freshness threshold.");
} else {
  console.log(`${stale.length} tool(s) past the freshness threshold:`);
  for (const entry of stale) {
    console.log(`  - ${entry.name} (${entry.id}): reviewed ${entry.reviewedAt} · ${entry.age} days old`);
  }
}
