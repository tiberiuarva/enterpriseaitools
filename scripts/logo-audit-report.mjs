import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REVIEW_FRESHNESS_DAYS = {
  recent: 14,
  stale: 30,
};
const ICON_PACK_RULES = [
  { host: "aws.amazon.com", pathPrefix: "/architecture/icons" },
  { host: "learn.microsoft.com", pathPrefix: "/en-us/azure/architecture/icons" },
  { host: "learn.microsoft.com", pathPrefix: "/en-us/power-platform/guidance/icons" },
  { host: "cloud.google.com", pathPrefix: "/icons" },
];
const DOCS_HOST_PREFIXES = ["docs.", "developer.", "developers."];
const DOCS_HOSTS = new Set(["learn.microsoft.com"]);
const DOCS_PATH_SEGMENTS = ["docs", "guides"];

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

const tools = readJson("data/tools.json").tools;
const platforms = readJson("data/platforms.json").platforms;
const inventoryData = readJson("data/logo-inventory.json");
const inventory = inventoryData.items;
const generatedAt = inventoryData.generatedAt;

if (!generatedAt) {
  throw new Error("Missing generatedAt in data/logo-inventory.json");
}

const categoryOrder = ["agents", "orchestration", "governance", "assistants", "platforms"];
const logoKindOrder = ["fallback", "service-icon", "project-logo", "official-product", "official-vendor"];
const sourceSurfaceOrder = ["icon-pack", "repo", "github-hosted", "docs-site", "vendor-site", "other"];
const allowedStatuses = new Set(["classified", "unclassified"]);
const allowedCategories = new Set(categoryOrder);
const allowedLogoKinds = new Set(logoKindOrder);

const siteRows = [
  ...tools.map((item) => ({
    name: item.name,
    category: item.category,
    logoKind: item.logoKind,
    logoUrl: item.logoUrl,
    logoSourceUrl: item.logoSourceUrl,
  })),
  ...platforms.map((item) => ({
    name: item.name,
    category: "platforms",
    logoKind: item.logoKind,
    logoUrl: item.logoUrl,
    logoSourceUrl: item.logoSourceUrl,
  })),
];

function initRow() {
  return {
    total: 0,
    fallback: 0,
    "service-icon": 0,
    "project-logo": 0,
    "official-product": 0,
    "official-vendor": 0,
  };
}

const counts = new Map(categoryOrder.map((category) => [category, initRow()]));

for (const row of siteRows) {
  if (!allowedCategories.has(row.category)) {
    throw new Error(`Unknown category in site data: ${row.category}`);
  }

  if (!allowedLogoKinds.has(row.logoKind)) {
    throw new Error(`Unknown logoKind in site data for ${row.category}: ${row.logoKind}`);
  }

  if (!row.logoUrl) {
    throw new Error(`Missing logoUrl in site data for ${row.category}:${row.name}`);
  }

  const bucket = counts.get(row.category);
  bucket.total += 1;
  bucket[row.logoKind] += 1;
}

const totals = initRow();
for (const category of categoryOrder) {
  const bucket = counts.get(category);
  totals.total += bucket.total;
  for (const kind of logoKindOrder) {
    totals[kind] += bucket[kind];
  }
}

for (const item of inventory) {
  if (!allowedCategories.has(item.category)) {
    throw new Error(`Unknown category in logo inventory: ${item.category}`);
  }

  if (!allowedLogoKinds.has(item.logoKind)) {
    throw new Error(`Unknown logoKind in logo inventory for ${item.category}:${item.name}: ${item.logoKind}`);
  }

  if (!allowedStatuses.has(item.status)) {
    throw new Error(`Unknown status in logo inventory for ${item.category}:${item.name}: ${item.status}`);
  }

  if (!item.reviewedAt) {
    throw new Error(`Missing reviewedAt in logo inventory for ${item.category}:${item.name}`);
  }
}

const inventorySummary = {
  total: inventory.length,
  classified: inventory.filter((item) => item.status === "classified").length,
  unclassified: inventory.filter((item) => item.status === "unclassified").length,
};

