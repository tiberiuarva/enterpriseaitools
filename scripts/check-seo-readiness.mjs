import { readFile } from "node:fs/promises";
import path from "node:path";
import routeInventory from "../seo-route-inventory.json" with { type: "json" };

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.enterpriseai.tools").replace(/\/$/, "");
const outDir = path.resolve("out");
const publicDir = path.resolve("public");

function normalizeRoute(routePath) {
  return routePath === "/" ? "/" : `/${routePath.replace(/^\/+|\/+$/g, "")}/`;
}

function absoluteUrl(routePath) {
  return new URL(normalizeRoute(routePath), `${siteUrl}/`).toString();
}

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function pageFilePath(routePath) {
  return routePath === "/" ? path.join(outDir, "index.html") : path.join(outDir, routePath.replace(/^\//, ""), "index.html");
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function readTitle(html) {
  return decodeHtmlEntities(html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() || "");
}

function readMetaDescription(html) {
  return decodeHtmlEntities(html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i)?.[1]?.trim() || "");
}

function collectJsonLdTypes(html) {
  const matches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>(.*?)<\/script>/gsi)];
  const types = new Set();

  for (const match of matches) {
    const raw = match[1]?.trim();
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw);
      const nodes = Array.isArray(parsed) ? parsed : [parsed];

      for (const node of nodes) {
        const nodeType = node?.["@type"];
        if (typeof nodeType === "string") {
          types.add(nodeType);
        } else if (Array.isArray(nodeType)) {
          for (const value of nodeType) {
            if (typeof value === "string") {
              types.add(value);
            }
          }
        }
      }
    } catch {
      failures.push("Encountered invalid JSON-LD while checking rendered HTML");
    }
  }

  return types;
}

const robotsTxt = await readFile(path.join(publicDir, "robots.txt"), "utf8");
const sitemapXml = await readFile(path.join(publicDir, "sitemap.xml"), "utf8");
const updatesAtomXml = await readFile(path.join(publicDir, "updates.xml"), "utf8");

const failures = [];
const seenTitles = new Map();
const seenDescriptions = new Map();

if (!robotsTxt.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  failures.push(`robots.txt does not point at ${siteUrl}/sitemap.xml`);
}

if (!updatesAtomXml.includes(`<feed xmlns="http://www.w3.org/2005/Atom">`)) {
  failures.push("updates.xml is missing the Atom feed root element");
}

if (!updatesAtomXml.includes(`<link href="${siteUrl}/updates.xml" rel="self" />`)) {
  failures.push(`updates.xml is missing self link ${siteUrl}/updates.xml`);
}

if (!updatesAtomXml.includes(`<link href="${siteUrl}/updates/" rel="alternate" />`)) {
  failures.push(`updates.xml is missing alternate link ${siteUrl}/updates/`);
}

for (const route of routeInventory) {
  const normalizedRoute = normalizeRoute(route.path);
  const expectedUrl = absoluteUrl(route.path);
  const htmlPath = pageFilePath(route.path);
  const html = await readFile(htmlPath, "utf8");
  const title = readTitle(html);
  const description = readMetaDescription(html);
  const jsonLdTypes = collectJsonLdTypes(html);

  if (!sitemapXml.includes(`<loc>${expectedUrl}</loc>`)) {
    failures.push(`sitemap.xml is missing ${expectedUrl}`);
  }

  if (!html.includes(`<link rel="canonical" href="${expectedUrl}"`)) {
    failures.push(`${normalizedRoute} is missing canonical ${expectedUrl}`);
  }

  if (!title.includes(route.titleContains) && !title.includes(escapeHtml(route.titleContains))) {
    failures.push(`${normalizedRoute} title does not include expected text: ${route.titleContains}`);
  }

  if (!description.includes(route.descriptionContains) && !description.includes(escapeHtml(route.descriptionContains))) {
    failures.push(`${normalizedRoute} meta description does not include expected text: ${route.descriptionContains}`);
  }

  if (route.minTitleLength && title.length < route.minTitleLength) {
    failures.push(`${normalizedRoute} title too short for search intent '${route.searchIntent}': ${title.length} chars`);
  }

  if (route.maxTitleLength && title.length > route.maxTitleLength) {
    failures.push(`${normalizedRoute} title too long for search intent '${route.searchIntent}': ${title.length} chars`);
  }

  if (route.minDescriptionLength && description.length < route.minDescriptionLength) {
    failures.push(`${normalizedRoute} meta description too short for search intent '${route.searchIntent}': ${description.length} chars`);
  }

  if (route.maxDescriptionLength && description.length > route.maxDescriptionLength) {
    failures.push(`${normalizedRoute} meta description too long for search intent '${route.searchIntent}': ${description.length} chars`);
  }

  if (seenTitles.has(title)) {
    failures.push(`${normalizedRoute} reuses title already used by ${seenTitles.get(title)}: ${title}`);
  } else {
    seenTitles.set(title, normalizedRoute);
  }

  if (seenDescriptions.has(description)) {
    failures.push(`${normalizedRoute} reuses meta description already used by ${seenDescriptions.get(description)}`);
  } else {
    seenDescriptions.set(description, normalizedRoute);
  }

  if (route.requiresBreadcrumbs && !jsonLdTypes.has("BreadcrumbList")) {
    failures.push(`${normalizedRoute} is missing BreadcrumbList JSON-LD`);
  }

  if (route.requiresCollectionPage && !jsonLdTypes.has("CollectionPage")) {
    failures.push(`${normalizedRoute} is missing CollectionPage JSON-LD`);
  }

  if (route.requiresItemList && !jsonLdTypes.has("ItemList")) {
    failures.push(`${normalizedRoute} is missing ItemList JSON-LD`);
  }

  if (route.path === "/" && !jsonLdTypes.has("WebPage")) {
    failures.push('/ is missing WebPage JSON-LD');
  }

  if (route.path === "/" && !jsonLdTypes.has("DataCatalog")) {
    failures.push('/ is missing DataCatalog JSON-LD');
  }

  if (route.path === "/updates" && !html.includes(`${siteUrl}/updates.xml`)) {
    failures.push("/updates/ is missing a visible or metadata reference to the Atom feed");
  }

  if (route.path === "/updates" && !jsonLdTypes.has("DataFeed")) {
    failures.push("/updates/ is missing DataFeed JSON-LD");
  }

  if (route.path === "/about" && !jsonLdTypes.has("AboutPage")) {
    failures.push("/about/ is missing AboutPage JSON-LD");
  }
}

if (!failures.length) {
  console.log(`SEO readiness checks passed for ${routeInventory.length} routes on ${siteUrl} (metadata copy + schema + sitemap validated)`);
  process.exit(0);
}

console.error("SEO readiness checks failed:\n");
for (const failure of failures) {
  console.error(`- ${failure}`);
}
process.exit(1);
