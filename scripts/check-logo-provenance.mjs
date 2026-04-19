import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const allowedLogoKinds = new Set([
  "official-product",
  "official-vendor",
  "service-icon",
  "project-logo",
  "fallback",
]);
const todayIso = new Date().toISOString().slice(0, 10);

const tools = readJson("data/tools.json").tools;
const platforms = readJson("data/platforms.json").platforms;
const inventory = readJson("data/logo-inventory.json").items;

const files = [
  { label: "tools", kind: "site-data", items: tools },
  { label: "platforms", kind: "site-data", items: platforms },
  { label: "logo-inventory", kind: "inventory", items: inventory },
];

const errors = [];

for (const { label, kind, items } of files) {
  for (const item of items) {
    const itemId = item.id ?? item.name;
    const prefix = `${label}:${itemId}`;
    const reviewedAt = kind === "inventory" ? item.reviewedAt : item.logoReviewedAt;
    const sourceUrl = kind === "inventory" ? item.sourceUrl : item.logoSourceUrl;

    if (item.logoKind && !allowedLogoKinds.has(item.logoKind)) {
      errors.push(`${prefix} has invalid logoKind=${item.logoKind}`);
    }

    if (item.logoKind && !reviewedAt) {
      errors.push(`${prefix} has logoKind=${item.logoKind} without reviewedAt metadata`);
    }

    if (reviewedAt && !isIsoDate(reviewedAt)) {
      errors.push(`${prefix} has non-ISO reviewedAt=${reviewedAt}`);
    }

    if (reviewedAt && reviewedAt > todayIso) {
      errors.push(`${prefix} has future reviewedAt=${reviewedAt}`);
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

    if (kind === "site-data" && item.logoKind && item.logoKind !== "fallback" && !sourceUrl) {
      errors.push(`${prefix} has logoKind=${item.logoKind} without sourceUrl metadata`);
    }

    if (sourceUrl !== undefined && sourceUrl !== null && typeof sourceUrl !== "string") {
      errors.push(`${prefix} has non-string sourceUrl`);
    }
  }
}

const inventoryKeys = new Set(inventory.map((item) => `${item.category}:${item.name}`));
const siteKeys = new Set([
  ...tools.map((item) => `${item.category}:${item.name}`),
  ...platforms.map((item) => `platforms:${item.name}`),
]);

for (const item of tools) {
  const key = `${item.category}:${item.name}`;

  if (!inventoryKeys.has(key)) {
    errors.push(`tools:${item.id} is missing inventory row ${key}`);
  }
}

for (const item of platforms) {
  const key = `platforms:${item.name}`;

  if (!inventoryKeys.has(key)) {
    errors.push(`platforms:${item.id} is missing inventory row ${key}`);
  }
}

for (const item of inventory) {
  const key = `${item.category}:${item.name}`;

  if (!siteKeys.has(key)) {
    errors.push(`logo-inventory:${key} has no matching tools/platforms entry`);
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
