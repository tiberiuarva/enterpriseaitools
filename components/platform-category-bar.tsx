import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

const CATEGORY_CONTEXT_LABELS: Record<ToolCategory, string> = {
  agents: "agent frameworks",
  orchestration: "orchestration stacks",
  governance: "governance tooling",
  assistants: "assistant tooling",
};

function getPlatformContextLabel(platform: Platform, category: ToolCategory) {
  if (category === "assistants") {
    return "Coding · productivity · build-your-own";
  }

  return platform.categoryMapping[category].label;
}

function getPlatformHref(platform: Platform) {
  return withBasePath(`/platforms#${platform.id}`);
}

export function PlatformCategoryBar({ category, platforms }: { category: ToolCategory; platforms: Platform[] }) {
  const categoryLabel = CATEGORY_CONTEXT_LABELS[category];

  return (
    <nav
      aria-label="Platform coverage"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">Platforms</div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Compare cloud platforms covering this {categoryLabel} view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={getPlatformHref(platform)}
              className="inline-flex min-w-0 flex-1 basis-56 flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-left transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] md:min-w-[12rem] md:flex-none"
            >
              <span className="text-sm font-medium text-[var(--color-text-primary)]">{platform.name}</span>
              <span className="mt-1 text-xs text-[var(--color-text-secondary)]">{getPlatformContextLabel(platform, category)}</span>
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
