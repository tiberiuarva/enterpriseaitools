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
  { label: "tools", kind: "site-data", items: readJson("data/tools.json").tools },
  { label: "platforms", kind: "site-data", items: readJson("data/platforms.json").platforms },
  { label: "logo-inventory", kind: "inventory", items: readJson("data/logo-inventory.json").items },
];

const errors = [];

for (const { label, kind, items } of files) {
  for (const item of items) {
    const itemId = item.id ?? item.name;
    const prefix = `${label}:${itemId}`;
    const reviewedAt = kind === "inventory" ? item.reviewedAt : item.logoReviewedAt;
    const sourceUrl = kind === "inventory" ? item.sourceUrl : item.logoSourceUrl;

    if (item.logoKind && !reviewedAt) {
      errors.push(`${prefix} has logoKind=${item.logoKind} without reviewedAt metadata`);
    }

    if (reviewedAt && !isIsoDate(reviewedAt)) {
      errors.push(`${prefix} has non-ISO reviewedAt=${reviewedAt}`);
    }

    if (kind === "inventory" && item.status === "classified") {
      if (!item.logoKind) {
        errors.push(`${prefix} is classified without logoKind`);
      }
      if (!reviewedAt) {
        errors.push(`${prefix} is classified without reviewedAt`);
      }
    }

    if (item.logoKind === "fallback" && sourceUrl) {
      errors.push(`${prefix} is fallback but still has sourceUrl=${sourceUrl}`);
    }

    if (sourceUrl !== undefined && sourceUrl !== null && typeof sourceUrl !== "string") {
      errors.push(`${prefix} has non-string sourceUrl`);
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
