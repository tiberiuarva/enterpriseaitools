import { Boxes, BriefcaseBusiness, Building2, type LucideIcon } from "lucide-react";

import type { ToolType } from "@/lib/types";

const toolTypeTokens: Record<ToolType, { textClass: string; badgeClass: string; iconWrapClass: string }> = {
  vendor: {
    textClass: "text-[var(--color-primary)]",
    badgeClass: "bg-[color:rgba(59,130,246,0.14)]",
    iconWrapClass: "bg-[color:rgba(59,130,246,0.12)]",
  },
  opensource: {
    textClass: "text-[var(--color-success)]",
    badgeClass: "bg-[color:rgba(16,185,129,0.14)]",
    iconWrapClass: "bg-[color:rgba(16,185,129,0.12)]",
  },
  commercial: {
    textClass: "text-[var(--color-secondary)]",
    badgeClass: "bg-[color:rgba(6,182,212,0.14)]",
    iconWrapClass: "bg-[color:rgba(6,182,212,0.12)]",
  },
};

export const toolTypeBadgeStyles: Record<ToolType, string> = {
  vendor: `${toolTypeTokens.vendor.badgeClass} ${toolTypeTokens.vendor.textClass}`,
  opensource: `${toolTypeTokens.opensource.badgeClass} ${toolTypeTokens.opensource.textClass}`,
  commercial: `${toolTypeTokens.commercial.badgeClass} ${toolTypeTokens.commercial.textClass}`,
};

export const toolTypeIconWrapStyles: Record<ToolType, string> = {
  vendor: `${toolTypeTokens.vendor.iconWrapClass} ${toolTypeTokens.vendor.textClass}`,
  opensource: `${toolTypeTokens.opensource.iconWrapClass} ${toolTypeTokens.opensource.textClass}`,
  commercial: `${toolTypeTokens.commercial.iconWrapClass} ${toolTypeTokens.commercial.textClass}`,
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
