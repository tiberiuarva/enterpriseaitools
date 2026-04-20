import { Boxes, BriefcaseBusiness, Building2 } from "lucide-react";

import type { ToolType } from "@/lib/types";

export const toolTypeBadgeStyles: Record<ToolType, string> = {
  vendor: "bg-[color:rgba(59,130,246,0.14)] text-[var(--color-primary)]",
  opensource: "bg-[color:rgba(16,185,129,0.14)] text-[var(--color-success)]",
  commercial: "bg-[color:rgba(6,182,212,0.14)] text-[var(--color-secondary)]",
};

export const toolTypeIconWrapStyles: Record<ToolType, string> = {
  vendor: "bg-[color:rgba(59,130,246,0.12)] text-[var(--color-primary)]",
  opensource: "bg-[color:rgba(16,185,129,0.12)] text-[var(--color-success)]",
  commercial: "bg-[color:rgba(6,182,212,0.12)] text-[var(--color-secondary)]",
};

export const toolTypeIcons: Record<ToolType, typeof Building2> = {
  vendor: Building2,
  opensource: Boxes,
  commercial: BriefcaseBusiness,
};

export function formatToolTypeLabel(type: ToolType) {
  if (type === "opensource") return "Open Source";
  if (type === "vendor") return "Vendor";
  return "Commercial";
}
