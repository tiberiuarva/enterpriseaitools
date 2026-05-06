import { platforms, tools } from "@/lib/data";
import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import type { ToolCategory } from "@/lib/types";

export type SearchEntry = {
  id: string;
  label: string;
  href: string;
  kind: "tool" | "platform";
  section: string;
  keywords: string[];
};

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
    href: withBasePath(`/${tool.category}#${tool.id}`),
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
].sort((a, b) => a.label.localeCompare(b.label));
