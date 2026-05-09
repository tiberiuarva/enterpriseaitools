import { platforms, updates } from "@/lib/data";
import type { UpdateEntry } from "@/lib/types";

export type ProtocolKey = "mcp" | "a2a" | "openapi";

export type ProtocolSnapshot = {
  key: ProtocolKey;
  label: string;
  description: string;
  supportCount: number;
  platformNames: string[];
  recentUpdates: UpdateEntry[];
};

const protocolMeta: Record<ProtocolKey, { label: string; description: string; keywords: string[] }> = {
  mcp: {
    label: "MCP",
    description: "Model Context Protocol is becoming the default interoperability layer for tool and service connections.",
    keywords: ["mcp", "model context protocol"],
  },
  a2a: {
    label: "A2A",
    description: "Agent2Agent support matters where teams expect cross-agent handoffs instead of single-vendor agent silos.",
    keywords: ["a2a", "agent2agent", "agent-to-agent"],
  },
  openapi: {
    label: "OpenAPI",
    description: "OpenAPI still matters as the stable enterprise contract for API exposure, governance review, and gateway alignment.",
    keywords: ["openapi"],
  },
};

function matchesProtocol(update: UpdateEntry, keywords: string[]) {
  const haystack = [update.title, update.summary, update.sourceTitle, update.toolName]
    .filter((value): value is string => typeof value === "string" && value.length > 0)
    .join(" ")
    .toLowerCase();

  return keywords.some((keyword) => haystack.includes(keyword));
}

export function getProtocolSnapshots(): ProtocolSnapshot[] {
  return (Object.entries(protocolMeta) as Array<[ProtocolKey, (typeof protocolMeta)[ProtocolKey]]>).map(([key, meta]) => {
    const platformNames = platforms
      .filter((platform) => platform.protocols.map((protocol) => protocol.toLowerCase()).includes(key))
      .map((platform) => platform.name);

    return {
      key,
      label: meta.label,
      description: meta.description,
      supportCount: platformNames.length,
      platformNames,
      recentUpdates: updates.filter((update) => matchesProtocol(update, meta.keywords)).slice(0, 2),
    };
  });
}
