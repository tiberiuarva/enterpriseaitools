import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import toolsData from "../data/tools.json" with { type: "json" };

const siteRoutes = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/platforms", changeFrequency: "weekly", priority: 0.9 },
  { path: "/agents", changeFrequency: "weekly", priority: 0.9 },
  { path: "/orchestration", changeFrequency: "weekly", priority: 0.9 },
  { path: "/governance", changeFrequency: "weekly", priority: 0.9 },
  { path: "/assistants", changeFrequency: "weekly", priority: 0.9 },
  { path: "/updates", changeFrequency: "weekly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
];

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

function generateRobotsTxt() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
}

await mkdir(publicDir, { recursive: true });
await writeFile(path.join(publicDir, "sitemap.xml"), generateSitemapXml());
await writeFile(path.join(publicDir, "robots.txt"), generateRobotsTxt());

console.log(`Generated SEO artifacts for ${siteUrl}`);
