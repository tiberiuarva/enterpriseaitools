import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import toolsData from "../data/tools.json" with { type: "json" };
import platformsData from "../data/platforms.json" with { type: "json" };
import updatesData from "../data/updates.json" with { type: "json" };
import siteRoutes from "../seo-route-inventory.json" with { type: "json" };
import comparisonSlugs from "../data/comparison-slugs.json" with { type: "json" };

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.enterpriseai.tools").replace(/\/$/, "");
// `data/tools.json` carries a top-level `lastUpdated` calendar date (see
// data/SCHEMA.md). Used as the build-stable timestamp for every generated
// artifact so output is deterministic (never Date.now()).
const lastModified = toolsData.lastUpdated;
const updatesLastModified = updatesData.lastUpdated;
const recentUpdatesLimit = 30;
const highImpactRetentionDays = 45;
const publicDir = path.resolve("public");

const CATEGORY_LABELS = {
  agents: "AI Agent Frameworks",
  orchestration: "AI Orchestration",
  governance: "AI Governance",
  assistants: "AI Assistants",
};

function toAbsoluteUrl(routePath) {
  const normalizedPath = routePath === "/" ? "/" : `/${routePath.replace(/^\/+|\/+$/g, "")}/`;
  return new URL(normalizedPath, `${siteUrl}/`).toString();
}

