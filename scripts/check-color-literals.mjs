import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/*
 * Enforces the single-source-of-truth color rule:
 *   `app/globals.css` is the only file allowed to define color literals.
 *
 * Every file under `app/**` and `components/**` (except `app/globals.css`)
 * must consume colors via `var(--*)` tokens or their Tailwind aliases.
 * Hex codes, rgb/rgba/hsl/hsla literals, or raw Tailwind palette classes
 * (e.g. `bg-rose-50`, `text-amber-700`) fail the build.
 *
 * Flags:
 *   --report   List violations but exit 0 (used during the in-PR migration).
 *   --strict   List violations and exit 1 (default; release-blocker).
 */

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");

const argv = process.argv.slice(2);
const reportOnly = argv.includes("--report");

const scanRoots = ["app", "components", "lib"];
// Only TS/JS source files are scanned. `app/globals.css` is the single source
// of truth for color literals and is never visited because the file-extension
// filter below excludes `.css`.
const fileExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const skipDirs = new Set(["node_modules", ".next", "out"]);

const tailwindPalette = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime", "green", "emerald",
  "teal", "cyan", "sky", "blue", "indigo", "violet", "purple",
  "fuchsia", "pink", "rose",
];
const tailwindUtilities = [
  "bg", "text", "border", "ring", "outline", "shadow",
  "from", "via", "to",
  "divide", "placeholder", "accent", "caret", "fill", "stroke", "decoration",
];

const tailwindClassPattern = new RegExp(
  `(?<![a-zA-Z0-9_-])(?:dark:|hover:|focus:|focus-visible:|active:|group-hover:|group-focus:|peer-hover:|peer-focus:|disabled:|aria-[a-z-]+:|data-[a-z-]+:|md:|sm:|lg:|xl:|2xl:|first:|last:|odd:|even:|placeholder:|enabled:|checked:|focus-within:|selection:|file:|marker:|before:|after:)*(?:${tailwindUtilities.join("|")})-(?:${tailwindPalette.join("|")})-[0-9]{2,3}(?:/[0-9]+)?\\b`,
  "g",
);

// Hex literal — three to eight hex chars (covers #rgb, #rrggbb, #rrggbbaa)
const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;

// rgb()/rgba()/hsl()/hsla() — any function call form
const rgbPattern = /\b(?:rgba?|hsla?)\s*\(/g;

// Tokens that are allowed inline (var(--*) reads are fine; color-mix with var
// operands is fine; the script only blocks raw literals).
function isCommentLine(line) {
  const trimmed = line.trim();
  return (
    trimmed.startsWith("//") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("/*") ||
    trimmed.startsWith("*/")
  );
}

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && fileExtensions.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

const violations = [];

for (const root of scanRoots) {
  const absRoot = path.join(repoRoot, root);
  for await (const filePath of walk(absRoot)) {
    const relative = path.relative(repoRoot, filePath);

    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n");

    lines.forEach((line, index) => {
      if (isCommentLine(line)) return;

      // Hex literals — but allow inside strings that are obviously JSON-LD or
      // identifiers (e.g. snapshot ids); the rule applies to color hex only.
      // We're strict: any hex in JSX/TS is a violation. Components must use tokens.
      hexPattern.lastIndex = 0;
      let hexMatch;
      while ((hexMatch = hexPattern.exec(line)) !== null) {
        violations.push({
          file: relative,
          line: index + 1,
          column: hexMatch.index + 1,
          kind: "hex literal",
          match: hexMatch[0],
          context: line.trim(),
        });
      }

      // rgb/rgba/hsl/hsla function calls
      rgbPattern.lastIndex = 0;
      let rgbMatch;
      while ((rgbMatch = rgbPattern.exec(line)) !== null) {
        violations.push({
          file: relative,
          line: index + 1,
          column: rgbMatch.index + 1,
          kind: "rgb/hsl literal",
          match: rgbMatch[0].slice(0, -1),
          context: line.trim(),
        });
      }

      // Tailwind palette classes
      tailwindClassPattern.lastIndex = 0;
      let twMatch;
      while ((twMatch = tailwindClassPattern.exec(line)) !== null) {
        violations.push({
          file: relative,
          line: index + 1,
          column: twMatch.index + 1,
          kind: "tailwind palette class",
          match: twMatch[0],
          context: line.trim(),
        });
      }
    });
  }
}

if (violations.length === 0) {
  console.log("Color-literal check passed: 0 violations across app/** and components/**.");
  process.exit(0);
}

console.error(`Found ${violations.length} color-literal violation(s):`);
console.error("");
const grouped = new Map();
for (const v of violations) {
  const key = v.file;
  if (!grouped.has(key)) grouped.set(key, []);
  grouped.get(key).push(v);
}
for (const [file, list] of [...grouped.entries()].sort()) {
  console.error(`  ${file}`);
  for (const v of list) {
    console.error(`    L${v.line}:${v.column}  [${v.kind}]  ${v.match}`);
  }
}
console.error("");
console.error("Rule: app/globals.css is the only file that may define color literals.");
console.error("Every component / app / lib file must consume colors via var(--*) tokens or their Tailwind aliases.");

if (reportOnly) {
  console.error("(running in --report mode — exiting 0)");
  process.exit(0);
}

console.error("FAIL: color-literal check");
process.exit(1);
