import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

type HeadingLevel = 2 | 3;

type PlatformCategoryBarProps = {
  category: ToolCategory;
  platforms: Platform[];
  headingLevel: HeadingLevel;
};

const coverageLabel = "Cloud platforms";

function getPlatformHref(platform: Platform) {
  return withBasePath(`/platforms#${getPlatformFragmentId(platform.id)}`);
}

function getCategorySummary(category: ToolCategory) {
  if (category === "assistants") {
    return "See coding, productivity, and build-your-own mappings on the platforms page.";
  }

  return "Jump to the platform layer for the native cloud offering behind this category.";
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
      <div className="flex flex-col gap-3">
        <div>
          <div className="text-sm font-semibold text-[var(--color-text-primary)]">{coverageLabel}</div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{getCategorySummary(category)}</p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <li key={platform.id}>
              <a
                href={getPlatformHref(platform)}
                className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
              >
                {platform.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
