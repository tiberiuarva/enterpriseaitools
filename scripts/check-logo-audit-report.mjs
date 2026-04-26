import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.join(repoRoot, "docs/logo-audit-report.md");
const generatorPath = path.join(repoRoot, "scripts/logo-audit-report.mjs");
const original = fs.readFileSync(reportPath, "utf8");
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "logo-audit-report-"));
const backupPath = path.join(tempDir, "logo-audit-report.backup.md");

fs.writeFileSync(backupPath, original);

try {
  execFileSync(process.execPath, [generatorPath], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  const regenerated = fs.readFileSync(reportPath, "utf8");

  if (regenerated !== original) {
    fs.writeFileSync(reportPath, original);
    console.error("Logo audit report is out of date. Run `npm run report-logo-audit` and commit the updated docs/logo-audit-report.md.");
    process.exit(1);
  }

  console.log("Logo audit report is in sync with repo data.");
} finally {
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, reportPath);
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
}
