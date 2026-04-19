import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(new URL("..", import.meta.url).pathname);

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const files = [
  { label: "tools", items: readJson("data/tools.json").tools },
  { label: "platforms", items: readJson("data/platforms.json").platforms },
];

const errors = [];

for (const { label, items } of files) {
  for (const item of items) {
    const prefix = `${label}:${item.id}`;

    if (item.logoKind && !item.logoReviewedAt) {
      errors.push(`${prefix} has logoKind=${item.logoKind} without logoReviewedAt`);
    }

    if (item.logoReviewedAt && !isIsoDate(item.logoReviewedAt)) {
      errors.push(`${prefix} has non-ISO logoReviewedAt=${item.logoReviewedAt}`);
    }

    if (item.logoSourceUrl && typeof item.logoSourceUrl !== "string") {
      errors.push(`${prefix} has non-string logoSourceUrl`);
    }
  }
}

if (errors.length > 0) {
  console.error("Logo provenance check failed:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Logo provenance check passed.");
