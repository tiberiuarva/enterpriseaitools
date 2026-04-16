import { withBasePath } from "@/lib/site";
import type { Platform, ToolCategory } from "@/lib/types";

function getLabel(platform: Platform, category: ToolCategory) {
  if (category === "assistants") {
    return platform.categoryMapping.assistantsBuildYourOwn.label;
  }

  return platform.categoryMapping[category].label;
}

export function PlatformCategoryBar({ category, platforms }: { category: ToolCategory; platforms: Platform[] }) {
  return (
    <nav
      aria-label="Platform coverage"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-sm text-[var(--color-text-secondary)]"
    >
      <span className="font-medium text-[var(--color-text-primary)]">Runs on:</span>{" "}
      {platforms.map((platform, index) => (
        <span key={platform.id}>
          <a href={withBasePath("/platforms")} className="text-[var(--color-primary)] hover:underline">
            {platform.name}
          </a>
          <span className="text-[var(--color-text-secondary)]"> ({getLabel(platform, category)})</span>
          {index < platforms.length - 1 ? " | " : ""}
        </span>
      ))}
    </nav>
  );
}
