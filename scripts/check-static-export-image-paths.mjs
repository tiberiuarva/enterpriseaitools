import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(repoRoot, "out");

function collectHtmlFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return collectHtmlFiles(entryPath);
    }
    return entry.isFile() && entry.name.endsWith(".html") ? [entryPath] : [];
  });
}

if (!fs.existsSync(outDir)) {
  console.error("Static export image path check failed: out/ is missing. Run the build first.");
  process.exit(1);
}

const htmlFiles = collectHtmlFiles(outDir);
const nextImagePattern = /\/_next\/image\/?\?|%2F_next%2Fimage(%2F)?%3F/i;
const nextImageReferences = [];

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const match = html.match(nextImagePattern);
  if (match) {
    nextImageReferences.push({
      filePath: path.relative(repoRoot, filePath),
      sample: match[0],
    });
  }
}

if (nextImageReferences.length > 0) {
  console.error("Static export image path check failed: exported HTML still references /_next/image, which breaks on static hosting.");
  for (const { filePath, sample } of nextImageReferences) {
    console.error(`- ${filePath}: ${sample}`);
  }
  process.exit(1);
}

console.log(`Static export image path check passed across ${htmlFiles.length} HTML files.`);
