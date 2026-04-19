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
const imageLogoKinds = new Set(["official-product", "official-vendor", "service-icon", "project-logo"]);
const todayIso = new Date().toISOString().slice(0, 10);
const notesMaxLength = 280;

function isSafeHttpUrl(value) {
  if (typeof value !== "string") return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function hasControlCharacters(value) {
  return /[\u0000-\u001F\u007F]/.test(value);
}

function buildMonogramSignal(name) {
  const tokens = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  if (tokens.length > 0) {
    return tokens.slice(0, 2).map((token) => Array.from(token)[0] ?? "").join("") || "?";
  }

  const firstCharacter = name.trim().match(/[\p{L}\p{N}]/u)?.[0];
  return firstCharacter ?? "?";
}

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
    const notes = kind === "inventory" ? item.notes : item.logoNotes;

    if (!item.logoKind) {
      errors.push(`${prefix} is missing logoKind`);
    }

    if (item.logoKind && !allowedLogoKinds.has(item.logoKind)) {
      errors.push(`${prefix} has invalid logoKind=${item.logoKind}`);
    }

    if (!reviewedAt) {
      errors.push(`${prefix} is missing reviewedAt metadata`);
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

    if (item.logoKind === "fallback" && item.logoUrl) {
      errors.push(`${prefix} is fallback but still has logoUrl=${item.logoUrl}`);
    }

    if (item.logoKind && imageLogoKinds.has(item.logoKind) && !item.logoUrl && kind === "site-data") {
      errors.push(`${prefix} has logoKind=${item.logoKind} without logoUrl`);
    }

    if (kind === "site-data" && item.logoKind && item.logoKind !== "fallback" && !sourceUrl) {
      errors.push(`${prefix} has logoKind=${item.logoKind} without sourceUrl metadata`);
    }

    if (sourceUrl !== undefined && sourceUrl !== null && typeof sourceUrl !== "string") {
      errors.push(`${prefix} has non-string sourceUrl`);
    }

    if (typeof sourceUrl === "string" && !isSafeHttpUrl(sourceUrl)) {
      errors.push(`${prefix} has non-http(s) sourceUrl=${sourceUrl}`);
    }

    if (notes !== undefined && typeof notes !== "string") {
      errors.push(`${prefix} has non-string notes metadata`);
    }

    if (typeof notes === "string") {
      if (notes.length > notesMaxLength) {
        errors.push(`${prefix} has notes longer than ${notesMaxLength} chars`);
      }
      if (hasControlCharacters(notes)) {
        errors.push(`${prefix} has control characters in notes metadata`);
      }
    }

    if (buildMonogramSignal(item.name) === "?") {
      errors.push(`${prefix} would render as an ambiguous '?' monogram; rename or classify with a real image asset`);
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