function formatPercent(numerator, denominator) {
  if (!denominator) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function trimTrailingSlash(pathname) {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function isPathWithinSegment(pathname, segment) {
  const normalizedPath = trimTrailingSlash(pathname);
  const normalizedSegment = trimTrailingSlash(segment);
  return normalizedPath === normalizedSegment || normalizedPath.startsWith(`${normalizedSegment}/`);
}

function hasPathSegment(pathname, segment) {
  return trimTrailingSlash(pathname)
    .split("/")
    .filter(Boolean)
    .includes(segment);
}

function classifySourceSurface(sourceUrl) {
  if (!sourceUrl) return "other";

  let parsedUrl;
  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    return "other";
  }

  const host = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname;

  if (ICON_PACK_RULES.some((rule) => host === rule.host && isPathWithinSegment(pathname, rule.pathPrefix))) {
    return "icon-pack";
  }

  // Intentionally limit repo classification to the canonical GitHub web hosts.
  if (host === "github.com" || host === "www.github.com") {
    return "repo";
  }

  // Treat GitHub-owned brand/docs/CDN surfaces separately so they do not inflate vendor-site counts.
  if (
    host === "brand.github.com" ||
    host.endsWith(".github.io") ||
    host === "raw.githubusercontent.com" ||
    host === "user-images.githubusercontent.com" ||
    host === "githubusercontent.com" ||
    host.endsWith(".githubusercontent.com") ||
    host === "githubassets.com" ||
    host.endsWith(".githubassets.com")
  ) {
    return "github-hosted";
  }

  if (
    DOCS_HOSTS.has(host) ||
    DOCS_HOST_PREFIXES.some((prefix) => host.startsWith(prefix)) ||
    DOCS_PATH_SEGMENTS.some((segment) => hasPathSegment(pathname, segment))
  ) {
    return "docs-site";
  }

  if (host) {
    return "vendor-site";
  }

  return "other";
}

function getAssetExtension(logoUrl) {
  if (!logoUrl) return "none";

  const normalizedPath = (() => {
    try {
      return new URL(logoUrl, "https://enterpriseai.tools").pathname;
    } catch {
      return logoUrl.split(/[?#]/, 1)[0];
    }
  })();

  const match = normalizedPath.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "other";
}

function daysBetween(start, end) {
  return Math.floor((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24));
}

function formatCountNoun(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

const sourceSurfaceCounts = new Map(sourceSurfaceOrder.map((surface) => [surface, 0]));
const assetExtensionCounts = new Map();
const sharedAssetMap = new Map();
const agedReviewBuckets = {
  withinRecentWindow: 0,
  betweenRecentAndStaleWindow: 0,
  overStaleWindow: 0,
};

for (const row of siteRows) {
  const sourceSurface = classifySourceSurface(row.logoSourceUrl);
  sourceSurfaceCounts.set(sourceSurface, (sourceSurfaceCounts.get(sourceSurface) ?? 0) + 1);

  const assetExtension = getAssetExtension(row.logoUrl);
  assetExtensionCounts.set(assetExtension, (assetExtensionCounts.get(assetExtension) ?? 0) + 1);

  const bucket = sharedAssetMap.get(row.logoUrl) ?? [];
  bucket.push(`${row.name} (${row.category})`);
  sharedAssetMap.set(row.logoUrl, bucket);
}

for (const item of inventory) {
  // Bucket review age in whole UTC-based days; future-dated reviews clamp to 0 so small clock skew does not distort the buckets.
  const ageInDays = Math.max(0, daysBetween(item.reviewedAt, generatedAt));
  if (ageInDays > REVIEW_FRESHNESS_DAYS.stale) {
    agedReviewBuckets.overStaleWindow += 1;
  } else if (ageInDays > REVIEW_FRESHNESS_DAYS.recent) {
    agedReviewBuckets.betweenRecentAndStaleWindow += 1;
  } else {
    agedReviewBuckets.withinRecentWindow += 1;
  }
}

const sharedAssets = [...sharedAssetMap.entries()]
  .filter(([, names]) => names.length > 1)
  .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));

const lines = [];
lines.push("# Logo audit report");
lines.push("");
lines.push("Generated from current repo data via `npm run report-logo-audit`. No wall-clock timestamp is embedded so diffs only reflect data/reporting changes.");
lines.push("");
lines.push("## Site coverage by category");
lines.push("");
lines.push("| Category | Total | Fallback | Service icon | Project logo | Official product | Official vendor |");
lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const category of categoryOrder) {
  const bucket = counts.get(category);
  lines.push(
    `| ${category} | ${bucket.total} | ${bucket.fallback} (${formatPercent(bucket.fallback, bucket.total)}) | ${bucket["service-icon"]} | ${bucket["project-logo"]} | ${bucket["official-product"]} | ${bucket["official-vendor"]} |`,
  );
}
lines.push(
  `| **All site records** | **${totals.total}** | **${totals.fallback} (${formatPercent(totals.fallback, totals.total)})** | **${totals["service-icon"]}** | **${totals["project-logo"]}** | **${totals["official-product"]}** | **${totals["official-vendor"]}** |`,
);
lines.push("");
lines.push("## Inventory status");
lines.push("");
lines.push(`- Inventory rows: **${inventorySummary.total}**`);
lines.push(`- Classified: **${inventorySummary.classified}**`);
lines.push(`- Unclassified: **${inventorySummary.unclassified}**`);
lines.push("");
lines.push("## Source-surface mix");
lines.push("");
lines.push("This shows where the currently rendered imagery comes from. Zero fallbacks does **not** mean the system is fully clean if many records still depend on shared vendor surfaces, GitHub-hosted docs/assets, docs-site assets, or vendor-site marks pulled from product/marketing pages.");
lines.push("");
lines.push("| Source surface | Count | Share |");
lines.push("| --- | ---: | ---: |");
for (const surface of sourceSurfaceOrder) {
  const count = sourceSurfaceCounts.get(surface) ?? 0;
  lines.push(`| ${surface} | ${count} | ${formatPercent(count, totals.total)} |`);
}
lines.push("");
lines.push("## Asset format mix");
lines.push("");
lines.push("| Format | Count | Share |");
lines.push("| --- | ---: | ---: |");
for (const [extension, count] of [...assetExtensionCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
  lines.push(`| ${extension.toUpperCase()} | ${count} | ${formatPercent(count, totals.total)} |`);
}
lines.push("");
lines.push("## Shared-asset reuse");
lines.push("");
if (sharedAssets.length === 0) {
  lines.push("- No rendered image assets are currently reused across multiple records.");
} else {
  lines.push("These rows are not automatically wrong, but they are where the system is still relying on family-brand or shared-platform reuse instead of distinct product marks.");
  lines.push("");
  for (const [logoUrl, names] of sharedAssets) {
    lines.push(`- \`${logoUrl}\` → ${names.join(", ")}`);
  }
}
lines.push("");
lines.push("## Review freshness");
lines.push("");
lines.push(`- Reviewed within the last ${REVIEW_FRESHNESS_DAYS.recent} days of the inventory snapshot (${generatedAt.slice(0, 10)}): **${agedReviewBuckets.withinRecentWindow}**`);
lines.push(`- Reviewed ${REVIEW_FRESHNESS_DAYS.recent + 1}-${REVIEW_FRESHNESS_DAYS.stale} days before the snapshot: **${agedReviewBuckets.betweenRecentAndStaleWindow}**`);
lines.push(`- Reviewed more than ${REVIEW_FRESHNESS_DAYS.stale} days before the snapshot: **${agedReviewBuckets.overStaleWindow}**`);
lines.push("");
lines.push("## Highest-priority cleanup signal");
lines.push("");

const highestFallback = categoryOrder
  .map((category, orderIndex) => ({ category, orderIndex, ...counts.get(category) }))
  .filter((row) => row.total > 0)
  .sort((a, b) => {
    const ratioDiff = b.fallback / b.total - a.fallback / a.total;
    if (ratioDiff !== 0) return ratioDiff;

    const fallbackCountDiff = b.fallback - a.fallback;
    if (fallbackCountDiff !== 0) return fallbackCountDiff;

    return a.orderIndex - b.orderIndex;
  })[0];

if (highestFallback?.fallback > 0) {
  lines.push(
    `- Current worst category by fallback ratio: **${highestFallback.category}** with **${highestFallback.fallback}/${highestFallback.total}** fallback entries (${formatPercent(highestFallback.fallback, highestFallback.total)}).`,
  );
} else {
  const vendorSiteCount = sourceSurfaceCounts.get("vendor-site") ?? 0;
  const githubHostedCount = sourceSurfaceCounts.get("github-hosted") ?? 0;
  const docsSiteCount = sourceSurfaceCounts.get("docs-site") ?? 0;
  const sharedReuseCount = sharedAssets.length;

  lines.push(
    `- Fallback share is currently **0%**, so the next honest cleanup signal is source quality: **${formatCountNoun(vendorSiteCount, "vendor-site mark")}**, **${formatCountNoun(githubHostedCount, "GitHub-hosted mark")}**, **${formatCountNoun(docsSiteCount, "docs-site mark")}**, and **${formatCountNoun(sharedReuseCount, "shared-image reuse group")}** still need periodic review.`,
  );
}

lines.push("- Treat this report as an audit gate: do not treat zero fallback count as full logo-system completion unless the source-surface mix, shared-asset reuse, and review freshness are also acceptable.");
lines.push("");

fs.writeFileSync(path.join(repoRoot, "docs/logo-audit-report.md"), `${lines.join("\n")}\n`);
console.log("Wrote docs/logo-audit-report.md");
