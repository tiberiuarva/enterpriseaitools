import { readFile } from "node:fs/promises";
import path from "node:path";
import routeInventory from "../seo-route-inventory.json" with { type: "json" };

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://enterpriseai.tools").replace(/\/$/, "");
const outDir = path.resolve("out");
const publicDir = path.resolve("public");

function normalizeRoute(routePath) {
  return routePath === "/" ? "/" : `/${routePath.replace(/^\/+|\/+$/g, "")}/`;
}

function absoluteUrl(routePath) {
  return new URL(normalizeRoute(routePath), `${siteUrl}/`).toString();
}

function pageFilePath(routePath) {
  return routePath === "/" ? path.join(outDir, "index.html") : path.join(outDir, routePath.replace(/^\//, ""), "index.html");
}

const robotsTxt = await readFile(path.join(publicDir, "robots.txt"), "utf8");
const sitemapXml = await readFile(path.join(publicDir, "sitemap.xml"), "utf8");

const failures = [];

if (!robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  failures.push(`robots.txt does not point at ${siteUrl}/sitemap.xml`);
}

for (const route of routeInventory) {
  const normalizedRoute = normalizeRoute(route.path);
  const expectedUrl = absoluteUrl(route.path);
  const htmlPath = pageFilePath(route.path);
  const html = await readFile(htmlPath, "utf8");

  if (!sitemapXml.includes(`<loc>${expectedUrl}</loc>`)) {
    failures.push(`sitemap.xml is missing ${expectedUrl}`);
  }

  if (!html.includes(`<link rel="canonical" href="${expectedUrl}"`)) {
    failures.push(`${normalizedRoute} is missing canonical ${expectedUrl}`);
  }

  if (!html.includes(route.titleContains)) {
    failures.push(`${normalizedRoute} title/content does not include expected text: ${route.titleContains}`);
  }

  if (!html.includes(route.descriptionContains)) {
    failures.push(`${normalizedRoute} metadata/content does not include expected text: ${route.descriptionContains}`);
  }

  if (route.requiresBreadcrumbs && !html.includes('"@type":"BreadcrumbList"')) {
    failures.push(`${normalizedRoute} is missing BreadcrumbList JSON-LD`);
  }

  if (route.requiresCollectionPage && !html.includes('"@type":"CollectionPage"')) {
    failures.push(`${normalizedRoute} is missing CollectionPage JSON-LD`);
  }

  if (route.requiresItemList && !html.includes('"@type":"ItemList"')) {
    failures.push(`${normalizedRoute} is missing ItemList JSON-LD`);
  }
}

if (!failures.length) {
  console.log(`SEO readiness checks passed for ${routeInventory.length} routes on ${siteUrl}`);
  process.exit(0);
}

console.error("SEO readiness checks failed:\n");
for (const failure of failures) {
  console.error(`- ${failure}`);
}
process.exit(1);
