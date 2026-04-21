import { Boxes, BriefcaseBusiness, Building2, type LucideIcon } from "lucide-react";

import type { ToolType } from "@/lib/types";

const toolTypeTextClasses: Record<ToolType, string> = {
  vendor: "text-[var(--color-primary)]",
  opensource: "text-[var(--color-success)]",
  commercial: "text-[var(--color-secondary)]",
};

export const toolTypeBadgeStyles: Record<ToolType, string> = {
  vendor: `bg-[color:rgba(59,130,246,0.14)] ${toolTypeTextClasses.vendor}`,
  opensource: `bg-[color:rgba(16,185,129,0.14)] ${toolTypeTextClasses.opensource}`,
  commercial: `bg-[color:rgba(6,182,212,0.14)] ${toolTypeTextClasses.commercial}`,
};

export const toolTypeIconWrapStyles: Record<ToolType, string> = {
  vendor: `bg-[color:rgba(59,130,246,0.12)] ${toolTypeTextClasses.vendor}`,
  opensource: `bg-[color:rgba(16,185,129,0.12)] ${toolTypeTextClasses.opensource}`,
  commercial: `bg-[color:rgba(6,182,212,0.12)] ${toolTypeTextClasses.commercial}`,
};

export const toolTypeIcons: Record<ToolType, LucideIcon> = {
  vendor: Building2,
  opensource: Boxes,
  commercial: BriefcaseBusiness,
};

export function formatToolTypeLabel(type: ToolType) {
  if (type === "opensource") return "Open Source";
  if (type === "vendor") return "Vendor";
  return "Commercial";
}
