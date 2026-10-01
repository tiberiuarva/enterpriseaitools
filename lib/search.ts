import { CATEGORIES, CATEGORY_ORDER, FOUNDATION_LINK, STACK_LAYERS } from "@/lib/categories";
import { platforms, tools } from "@/lib/data";
import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import { VENDOR_STACKS } from "@/lib/stacks";
import type { ToolCategory } from "@/lib/types";

export type SearchEntry = {
  id: string;
  label: string;
  href: string;
  kind: "tool" | "platform" | "page";
  section: string;
  keywords: string[];
};

// Site pages that answer a question a searcher might type directly (feature and
// trust surfaces). Tool/platform records are generated; these are curated.
const pageEntries: Array<Pick<SearchEntry, "label" | "keywords"> & { path: string }> = [
  {
    path: "/eu-ai-act",
    label: "EU AI Act tracker",
    keywords: ["eu ai act", "compliance", "obligations", "deadlines", "gpai", "high-risk", "regulation", "ics", "calendar"],
  },
  {
    path: "/data",
    label: "Open data & API",
    keywords: ["api", "json", "dataset", "download", "badges", "shields", "atom", "rss", "feed", "llms.txt"],
  },
  {
    path: "/updates",
    label: "Weekly updates",
    keywords: ["changelog", "news", "releases", "license changes", "deprecations", "feed"],
  },
  {
    path: "/evaluate",
    label: "Help me evaluate",
    keywords: ["shortlist", "guided", "wizard", "recommendation", "governance fit"],
  },
  {
    path: "/tools",
    label: "All tracked tools",
    keywords: ["index", "a-z", "every tool", "full list", "catalog", "directory"],
  },
  {
    path: "/tools/compare",
    label: "Compare tools",
    keywords: ["comparison", "side-by-side", "versus", "vs"],
  },
  {
    path: "/methodology",
    label: "Methodology",
    keywords: ["sources", "verification", "freshness", "license accuracy", "how data is verified"],
  },
  {
    path: "/inclusion-criteria",
    label: "Inclusion criteria",
    keywords: ["listing rules", "what qualifies", "removal", "propose a tool"],
  },
  {
    path: "/impartiality",
    label: "Impartiality — no paid placement",
    keywords: ["no pay to play", "sponsored", "corrections", "trust", "policy", "privacy", "no tracking"],
  },
  {
    path: "/privacy",
    label: "Privacy, cookies & analytics",
    keywords: ["privacy", "cookies", "analytics", "gdpr", "consent", "google analytics", "opt out", "tracking"],
  },
  {
    path: "/about",
    label: "About the project",
    keywords: ["contribute", "contact", "maintainer", "curator"],
  },
  {
    path: "/start",
    label: "Start with your question",
    keywords: ["where to start", "getting started", "roll out copilot", "first agent", "govern agents", "always-on agents", "guide"],
  },
  {
    path: "/stacks",
    label: "Enterprise AI stacks by vendor",
    keywords: ["vendor stack", "microsoft", "aws", "google", "compare vendors"],
  },
  {
    path: FOUNDATION_LINK.href,
    label: FOUNDATION_LINK.pageTitle,
    keywords: ["foundation", FOUNDATION_LINK.title, "model hubs", "foundry", "bedrock", "vertex"],
  },
  ...STACK_LAYERS.map((layer) => ({
    path: layer.href,
    label: layer.title,
    keywords: [layer.label, layer.tagline, ...layer.categories.map((category) => CATEGORIES[category].navLabel)],
  })),
  ...CATEGORY_ORDER.map((category) => ({
    path: `/${category}`,
    label: CATEGORIES[category].title,
    keywords: [CATEGORIES[category].navLabel, CATEGORIES[category].summary],
  })),
  ...VENDOR_STACKS.map((stack) => ({
    path: `/stacks/${stack.slug}`,
    label: `${stack.name} enterprise AI stack`,
    keywords: [stack.name, `${stack.name} stack`, "vendor stack"],
  })),
];

const categoryLabels = Object.fromEntries(
  CATEGORY_ORDER.map((category) => [category, CATEGORIES[category].navLabel]),
) as Record<ToolCategory, string>;

function uniqueKeywords(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => (value ? value.split(/[,/]/) : []))
        .map((value) => value.trim())
        .filter((value) => value.length > 0),
    ),
  );
}

export const headerSearchEntries: SearchEntry[] = [
  ...platforms.map((platform) => ({
    id: `platform:${platform.id}`,
    label: platform.name,
    href: withBasePath(`/platforms#${getPlatformFragmentId(platform.id)}`),
    kind: "platform" as const,
    section: "Platforms",
    keywords: uniqueKeywords([
      platform.vendor,
      ...platform.formerNames,
      ...platform.protocols,
      ...platform.sdkLanguages,
      ...platform.compliance,
    ]),
  })),
  ...tools.map((tool) => ({
    id: `tool:${tool.id}`,
    label: tool.name,
    href: withBasePath(`/tools/${tool.id}`),
    kind: "tool" as const,
    section: categoryLabels[tool.category],
    keywords: uniqueKeywords([
      tool.vendor,
      ...(tool.aliases ?? []),
      tool.license,
      ...(tool.tags ?? []),
      ...(tool.languages ?? []),
      ...(tool.clouds ?? []),
    ]),
  })),
  ...pageEntries.map((page) => ({
    id: `page:${page.path}`,
    label: page.label,
    href: withBasePath(page.path),
    kind: "page" as const,
    section: "Site",
    keywords: page.keywords,
  })),
].sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
