import type { LucideIcon } from "lucide-react";
import { LogoBadge } from "@/components/logo-badge";
import { withBasePath } from "@/lib/site";

import type { Tool } from "@/lib/types";

type CategoryPreviewTool = Pick<Tool, "id" | "name" | "logoUrl" | "logoKind">;

type CategoryCardProps = {
  href: string;
  icon: LucideIcon;
  name: string;
  description: string;
  count: number;
  previewTools: CategoryPreviewTool[];
};

export function CategoryCard({ href, icon: Icon, name, description, count, previewTools }: CategoryCardProps) {
  return (
    <a
      href={withBasePath(href)}
      className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 transition hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-surface)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[color:rgba(59,130,246,0.12)] p-3 text-[var(--color-primary)]">
            <Icon size={24} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{name}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{description}</p>
          </div>
        </div>
        <div className="rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-semibold text-[var(--color-text-primary)]">
          {count}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" aria-hidden="true">
        {previewTools.map((tool) => {
          return (
            <span
              key={tool.id}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
            >
              <LogoBadge label={tool.name} logoUrl={tool.logoUrl} logoKind={tool.logoKind} size="sm" />
              <span>{tool.name}</span>
            </span>
          );
        })}
      </div>

      <div className="mt-5 text-sm font-medium text-[var(--color-primary)]">View all →</div>
    </a>
  );
}