function generateSitemapXml() {
  const toolRoutes = toolsData.tools
    .map((tool) => ({ path: `/tools/${tool.id}`, changeFrequency: "monthly", priority: 0.6 }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const compareRoutes = comparisonSlugs
    .map((entry) => ({ path: `/tools/compare/${entry.slug}`, changeFrequency: "monthly", priority: 0.5 }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const urls = [...siteRoutes, ...toolRoutes, ...compareRoutes]
    .map(
      ({ path: routePath, changeFrequency, priority }) => `  <url>\n    <loc>${toAbsoluteUrl(routePath)}</loc>\n    <lastmod>${lastModified}</lastmod>\n    <changefreq>${changeFrequency}</changefreq>\n    <priority>${priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isoDate(value) {
  return new Date(`${value}T00:00:00Z`).toISOString();
}

function daysBetween(startDate, endDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((new Date(`${endDate}T00:00:00Z`) - new Date(`${startDate}T00:00:00Z`)) / msPerDay);
}

function generateUpdatesAtomFeed() {
  const feedUpdated = updatesData.updates.reduce((latest, update) => (update.date > latest ? update.date : latest), lastModified);
  const entries = updatesData.updates
    .map((update) => {
      const entryUrl = `${toAbsoluteUrl("/updates")}#${update.id}`;
      const categories = [update.category, update.type, update.impact].filter(Boolean).join(", ");
      const entryTitle = update.title?.trim() || `${update.toolName} — ${update.type}`;
      return `  <entry>\n    <id>${escapeXml(entryUrl)}</id>\n    <title>${escapeXml(entryTitle)}</title>\n    <updated>${isoDate(update.date)}</updated>\n    <link href="${escapeXml(entryUrl)}" />\n    <summary>${escapeXml(update.summary)}</summary>\n    <author><name>enterpriseai.tools</name></author>\n    <category term="${escapeXml(categories)}" />\n    <source>\n      <id>${escapeXml(update.sourceUrl)}</id>\n      <title>${escapeXml(update.sourceTitle || update.sourceUrl)}</title>\n      <link href="${escapeXml(update.sourceUrl)}" />\n    </source>\n  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <id>${siteUrl}/updates.xml</id>\n  <title>enterpriseai.tools weekly updates</title>\n  <updated>${isoDate(feedUpdated)}</updated>\n  <link href="${siteUrl}/updates.xml" rel="self" />\n  <link href="${toAbsoluteUrl("/updates")}" rel="alternate" />\n  <subtitle>High-impact market intelligence for enterprise AI tooling, with an expandable release log for lower-signal product changes.</subtitle>\n${entries}\n</feed>\n`;
}

// AI/LLM crawlers explicitly welcomed — the site exists to be cited.
const aiCrawlers = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "CCBot",
  "meta-externalagent",
];

function generateRobotsTxt() {
  const aiStanzas = aiCrawlers.map((agent) => `User-agent: ${agent}\nAllow: /`).join("\n\n");
  return `User-agent: *\nAllow: /\n\n# AI / LLM crawlers — explicitly welcome\n${aiStanzas}\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

// ── Machine-readable dataset endpoints (first-party, attributed) ──────────────
function datasetEnvelope(name, description, records, key, generatedAt = lastModified) {
  return `${JSON.stringify(
    {
      name,
      description,
      // Licence under which THIS dataset JSON is published. Each record's own
      // software/product licence lives in its `license` field — do not confuse
      // the two (license accuracy is a P0 invariant).
      datasetLicense: "MIT",
      datasetLicenseNote: "Publication licence for this dataset file. Each record's own licence is in its `license` field.",
      source: siteUrl,
      generatedAt,
      count: records.length,
      [key]: records,
    },
    null,
    2,
  )}\n`;
}

function generateToolsDataset() {
  return datasetEnvelope(
    "enterpriseai.tools tools dataset",
    "Source-backed governance posture for every tracked enterprise AI tool. Each record carries data residency, deployment model, audit logging, SOC 2 / ISO 27001 / ISO 42001, EU AI Act role, and license risk with a primary source URL on every asserted claim.",
    toolsData.tools,
    "tools",
  );
}

function generatePlatformsDataset() {
  return datasetEnvelope(
    "enterpriseai.tools platforms dataset",
    "The cloud foundation platforms (Microsoft Foundry, Amazon Bedrock, Gemini Enterprise Agent Platform) tracked as the base stack for enterprise AI tooling.",
    platformsData.platforms,
    "platforms",
  );
}

function generateUpdatesDataset() {
  return datasetEnvelope(
    "enterpriseai.tools updates dataset",
    "High-impact market intelligence for enterprise AI tooling — releases, deprecations, acquisitions, license and certification changes — each with a primary source URL.",
    updatesData.updates,
    "updates",
    updatesLastModified,
  );
}

// ── llms.txt (index) ──────────────────────────────────────────────────────────
function generateLlmsTxt() {
  const toolCount = toolsData.tools.length;
  return `# enterpriseai.tools

> An open-source landscape tracker for enterprise AI tooling (${toolCount} tools across ${Object.keys(CATEGORY_LABELS).length} categories). Each record links to an official source; the dataset is governed by \`data/SCHEMA.md\` and updated weekly.

Edited through a regulated-enterprise delivery lens: governance posture, deployment surface, ownership, sourcing quality, and operational fit are weighted above launch marketing. No analytics, no sign-up, no data capture.

## Per-tool pages
Every tracked tool has its own page at \`/tools/<id>\` carrying the full source-backed governance posture (data residency, deployment model, audit logging, SOC 2 / ISO 27001 / ISO 42001, EU AI Act role, license risk), with a primary source URL on every asserted claim.

## Hub pages
- [Home](${siteUrl}/): overview of the four tracked categories and the foundation platforms.
- [AI Platforms & Model Hubs](${siteUrl}/platforms/): Microsoft Foundry, Amazon Bedrock, Gemini Enterprise Agent Platform (formerly Google Vertex AI).
- [AI Agent Frameworks](${siteUrl}/agents/): cloud agent platforms + open-source frameworks.
- [AI Orchestration](${siteUrl}/orchestration/): workflow engines and automation.
- [AI Governance](${siteUrl}/governance/): guardrails, content safety, policy.
- [AI Assistants](${siteUrl}/assistants/): coding, productivity, build-your-own.
- [Weekly updates](${siteUrl}/updates/): high-impact market intelligence + release log.
- [Help me evaluate](${siteUrl}/evaluate/): guided client-side flow that ranks tools by governance fit.
- [About](${siteUrl}/about/): project scope, sourcing standards, and contribution rules.

## Data
- Full content for LLMs (single fetch): [llms-full.txt](${siteUrl}/llms-full.txt)
- Tools dataset (JSON): ${siteUrl}/data/tools.json
- Platforms dataset (JSON): ${siteUrl}/data/platforms.json
- Updates dataset (JSON): ${siteUrl}/data/updates.json
- Every per-tool page: ${siteUrl}/sitemap.xml
- Updates feed (Atom): ${siteUrl}/updates.xml
- Source: https://github.com/tiberiuarva/enterpriseaitools

## Editorial standards
- Source-backed or not published. Every record carries a primary-source URL.
- License labels match upstream \`LICENSE\` files exactly; corrections go through a dedicated issue rather than silent edits.
- Canonical product names are tracked; prior names are preserved in \`formerNames\` / \`aliases\`.

## Curator
Tiberiu Arva — enterprise financial-services delivery lens.
`;
}

// ── llms-full.txt (complete content for single-fetch ingestion) ───────────────
function claimLine(label, claim) {
  if (!claim) return null;
  const parts = [`- ${label}: ${claim.status}`];
  if (claim.level) parts.push(`(risk: ${claim.level})`);
  if (claim.role) parts.push(`(role: ${claim.role})`);
  if (Array.isArray(claim.models) && claim.models.length) parts.push(`(${claim.models.join(", ")})`);
  let line = parts.join(" ");
  if (claim.detail) line += ` — ${claim.detail}`;
  if (claim.sourceUrl) line += ` [source: ${claim.sourceUrl}]`;
  return line;
}

function toolBlock(tool) {
  const g = tool.governance ?? {};
  const lines = [
    `### ${tool.name}`,
    `- Page: ${siteUrl}/tools/${tool.id}/`,
    `- Vendor: ${tool.vendor ?? "—"} | Type: ${tool.type} | License: ${tool.license}${tool.licenseWarning ? ` (caution: ${tool.licenseWarning})` : ""}`,
    `- Status: ${tool.status}${tool.version ? ` | Version: ${tool.version}` : ""}${tool.lastRelease ? ` | Last release: ${tool.lastRelease}` : ""}`,
    `- ${tool.description}`,
  ];
  if (Array.isArray(tool.strengths) && tool.strengths.length) {
    lines.push(`- Strengths: ${tool.strengths.join("; ")}`);
  }
  const governanceLines = [
    claimLine("Data residency", g.dataResidency),
    claimLine("Deployment", g.deployment),
    claimLine("Audit logging", g.auditLogging),
    claimLine("SOC 2", g.soc2),
    claimLine("ISO 27001", g.iso27001),
    claimLine("ISO 42001", g.iso42001),
    claimLine("EU AI Act", g.euAiAct),
    claimLine("License risk", g.licenseRisk),
  ].filter(Boolean);
  if (governanceLines.length) {
    lines.push("- Governance posture:");
    lines.push(...governanceLines.map((line) => `  ${line}`));
  }
  if (g.reviewedAt) lines.push(`- Governance reviewed: ${g.reviewedAt}`);
  const links = [
    tool.docsUrl ? `docs: ${tool.docsUrl}` : null,
    tool.websiteUrl ? `site: ${tool.websiteUrl}` : null,
    tool.githubUrl ? `repo: ${tool.githubUrl}` : null,
  ].filter(Boolean);
  if (links.length) lines.push(`- Links: ${links.join(" | ")}`);
  return lines.join("\n");
}

function generateLlmsFullTxt() {
  const sortedTools = [...toolsData.tools].sort(
    (a, b) => a.category.localeCompare(b.category) || a.id.localeCompare(b.id),
  );
  const sortedPlatforms = [...platformsData.platforms].sort((a, b) => a.id.localeCompare(b.id));

  const platformSection = sortedPlatforms
    .map((p) => {
      const formerly = p.formerNames?.length ? ` (formerly ${p.formerNames.join(", ")})` : "";
      return [
        `### ${p.name}${formerly}`,
        `- Vendor: ${p.vendor} | Models: ${p.modelCount} | On-prem: ${p.onPremises}`,
        `- ${p.description}`,
        `- Protocols: ${(p.protocols ?? []).join(", ")} | Compliance: ${(p.compliance ?? []).join(", ")}`,
        `- Docs: ${p.docsUrl}${p.websiteUrl ? ` | Site: ${p.websiteUrl}` : ""}`,
      ].join("\n");
    })
    .join("\n\n");

  const categorySections = Object.entries(CATEGORY_LABELS)
    .map(([category, label]) => {
      const tools = sortedTools.filter((tool) => tool.category === category);
      if (!tools.length) return null;
      return `## ${label}\n\n${tools.map(toolBlock).join("\n\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const sortedUpdates = [...updatesData.updates].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
  const recentUpdates = sortedUpdates
    .filter((update, index) => index < recentUpdatesLimit || (update.impact === "high" && daysBetween(update.date, updatesLastModified) <= highImpactRetentionDays))
    .map((u) => `- ${u.date} — ${u.toolName} (${u.type}${u.impact ? `, ${u.impact} impact` : ""}): ${u.summary} [source: ${u.sourceUrl}]`)
    .join("\n");

  return `# enterpriseai.tools — full content

> Complete source-backed snapshot of every tracked enterprise AI tool, platform, and recent update, for single-fetch LLM ingestion. ${toolsData.tools.length} tools across ${Object.keys(CATEGORY_LABELS).length} categories. Updated weekly; governed by data/SCHEMA.md. Generated ${lastModified}.

Edited through a regulated-enterprise delivery lens. Every asserted governance claim links to a primary source. No analytics, no sign-up, no data capture.

## Foundation platforms

${platformSection}

${categorySections}

## Recent updates

${recentUpdates}

## Data access
- Tools dataset (JSON): ${siteUrl}/data/tools.json
- Platforms dataset (JSON): ${siteUrl}/data/platforms.json
- Updates dataset (JSON): ${siteUrl}/data/updates.json
- Updates feed (Atom): ${siteUrl}/updates.xml
- Sitemap: ${siteUrl}/sitemap.xml
- Source repository: https://github.com/tiberiuarva/enterpriseaitools

## License & curator
This dataset file is MIT licensed — each tool's own software/product license is noted in its block above. Curated by Tiberiu Arva through an enterprise financial-services delivery lens. Canonical site: ${siteUrl}/
`;
}

await mkdir(publicDir, { recursive: true });
await mkdir(path.join(publicDir, "data"), { recursive: true });
await writeFile(path.join(publicDir, "sitemap.xml"), generateSitemapXml());
await writeFile(path.join(publicDir, "robots.txt"), generateRobotsTxt());
await writeFile(path.join(publicDir, "updates.xml"), generateUpdatesAtomFeed());
await writeFile(path.join(publicDir, "llms.txt"), generateLlmsTxt());
await writeFile(path.join(publicDir, "llms-full.txt"), generateLlmsFullTxt());
await writeFile(path.join(publicDir, "data", "tools.json"), generateToolsDataset());
await writeFile(path.join(publicDir, "data", "platforms.json"), generatePlatformsDataset());
await writeFile(path.join(publicDir, "data", "updates.json"), generateUpdatesDataset());

console.log(`Generated SEO + AEO artifacts for ${siteUrl}`);
