import { createElement } from "react";
import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

type PlatformMappedCategory = Exclude<ToolCategory, "assistants">;
type AssistantMappingKey = "assistantsCoding" | "assistantsProductivity" | "assistantsBuildYourOwn";
type HeadingLevel = 2 | 3;

type CoverageCopy = {
  heading: string;
  navLabel: string;
};

const coverageCopy: Record<ToolCategory, CoverageCopy> = {
  agents: {
    heading: "Agent platform coverage",
    navLabel: "Platform coverage for AI agent frameworks",
  },
  orchestration: {
    heading: "Orchestration platform coverage",
    navLabel: "Platform coverage for AI orchestration",
  },
  governance: {
    heading: "Governance platform coverage",
    navLabel: "Platform coverage for AI governance",
  },
  assistants: {
    heading: "Assistant platform coverage",
    navLabel: "Platform coverage for AI assistants",
  },
};

const assistantMappingKeys: AssistantMappingKey[] = ["assistantsCoding", "assistantsProductivity", "assistantsBuildYourOwn"];

function getPlatformContextLabel(platform: Platform, category: PlatformMappedCategory) {
  return platform.categoryMapping[category].label;
}

function getPlatformHref(platform: Platform) {
  return withBasePath(`/platforms#${platform.id}`);
}

function getPlatformSummary(platform: Platform, category: ToolCategory) {
  if (category === "assistants") {
    return getAssistantPlatformSummary(platform);
  }

  return getPlatformContextLabel(platform, category);
}

function getAssistantPlatformSummary(platform: Platform) {
  return assistantMappingKeys.map((key) => platform.categoryMapping[key].label).join(" · ");
}

export function PlatformCategoryBar({
  category,
  platforms,
  headingLevel = 2,
}: {
  category: ToolCategory;
  platforms: Platform[];
  headingLevel?: HeadingLevel;
}) {
  if (platforms.length === 0) {
    return null;
  }

  const copy = coverageCopy[category];
  const columnClass = platforms.length >= 3 ? "md:grid-cols-3" : platforms.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1";
  const headingTag = headingLevel === 3 ? "h3" : "h2";

  return (
    <nav
      aria-label={copy.navLabel}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
    >
      <div className="flex flex-col gap-2">
        {createElement(headingTag, { className: "text-sm font-semibold text-[var(--color-text-primary)]" }, copy.heading)}
        <ul className={`grid grid-cols-1 gap-2 ${columnClass}`}>
          {platforms.map((platform) => {
            const summary = getPlatformSummary(platform, category);
            const summaryClass = category === "assistants" ? "mt-2 text-xs leading-5" : "mt-1 text-xs";

            return (
              <li key={platform.id}>
                <a
                  href={getPlatformHref(platform)}
                  className="group flex h-full min-w-0 flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-left transition hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
                >
                  <span className="text-sm font-medium text-[var(--color-text-primary)] transition group-hover:text-[var(--color-primary)] group-focus-visible:text-[var(--color-primary)]">{platform.name}</span>
                  <span className={`${summaryClass} text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)] group-focus-visible:text-[var(--color-primary)]`}>
                    {summary}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
