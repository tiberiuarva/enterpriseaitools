import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

type PlatformMappedCategory = Exclude<ToolCategory, "assistants">;
type AssistantMappingKey = "assistantsCoding" | "assistantsProductivity" | "assistantsBuildYourOwn";
type HeadingLevel = 2 | 3;

type PlatformCategoryBarProps = {
  category: ToolCategory;
  platforms: Platform[];
  headingLevel: HeadingLevel;
};

const coverageCopy: Record<ToolCategory, string> = {
  agents: "Runs on",
  orchestration: "Runs on",
  governance: "Runs on",
  assistants: "Runs on",
};

const assistantMappingKeys: AssistantMappingKey[] = ["assistantsCoding", "assistantsProductivity", "assistantsBuildYourOwn"];

function getPlatformContextLabel(platform: Platform, category: PlatformMappedCategory) {
  return platform.categoryMapping[category].label;
}

function getPlatformHref(platform: Platform) {
  return withBasePath(`/platforms#${getPlatformFragmentId(platform.id)}`);
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
}: PlatformCategoryBarProps) {
  if (platforms.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={`Platform coverage for ${category}`}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="shrink-0 text-sm font-semibold text-[var(--color-text-primary)]">{coverageCopy[category]}</div>
        <ul className="flex flex-1 flex-wrap gap-2">
          {platforms.map((platform) => (
            <li key={platform.id}>
              <a
                href={getPlatformHref(platform)}
                className="group inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm transition hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
              >
                <span className="shrink-0 font-medium text-[var(--color-text-primary)] transition group-hover:text-[var(--color-primary)] group-focus-visible:text-[var(--color-primary)]">
                  {platform.name}
                </span>
                <span className="truncate text-xs text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)] group-focus-visible:text-[var(--color-primary)]">
                  {getPlatformSummary(platform, category)}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
