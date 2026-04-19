import { Boxes, BriefcaseBusiness, Building2, type LucideIcon } from "lucide-react";
import { withBasePath } from "@/lib/site";

import type { Tool } from "@/lib/types";

type CategoryPreviewTool = Pick<Tool, "id" | "name" | "type">;

type CategoryCardProps = {
  href: string;
  icon: LucideIcon;
  name: string;
  description: string;
  count: number;
  previewTools: CategoryPreviewTool[];
};

const previewToolIconWrapStyles: Record<Tool["type"], string> = {
  vendor: "bg-[color:rgba(59,130,246,0.12)] text-[var(--color-primary)]",
  opensource: "bg-[color:rgba(16,185,129,0.12)] text-[var(--color-success)]",
  commercial: "bg-[color:rgba(6,182,212,0.12)] text-[var(--color-secondary)]",
};

const previewToolIcons = {
  vendor: Building2,
  opensource: Boxes,
  commercial: BriefcaseBusiness,
} as const;

function formatTypeLabel(type: Tool["type"]) {
  if (type === "opensource") return "Open source";
  if (type === "vendor") return "Vendor";
  return "Commercial";
}

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

      <div className="mt-4 flex flex-wrap gap-2">
        {previewTools.map((tool) => {
          const PreviewToolIcon = previewToolIcons[tool.type];

          return (
            <span
              key={tool.id}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-1 text-xs text-[var(--color-text-secondary)]"
              aria-label={`${tool.name} · ${formatTypeLabel(tool.type)}`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${previewToolIconWrapStyles[tool.type]}`}
                aria-hidden="true"
              >
                <PreviewToolIcon size={11} />
              </span>
              <span className="text-[var(--color-text-primary)]">{tool.name}</span>
              <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">•</span>
              <span className="uppercase tracking-[0.08em] text-[10px] font-semibold">{formatTypeLabel(tool.type)}</span>
            </span>
          );
        })}
      </div>

      <div className="mt-5 text-sm font-medium text-[var(--color-primary)]">View all →</div>
    </a>
  );
}
