import type { LucideIcon } from "lucide-react";
import { withBasePath } from "@/lib/site";

import type { Tool } from "@/lib/types";

type CategoryPreviewTool = Pick<Tool, "id" | "name">;

type CategoryCardProps = {
  href: string;
  icon: LucideIcon;
  name: string;
  description: string;
  count: number;
  previewTools: CategoryPreviewTool[];
};

const PREVIEW_LIMIT = 4;

export function CategoryCard({ href, icon: Icon, name, description, count, previewTools }: CategoryCardProps) {
  const visible = previewTools.slice(0, PREVIEW_LIMIT);
  const overflow = previewTools.length - visible.length;

  return (
    <a
      href={withBasePath(href)}
      className="card card-hover group block p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Icon
            size={20}
            aria-hidden="true"
            className="mt-1 shrink-0 text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-text-primary)]"
          />
          <div>
            <h3 className="text-h3 text-[var(--color-text-primary)]">{name}</h3>
            <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">{description}</p>
          </div>
        </div>
        <span className="shrink-0 text-caption text-[var(--color-text-tertiary)]">{count}</span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" aria-hidden="true">
        {visible.map((tool) => (
          <span
            key={tool.id}
            className="inline-flex items-center rounded-xs bg-[var(--color-bg-surface)] px-2.5 py-1 text-caption text-[var(--color-text-secondary)]"
          >
            {tool.name}
          </span>
        ))}
        {overflow > 0 ? (
          <span className="inline-flex items-center px-1 py-1 text-caption text-[var(--color-text-tertiary)]">
            +{overflow} more
          </span>
        ) : null}
      </div>

      <div className="mt-5 text-body-sm font-medium text-[var(--color-accent)]">View all →</div>
    </a>
  );
}
