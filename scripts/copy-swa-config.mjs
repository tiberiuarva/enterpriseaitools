import { copyFile, readFile, access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/*
 * Copies `staticwebapp.config.json` into the export output.
 *
 * Azure Static Web Apps reads this file from the ROOT OF THE UPLOADED ARTIFACT.
 * The deploy workflow sets `app_location: "out"` with `skip_app_build: true`,
 * so only `out/` is uploaded — a config sitting at the repo root is never seen
 * by the platform, and every rule in it is silently ignored.
 *
 * That is not hypothetical: it is exactly what happened. Trailing-slash
 * normalisation, the custom 404 rewrite and the cache headers were all inert in
 * production while the file looked correct in the repo, because nothing ever
 * carried it into `out/`. The failure is silent by nature — the deploy
 * succeeds, the site works, and only the rules quietly do nothing — so the
 * build now performs the copy and `check-deploy-readiness` asserts the result.
 *
 * Must run AFTER `next build`, which regenerates `out/` from scratch.
 */

const repoRoot = path.resolve(import.meta.dirname, "..");
// Keep this repo-root source path aligned with scripts/check-deploy-readiness.sh.
const source = path.join(repoRoot, "staticwebapp.config.json");
const outDir = path.join(repoRoot, "out");
const destination = path.join(outDir, "staticwebapp.config.json");

function fail(message) {
  console.error(`Azure config copy failed: ${message}`);
  process.exit(1);
}

try {
  await access(outDir);
} catch {
  fail("out/ is missing. Run the export build first.");
}

let raw;

try {
  raw = await readFile(source, "utf8");
} catch {
  fail(`${path.relative(repoRoot, source)} is missing.`);
}

try {
  JSON.parse(raw);
} catch (error) {
  // A malformed config is worse than none: Azure would reject or ignore it and
  // the routing rules would vanish without the deploy failing.
  fail(`${path.relative(repoRoot, source)} is not valid JSON — ${error.message}`);
}

await copyFile(source, destination);

console.log("Copied staticwebapp.config.json into out/ (Azure reads it from the artifact root).");
