#!/usr/bin/env node
// Mechanical gate for the weekly Radar routine's unattended merge
// (.claude/commands/radar.md §8). It never decides that a PR is good; it only
// finds the changes that must wait for a human: paths other than data JSON and
// the generated public/ artifacts, added or removed tool/platform records,
// licence edits, and any touched license-change update entry.
//
// It judges the committed HEAD against its merge-base with baseRef, so run it
// on the pushed head after `git fetch origin main`, with a clean working tree.
// The routine must run main's copy, not the head's, so a PR cannot weaken the
// gate that judges it (radar.md §8):
//   git show origin/main:scripts/check-radar-automerge.mjs > "${TMPDIR:-/tmp}/radar-gate.mjs"
//   node "${TMPDIR:-/tmp}/radar-gate.mjs" origin/main
//
// Usage: node scripts/check-radar-automerge.mjs [baseRef]   (default origin/main)
import { execFileSync } from "node:child_process";

const baseRef = process.argv[2] ?? "origin/main";

// Only files a Radar run edits. data/SCHEMA.md, data/comparison-slugs.json (it
// defines routes), any new data file and hand-maintained public/ files stay with
// a human; the public/ entries are the build-generated feeds, sitemap, llms
// files, open-data JSON and api/ tree.
const ALLOWED_PATHS = [
  /^data\/(tools|platforms|updates|eu-ai-act|eu-ai-act-obligations|snapshot-diffs|logo-inventory)\.json$/,
  /^data\/snapshots\/[^/]+\.json$/,
  /^public\/(sitemap\.xml|robots\.txt|llms\.txt|llms-full\.txt|eu-ai-act-deadlines\.ics)$/,
  /^public\/updates(-[a-z-]+)?\.xml$/,
  /^public\/data\/[^/]+\.json$/,
  /^public\/api\//,
];
const GUARDED_FIELDS = [
  "license",
  "licenseWarning",
  "licenseHistory",
  "type",
  "logoKind",
  "logoUrl",
  "logoSourceUrl",
  "logoReviewedAt",
];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function fail(problems) {
  console.error(`Radar auto-merge gate: HUMAN REVIEW REQUIRED (${problems.length})`);
  for (const problem of [...problems].sort()) console.error(`  - ${problem}`);
  process.exit(1);
}

const dirty = git(["status", "--porcelain", "--untracked-files=all"]).trim();
if (dirty) fail([`working tree is not clean; commit or discard local changes first:\n${dirty}`]);

const base = git(["merge-base", baseRef, "HEAD"]).trim();

function readJsonAt(rev, path) {
  const label = `${rev.slice(0, 12)}:${path}`;
  try {
    return JSON.parse(git(["show", `${rev}:${path}`]));
  } catch (error) {
    throw new Error(`${label} could not be read as JSON: ${error.message}`);
  }
}

function recordsById(rev, path, key) {
  const list = readJsonAt(rev, path)?.[key];
  if (!Array.isArray(list)) throw new Error(`${rev.slice(0, 12)}:${path} has no "${key}" array`);
  // A duplicate or missing id would collapse in the Map and hide a record.
  const map = new Map();
  for (const record of list) {
    if (typeof record?.id !== "string" || record.id === "") throw new Error(`${rev.slice(0, 12)}:${path} has a record without an id`);
    if (map.has(record.id)) throw new Error(`${rev.slice(0, 12)}:${path} has duplicate id: ${record.id}`);
    map.set(record.id, record);
  }
  return map;
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const problems = [];

const changedPaths = git(["diff", "--name-only", `${base}..HEAD`]).split("\n").filter(Boolean);
for (const path of changedPaths) {
  if (!ALLOWED_PATHS.some((pattern) => pattern.test(path))) problems.push(`path not allowed for auto-merge: ${path}`);
}

const NEW_FILE_ALLOWED = [/^data\/snapshots\/[^/]+\.json$/, /^public\/api\//];
const addedPaths = git(["diff", "--name-only", "--diff-filter=A", `${base}..HEAD`]).split("\n").filter(Boolean);
for (const path of addedPaths) {
  if (!NEW_FILE_ALLOWED.some((pattern) => pattern.test(path))) problems.push(`new file not allowed for auto-merge: ${path}`);
}

// A Radar run may only mirror a vendor rename into the logo inventory.
if (changedPaths.includes("data/logo-inventory.json")) {
  const byName = (rev) => {
    const items = readJsonAt(rev, "data/logo-inventory.json")?.items;
    if (!Array.isArray(items)) throw new Error(`${rev.slice(0, 12)}:data/logo-inventory.json has no "items" array`);
    return new Map(
      items.map((item) => {
        const rest = { ...item };
        delete rest.vendor;
        return [item.name, rest];
      }),
    );
  };
  const before = byName(base);
  const after = byName("HEAD");
  if (before.size !== after.size) problems.push("data/logo-inventory.json: items added or removed");
  for (const [name, item] of after) {
    if (!same(before.get(name), item)) problems.push(`data/logo-inventory.json: ${name} changed beyond vendor`);
  }
}

for (const [path, key] of [["data/tools.json", "tools"], ["data/platforms.json", "platforms"]]) {
  const before = recordsById(base, path, key);
  const after = recordsById("HEAD", path, key);
  for (const id of after.keys()) if (!before.has(id)) problems.push(`${path}: record added: ${id}`);
  for (const id of before.keys()) if (!after.has(id)) problems.push(`${path}: record removed: ${id}`);
  for (const [id, record] of after) {
    const previous = before.get(id);
    if (!previous) continue;
    for (const field of GUARDED_FIELDS) {
      if (!same(previous[field], record[field])) problems.push(`${path}: ${id}.${field} changed`);
    }
    if (!same(previous.governance?.licenseRisk, record.governance?.licenseRisk)) {
      problems.push(`${path}: ${id}.governance.licenseRisk changed`);
    }
  }
}

const oldUpdates = recordsById(base, "data/updates.json", "updates");
const newUpdates = recordsById("HEAD", "data/updates.json", "updates");
for (const id of new Set([...oldUpdates.keys(), ...newUpdates.keys()])) {
  const previous = oldUpdates.get(id);
  const current = newUpdates.get(id);
  const touchesLicence = previous?.type === "license-change" || current?.type === "license-change";
  if (touchesLicence && !same(previous, current)) problems.push(`data/updates.json: license-change entry added, edited or removed: ${id}`);
}

if (problems.length > 0) fail(problems);
console.log(`Radar auto-merge gate: PASS (HEAD vs merge-base ${base.slice(0, 12)} of ${baseRef}; ${changedPaths.length} changed paths, all allowed).`);
