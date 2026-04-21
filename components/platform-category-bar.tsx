import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

type PlatformMappedCategory = Exclude<ToolCategory, "assistants">;

type CoverageCopy = {
  heading: string;
  navLabel: string;
};

type AssistantMappingKey = keyof Pick<
  Platform["categoryMapping"],
  "assistantsCoding" | "assistantsProductivity" | "assistantsBuildYourOwn"
>;

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

const assistantContextEntries: Array<{ key: AssistantMappingKey; shortLabel: string }> = [
  { key: "assistantsCoding", shortLabel: "Coding" },
  { key: "assistantsProductivity", shortLabel: "Productivity" },
  { key: "assistantsBuildYourOwn", shortLabel: "Build your own" },
];

function getAssistantContextLabels(platform: Platform) {
  return assistantContextEntries.map(({ key, shortLabel }) => ({
    shortLabel,
    detailLabel: platform.categoryMapping[key].label,
  }));
}

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

  const mappedCategory: PlatformMappedCategory = category;
  return getPlatformContextLabel(platform, mappedCategory);
}

function getAssistantPlatformSummary(platform: Platform) {
  return getAssistantContextLabels(platform)
    .map(({ detailLabel }) => detailLabel)
    .join(" · ");
}

export function PlatformCategoryBar({ category, platforms }: { category: ToolCategory; platforms: Platform[] }) {
  if (platforms.length === 0) {
    return null;
  }

  const copy = coverageCopy[category];
  const columnClass = platforms.length >= 3 ? "md:grid-cols-3" : platforms.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1";

  return (
    <nav
      aria-label={copy.navLabel}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{copy.heading}</h3>
        <ul className={`grid grid-cols-1 gap-2 ${columnClass}`}>
          {platforms.map((platform) => {
            const assistantContextLabels = getAssistantContextLabels(platform);
            const summary = getPlatformSummary(platform, category);

            return (
              <li key={platform.id}>
                <a
                  href={getPlatformHref(platform)}
                  className="group flex h-full min-w-0 flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-left transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
                >
                  <span className="text-sm font-medium text-[var(--color-text-primary)] transition group-hover:text-[var(--color-primary)] group-focus-visible:text-[var(--color-primary)]">{platform.name}</span>
                  {category === "assistants" ? (
                    <>
                      <span aria-hidden="true" className="mt-1 flex flex-wrap gap-1 text-[11px] text-[var(--color-text-secondary)] transition group-hover:text-[color:color-mix(in_oklab,var(--color-primary)_80%,transparent)] group-focus-visible:text-[color:color-mix(in_oklab,var(--color-primary)_80%,transparent)]">
                        {assistantContextLabels.map(({ shortLabel }) => (
                          <span
                            key={shortLabel}
                            className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-1.5 py-0.5 transition group-hover:border-[color:color-mix(in_oklab,var(--color-primary)_30%,var(--color-border))] group-focus-visible:border-[color:color-mix(in_oklab,var(--color-primary)_30%,var(--color-border))]"
                          >
                            {shortLabel}
                          </span>
                        ))}
                      </span>
                      <span className="mt-2 text-[11px] leading-5 text-[var(--color-text-secondary)] transition group-hover:text-[color:color-mix(in_oklab,var(--color-primary)_80%,transparent)] group-focus-visible:text-[color:color-mix(in_oklab,var(--color-primary)_80%,transparent)]">
                        {summary}
                      </span>
                    </>
                  ) : (
                    <span className="mt-1 text-xs text-[var(--color-text-secondary)] transition group-hover:text-[color:color-mix(in_oklab,var(--color-primary)_80%,transparent)] group-focus-visible:text-[color:color-mix(in_oklab,var(--color-primary)_80%,transparent)]">{summary}</span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
