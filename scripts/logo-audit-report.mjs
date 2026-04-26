import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

const tools = readJson("data/tools.json").tools;
const platforms = readJson("data/platforms.json").platforms;
const inventory = readJson("data/logo-inventory.json").items;

const siteRows = [
  ...tools.map((item) => ({ category: item.category, logoKind: item.logoKind })),
  ...platforms.map((item) => ({ category: "platforms", logoKind: item.logoKind })),
];

const categoryOrder = ["agents", "orchestration", "governance", "assistants", "platforms"];
const logoKindOrder = ["fallback", "service-icon", "project-logo", "official-product", "official-vendor"];

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
  const bucket = counts.get(row.category) ?? initRow();
  bucket.total += 1;
  if (row.logoKind in bucket) {
    bucket[row.logoKind] += 1;
  }
  counts.set(row.category, bucket);
}

const totals = initRow();
for (const category of categoryOrder) {
  const bucket = counts.get(category) ?? initRow();
  totals.total += bucket.total;
  for (const kind of logoKindOrder) {
    totals[kind] += bucket[kind];
  }
}

const inventorySummary = {
  total: inventory.length,
  classified: inventory.filter((item) => item.status === "classified").length,
  unclassified: inventory.filter((item) => item.status !== "classified").length,
};

function formatPercent(numerator, denominator) {
  if (!denominator) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

const lines = [];
lines.push("# Logo audit report");
lines.push("");
lines.push(`Generated: ${new Date().toISOString()}`);
lines.push("");
lines.push("## Site coverage by category");
lines.push("");
lines.push("| Category | Total | Fallback | Service icon | Project logo | Official product | Official vendor |");
lines.push("| --- | ---: | ---: | ---: | ---: | ---: | ---: |");
for (const category of categoryOrder) {
  const bucket = counts.get(category) ?? initRow();
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
lines.push("## Highest-priority cleanup signal");
lines.push("");

const highestFallback = categoryOrder
  .map((category) => ({ category, ...counts.get(category) }))
  .filter((row) => row && row.total > 0)
  .sort((a, b) => {
    const ratioDiff = b.fallback / b.total - a.fallback / a.total;
    if (ratioDiff !== 0) return ratioDiff;
    return b.fallback - a.fallback;
  })[0];

if (highestFallback) {
  lines.push(
    `- Current worst category by fallback ratio: **${highestFallback.category}** with **${highestFallback.fallback}/${highestFallback.total}** fallback entries (${formatPercent(highestFallback.fallback, highestFallback.total)}).`,
  );
}

lines.push("- Treat this report as an audit gate: do not claim the logo system is cleaned up while fallback share remains high.");
lines.push("");

fs.writeFileSync(path.join(repoRoot, "docs/logo-audit-report.md"), `${lines.join("\n")}\n`);
console.log("Wrote docs/logo-audit-report.md");
