import { Boxes, BriefcaseBusiness, Building2, type LucideIcon } from "lucide-react";

import type { ToolType } from "@/lib/types";

const toolTypeTokens: Record<ToolType, { textClass: string; tintClass: string }> = {
  vendor: {
    textClass: "text-[var(--color-primary)]",
    tintClass: "bg-[color:rgba(59,130,246,0.14)]",
  },
  opensource: {
    textClass: "text-[var(--color-success)]",
    tintClass: "bg-[color:rgba(16,185,129,0.14)]",
  },
  commercial: {
    textClass: "text-[var(--color-secondary)]",
    tintClass: "bg-[color:rgba(6,182,212,0.14)]",
  },
};

export const toolTypeTintStyles: Record<ToolType, string> = {
  vendor: `${toolTypeTokens.vendor.tintClass} ${toolTypeTokens.vendor.textClass}`,
  opensource: `${toolTypeTokens.opensource.tintClass} ${toolTypeTokens.opensource.textClass}`,
  commercial: `${toolTypeTokens.commercial.tintClass} ${toolTypeTokens.commercial.textClass}`,
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
