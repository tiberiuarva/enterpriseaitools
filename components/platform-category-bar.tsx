import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

type PlatformMappedCategory = Exclude<ToolCategory, "assistants">;

function getAssistantContextLabels(platform: Platform) {
  return [
    platform.categoryMapping.assistantsCoding.label,
    platform.categoryMapping.assistantsProductivity.label,
    platform.categoryMapping.assistantsBuildYourOwn.label,
  ];
}

function getPlatformContextLabel(platform: Platform, category: PlatformMappedCategory) {
  return platform.categoryMapping[category].label;
}

function getPlatformHref(platform: Platform) {
  return withBasePath(`/platforms#${platform.id}`);
}

function getPlatformLinkLabel(platform: Platform) {
  return `Open ${platform.name} platform details`;
}

export function PlatformCategoryBar({ category, platforms }: { category: ToolCategory; platforms: Platform[] }) {
  return (
    <nav
      aria-label="Platform coverage"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--color-text-secondary)]">Cloud platforms covering this category.</p>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-3" role="list">
          {platforms.map((platform) => (
            <li key={platform.id}>
              <a
                href={getPlatformHref(platform)}
                aria-label={getPlatformLinkLabel(platform)}
                className="group inline-flex h-full min-w-0 w-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-left transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <span className="text-sm font-medium text-[var(--color-text-primary)] transition group-hover:text-[var(--color-primary)]">{platform.name}</span>
                {category === "assistants" ? (
                  <span className="mt-1 flex flex-wrap gap-1 text-[11px] text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)]/80">
                    {getAssistantContextLabels(platform).map((label) => (
                      <span
                        key={label}
                        className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-1.5 py-0.5 transition group-hover:border-[var(--color-primary)]/30"
                      >
                        {label}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="mt-1 text-xs text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)]/80">{getPlatformContextLabel(platform, category as PlatformMappedCategory)}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
