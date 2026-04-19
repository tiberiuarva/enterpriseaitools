import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import toolsData from "../data/tools.json" with { type: "json" };
import updatesData from "../data/updates.json" with { type: "json" };
import siteRoutes from "../seo-route-inventory.json" with { type: "json" };

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://enterpriseai.tools").replace(/\/$/, "");
const lastModified = toolsData.lastUpdated;
const publicDir = path.resolve("public");

function toAbsoluteUrl(routePath) {
  const normalizedPath = routePath === "/" ? "/" : `/${routePath.replace(/^\/+|\/+$/g, "")}/`;
  return new URL(normalizedPath, `${siteUrl}/`).toString();
}

function generateSitemapXml() {
  const urls = siteRoutes
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

function generateUpdatesAtomFeed() {
  const feedUpdated = updatesData.updates.reduce((latest, update) => (update.date > latest ? update.date : latest), lastModified);
  const entries = updatesData.updates
    .map((update) => {
      const entryUrl = `${toAbsoluteUrl("/updates")}#${update.id}`;
      const categories = [update.category, update.type, update.impact].filter(Boolean).join(", ");
      return `  <entry>\n    <id>${escapeXml(entryUrl)}</id>\n    <title>${escapeXml(`${update.toolName} — ${update.type}`)}</title>\n    <updated>${isoDate(update.date)}</updated>\n    <link href="${escapeXml(entryUrl)}" />\n    <summary>${escapeXml(update.summary)}</summary>\n    <author><name>enterpriseai.tools</name></author>\n    <category term="${escapeXml(categories)}" />\n    <source>\n      <id>${escapeXml(update.sourceUrl)}</id>\n      <title>${escapeXml(update.sourceTitle || update.sourceUrl)}</title>\n      <link href="${escapeXml(update.sourceUrl)}" />\n    </source>\n  </entry>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <id>${siteUrl}/updates.xml</id>\n  <title>enterpriseai.tools weekly updates</title>\n  <updated>${isoDate(feedUpdated)}</updated>\n  <link href="${siteUrl}/updates.xml" rel="self" />\n  <link href="${toAbsoluteUrl("/updates")}" rel="alternate" />\n  <subtitle>Changelog-style feed of releases, acquisitions, and notable changes in enterprise AI tooling.</subtitle>\n${entries}\n</feed>\n`;
}

function generateRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "sitemap.xml"), generateSitemapXml());
await writeFile(path.join(publicDir, "robots.txt"), generateRobotsTxt());
await writeFile(path.join(publicDir, "updates.xml"), generateUpdatesAtomFeed());

console.log(`Generated SEO artifacts for ${siteUrl}`);
