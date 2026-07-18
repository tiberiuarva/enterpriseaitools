// Validates the milestone-2 open-data surface: the versioned static JSON API
// under public/api/v1/, the per-category Atom feeds, and the EU AI Act ICS
// calendar. Fails loud (exit 1) so CI and /ship-check stop on drift.
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import toolsData from "../data/tools.json" with { type: "json" };
import platformsData from "../data/platforms.json" with { type: "json" };
import updatesData from "../data/updates.json" with { type: "json" };
import euAiActTimeline from "../data/eu-ai-act.json" with { type: "json" };

const publicDir = path.resolve("public");
const apiDir = path.join(publicDir, "api", "v1");
const failures = [];

function fail(message) {
  failures.push(message);
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    fail(`${path.relative(publicDir, filePath)}: unreadable or invalid JSON (${error.message})`);
    return null;
  }
}

// ── Manifest ──────────────────────────────────────────────────────────────────
const manifest = await readJson(path.join(apiDir, "index.json"));
if (manifest) {
  if (manifest.schemaVersion !== "1.0.0") fail("index.json: unexpected schemaVersion");
  if (manifest.counts?.tools !== toolsData.tools.length) fail("index.json: tools count does not match dataset");
  if (manifest.counts?.platforms !== platformsData.platforms.length) fail("index.json: platforms count does not match dataset");
  if (manifest.counts?.updates !== updatesData.updates.length) fail("index.json: updates count does not match dataset");
  const expectedIds = [...toolsData.tools.map((tool) => tool.id)].sort((a, b) => a.localeCompare(b));
  if (JSON.stringify(manifest.toolIds) !== JSON.stringify(expectedIds)) fail("index.json: toolIds out of sync with dataset");
}

// ── Collections ───────────────────────────────────────────────────────────────
for (const [file, key, expected] of [
  ["tools.json", "tools", toolsData.tools.length],
  ["platforms.json", "platforms", platformsData.platforms.length],
  ["updates.json", "updates", updatesData.updates.length],
]) {
  const collection = await readJson(path.join(apiDir, file));
  if (collection && (collection.count !== expected || collection[key]?.length !== expected)) {
    fail(`${file}: record count does not match dataset (${collection?.count} vs ${expected})`);
  }
}

// ── Per-record endpoints and badges ───────────────────────────────────────────
const BADGE_KINDS = ["license", "status", "verified"];
for (const tool of toolsData.tools) {
  const recordPath = path.join(apiDir, "tools", `${tool.id}.json`);
  if (!existsSync(recordPath)) {
    fail(`missing per-record endpoint: api/v1/tools/${tool.id}.json`);
  } else {
    const record = await readJson(recordPath);
    if (record && record.tool?.id !== tool.id) fail(`api/v1/tools/${tool.id}.json: wrong record inside`);
  }
  for (const kind of BADGE_KINDS) {
    const badgePath = path.join(apiDir, "badge", tool.id, `${kind}.json`);
    if (!existsSync(badgePath)) {
      fail(`missing badge endpoint: api/v1/badge/${tool.id}/${kind}.json`);
      continue;
    }
    const badge = await readJson(badgePath);
    if (!badge) continue;
    if (badge.schemaVersion !== 1 || !badge.label || typeof badge.message !== "string" || badge.message.length === 0 || !badge.color) {
      fail(`api/v1/badge/${tool.id}/${kind}.json: does not satisfy the shields endpoint schema`);
    }
  }
}

// ── Feeds ─────────────────────────────────────────────────────────────────────
function countOccurrences(haystack, needle) {
  return haystack.split(needle).length - 1;
}

const FEED_CATEGORIES = ["agents", "orchestration", "governance", "assistants", "platforms"];
for (const category of FEED_CATEGORIES) {
  const feedPath = path.join(publicDir, `updates-${category}.xml`);
  if (!existsSync(feedPath)) {
    fail(`missing category feed: updates-${category}.xml`);
    continue;
  }
  const xml = await readFile(feedPath, "utf8");
  if (!xml.startsWith("<?xml") || !xml.includes("<feed")) fail(`updates-${category}.xml: not a well-formed Atom feed`);
  const expected = updatesData.updates.filter((update) => update.category === category).length;
  const actual = countOccurrences(xml, "<entry>");
  if (actual !== expected) fail(`updates-${category}.xml: ${actual} entries, dataset has ${expected}`);
}

const siteFeed = await readFile(path.join(publicDir, "updates.xml"), "utf8");
if (countOccurrences(siteFeed, "<entry>") !== updatesData.updates.length) {
  fail(`updates.xml: entry count does not match dataset (${updatesData.updates.length})`);
}

const licenseFeedPath = path.join(publicDir, "updates-licenses.xml");
if (!existsSync(licenseFeedPath)) {
  fail("missing license-change feed: updates-licenses.xml");
} else {
  const xml = await readFile(licenseFeedPath, "utf8");
  const expected = updatesData.updates.filter((update) => update.type === "license-change").length;
  const actual = countOccurrences(xml, "<entry>");
  if (actual !== expected) fail(`updates-licenses.xml: ${actual} entries, dataset has ${expected} license-change updates`);
}

// ── ICS calendar ──────────────────────────────────────────────────────────────
const icsPath = path.join(publicDir, "eu-ai-act-deadlines.ics");
if (!existsSync(icsPath)) {
  fail("missing eu-ai-act-deadlines.ics");
} else {
  const ics = await readFile(icsPath, "utf8");
  if (!ics.startsWith("BEGIN:VCALENDAR")) fail("eu-ai-act-deadlines.ics: missing VCALENDAR envelope");
  const events = countOccurrences(ics, "BEGIN:VEVENT");
  if (events !== euAiActTimeline.length) {
    fail(`eu-ai-act-deadlines.ics: ${events} events, timeline has ${euAiActTimeline.length}`);
  }
  if (ics.includes("\n") && !ics.includes("\r\n")) fail("eu-ai-act-deadlines.ics: lines must be CRLF-terminated (RFC 5545)");
}

if (failures.length > 0) {
  console.error("FAIL open-data artifacts:");
  for (const failure of failures) console.error(`  - ${failure}`);
  console.error("Run: node scripts/generate-seo-artifacts.mjs (or npm run build) and commit the result.");
  process.exit(1);
}

console.log(
  `PASS open-data artifacts: api/v1 (${toolsData.tools.length} records, ${toolsData.tools.length * BADGE_KINDS.length} badges), ${FEED_CATEGORIES.length} category feeds, ICS calendar`,
);
