// Validates every data/stacks/<vendor>.json against data/SCHEMA.md and the rest
// of the dataset. The rules live in lib/vendor-overview.ts so the unit tests,
// the page loader and this gate enforce exactly the same contract.
// Run with: node --experimental-strip-types scripts/check-stack-data.mjs
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { VENDOR_STACKS, isCurrentTool } from "../lib/stacks.ts";
import { validateVendorOverview } from "../lib/vendor-overview.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stacksDir = path.join(repoRoot, "data", "stacks");

async function readJson(relativePath) {
  const fullPath = path.join(repoRoot, relativePath);
  try {
    return JSON.parse(await fs.readFile(fullPath, "utf8"));
  } catch (err) {
    console.error(`FAIL: could not read ${relativePath}: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

const tools = (await readJson("data/tools.json")).tools;
const platforms = (await readJson("data/platforms.json")).platforms;
const updates = (await readJson("data/updates.json")).updates;
const today = new Date().toISOString().slice(0, 10);

let files;
try {
  files = (await fs.readdir(stacksDir)).filter((file) => file.endsWith(".json")).sort();
} catch {
  console.error("FAIL: data/stacks/ is missing");
  process.exit(1);
}

let failures = 0;
for (const file of files) {
  const slug = file.replace(/\.json$/, "");
  const stack = VENDOR_STACKS.find((candidate) => candidate.slug === slug);
  const raw = await readJson(path.join("data", "stacks", file));
  const errors = [];
  if (!stack) errors.push(`file name "${slug}" is not a VENDOR_STACKS slug in lib/stacks.ts`);
  if (raw?.vendor !== slug) errors.push(`root.vendor "${raw?.vendor}" must equal the file name "${slug}"`);
  const vendorToolIds = stack
    ? tools.filter((tool) => tool.vendor !== undefined && stack.vendorNames.includes(tool.vendor) && isCurrentTool(tool)).map((tool) => tool.id)
    : [];
  errors.push(
    ...validateVendorOverview(raw, {
      toolIds: new Set(tools.map((tool) => tool.id)),
      platformIds: new Set(platforms.map((platform) => platform.id)),
      updateIds: new Set(updates.map((update) => update.id)),
      vendorToolIds,
      today,
    }),
  );
  if (errors.length > 0) {
    failures += errors.length;
    console.error(`FAIL: data/stacks/${file}`);
    for (const error of errors) console.error(`  - ${error}`);
  } else {
    const counts = ["entries", "models", "timeline", "faqs"].map((key) => `${raw[key].length} ${key}`).join(", ");
    console.log(`OK: data/stacks/${file} (${counts})`);
  }
}

if (failures > 0) {
  console.error(`\ncheck-stack-data: ${failures} problem(s) found`);
  process.exit(1);
}
console.log(`check-stack-data: ${files.length} vendor overview(s) valid`);
