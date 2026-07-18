import { platforms, tools } from "@/lib/data";
import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
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
    path: "/about",
    label: "About the project",
    keywords: ["contribute", "contact", "maintainer", "curator"],
  },
];

const categoryLabels: Record<ToolCategory, string> = {
  agents: "Agents",
  orchestration: "Orchestration",
  governance: "Governance",
  assistants: "Assistants",
};

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
