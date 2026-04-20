import { ChevronRight } from "lucide-react";
import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

type PlatformMappedCategory = Exclude<ToolCategory, "assistants">;

type CoverageCopy = {
  heading: string;
  intro: string;
  navLabel: string;
};

const coverageCopy: Record<ToolCategory, CoverageCopy> = {
  agents: {
    heading: "Agent platform coverage",
    intro: "Cloud platforms with first-party agent platform coverage in this landscape.",
    navLabel: "Platform coverage for AI agent frameworks",
  },
  orchestration: {
    heading: "Orchestration platform coverage",
    intro: "Cloud platforms with first-party orchestration coverage in this landscape.",
    navLabel: "Platform coverage for AI orchestration",
  },
  governance: {
    heading: "Governance platform coverage",
    intro: "Cloud platforms with first-party governance coverage in this landscape.",
    navLabel: "Platform coverage for AI governance",
  },
  assistants: {
    heading: "Assistant platform coverage",
    intro: "Cloud platforms mapped across coding, productivity, and build-your-own assistants.",
    navLabel: "Platform coverage for AI assistants",
  },
};

function getAssistantContextLabels(platform: Platform) {
  return [
    { shortLabel: "Coding", detailLabel: platform.categoryMapping.assistantsCoding.label },
    { shortLabel: "Productivity", detailLabel: platform.categoryMapping.assistantsProductivity.label },
    { shortLabel: "Build your own", detailLabel: platform.categoryMapping.assistantsBuildYourOwn.label },
  ];
}

function getPlatformContextLabel(platform: Platform, category: PlatformMappedCategory) {
  return platform.categoryMapping[category].label;
}

function getPlatformHref(platform: Platform) {
  return withBasePath(`/platforms#${platform.id}`);
}

function getPlatformSummary(platform: Platform, category: ToolCategory) {
  if (category === "assistants") {
    return getAssistantContextLabels(platform)
      .map(({ shortLabel, detailLabel }) => `${shortLabel}: ${detailLabel}`)
      .join(" · ");
  }

  return getPlatformContextLabel(platform, category as PlatformMappedCategory);
}

function getAssistantDetailSummary(platform: Platform) {
  return getAssistantContextLabels(platform)
    .map(({ detailLabel }) => detailLabel)
    .join(" · ");
}

function getPlatformLinkLabel(platform: Platform, category: ToolCategory) {
  const summary = getPlatformSummary(platform, category);

  return `Open ${platform.name} platform details. ${summary}.`;
}

function getPlatformCountLabel(platformCount: number) {
  return `${platformCount} cloud platform${platformCount === 1 ? "" : "s"}`;
}

export function PlatformCategoryBar({ category, platforms }: { category: ToolCategory; platforms: Platform[] }) {
  const copy = coverageCopy[category];

  return (
    <nav
      aria-label={copy.navLabel}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">{copy.heading}</h2>
            <span className="text-xs text-[var(--color-text-secondary)]">{getPlatformCountLabel(platforms.length)}</span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)]">{copy.intro}</p>
        </div>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-3" role="list">
          {platforms.map((platform) => (
            <li key={platform.id}>
              <a
                href={getPlatformHref(platform)}
                aria-label={getPlatformLinkLabel(platform, category)}
                title={getPlatformSummary(platform, category)}
                className="group inline-flex h-full min-w-0 w-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-left transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
              >
                <span className="text-sm font-medium text-[var(--color-text-primary)] transition group-hover:text-[var(--color-primary)] group-focus-visible:text-[var(--color-primary)]">{platform.name}</span>
                {category === "assistants" ? (
                  <>
                    <span className="mt-1 flex flex-wrap gap-1 text-[11px] text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)]/80 group-focus-visible:text-[var(--color-primary)]/80">
                      {getAssistantContextLabels(platform).map(({ shortLabel, detailLabel }) => (
                        <span
                          key={shortLabel}
                          title={detailLabel}
                          className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-1.5 py-0.5 transition group-hover:border-[var(--color-primary)]/30 group-focus-visible:border-[var(--color-primary)]/30"
                        >
                          {shortLabel}
                        </span>
                      ))}
                    </span>
                    <span className="mt-2 text-[11px] leading-5 text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)]/80 group-focus-visible:text-[var(--color-primary)]/80">
                      {getAssistantDetailSummary(platform)}
                    </span>
                  </>
                ) : (
                  <span className="mt-1 text-xs text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)]/80 group-focus-visible:text-[var(--color-primary)]/80">{getPlatformContextLabel(platform, category as PlatformMappedCategory)}</span>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)] group-focus-visible:text-[var(--color-primary)]">
                  View platform details
                  <ChevronRight size={14} aria-hidden="true" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
