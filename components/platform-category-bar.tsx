import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

export function PlatformCategoryBar({ category, platforms }: { category: ToolCategory; platforms: Platform[] }) {
  const categoryLabel = category === "assistants" ? "assistant tooling" : category;

  return (
    <nav
      aria-label="Platform coverage"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">Platforms</div>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Compare the cloud foundation layer behind this {categoryLabel} view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={withBasePath("/platforms")}
              className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {platform.name}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
