#!/usr/bin/env node
// Mechanical gate for the weekly Radar routine's unattended merge
// (.claude/commands/radar.md §8). It never decides that a PR is good; it only
// finds the changes that must wait for a human: paths outside data/ and the
// generated public/ artifacts, added or removed tool/platform records, licence
// edits, and license-change update entries.
//
// Usage: node scripts/check-radar-automerge.mjs [baseRef]   (default origin/main)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const baseRef = process.argv[2] ?? "origin/main";
const ALLOWED_PATH = /^(data|public)\//;
const GUARDED_FIELDS = ["license", "licenseWarning", "licenseHistory", "type"];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" });
}

function readJson(text, label) {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function recordsById(doc, key, label) {
  const list = doc?.[key];
  if (!Array.isArray(list)) throw new Error(`${label} has no "${key}" array`);
  return new Map(list.map((record) => [record.id, record]));
}

function loadBoth(path, key) {
  const before = recordsById(readJson(git(["show", `${baseRef}:${path}`]), `${baseRef}:${path}`), key, `${baseRef}:${path}`);
  const after = recordsById(readJson(readFileSync(path, "utf8"), path), key, path);
  return { before, after };
}

const problems = [];

const changedPaths = git(["diff", "--name-only", `${baseRef}...HEAD`]).split("\n").filter(Boolean);
for (const path of changedPaths) {
  if (!ALLOWED_PATH.test(path)) problems.push(`path outside data/ and public/: ${path}`);
}

for (const [path, key] of [["data/tools.json", "tools"], ["data/platforms.json", "platforms"]]) {
  const { before, after } = loadBoth(path, key);
  for (const id of after.keys()) if (!before.has(id)) problems.push(`${path}: record added: ${id}`);
  for (const id of before.keys()) if (!after.has(id)) problems.push(`${path}: record removed: ${id}`);
  for (const [id, record] of after) {
    const previous = before.get(id);
    if (!previous) continue;
    for (const field of GUARDED_FIELDS) {
      if (JSON.stringify(previous[field]) !== JSON.stringify(record[field])) problems.push(`${path}: ${id}.${field} changed`);
    }
    if (JSON.stringify(previous.governance?.licenseRisk) !== JSON.stringify(record.governance?.licenseRisk)) {
      problems.push(`${path}: ${id}.governance.licenseRisk changed`);
    }
  }
}

const { before: oldUpdates, after: newUpdates } = loadBoth("data/updates.json", "updates");
for (const [id, update] of newUpdates) {
  if (!oldUpdates.has(id) && update.type === "license-change") problems.push(`data/updates.json: license-change entry added: ${id}`);
}

if (problems.length > 0) {
  console.error(`Radar auto-merge gate: HUMAN REVIEW REQUIRED (${problems.length})`);
  for (const problem of problems.sort()) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`Radar auto-merge gate: PASS against ${baseRef} (${changedPaths.length} changed paths, all under data/ or public/).`);
