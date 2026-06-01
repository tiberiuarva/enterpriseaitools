import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

type PlatformCategoryBarProps = {
  category: ToolCategory;
  platforms: Platform[];
};

function getPlatformHref(platform: Platform) {
  return withBasePath(`/platforms#${getPlatformFragmentId(platform.id)}`);
}

function getBarLabel(category: ToolCategory) {
  if (category === "assistants") {
    return "Cloud platforms";
  }

  return "Cloud platforms in this category";
}

export function PlatformCategoryBar({ category, platforms }: PlatformCategoryBarProps) {
  if (platforms.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={`Platform coverage for ${category}`}
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 text-sm font-semibold text-[var(--color-text-primary)]">{getBarLabel(category)}:</div>
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
