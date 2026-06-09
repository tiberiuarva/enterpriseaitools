import { Boxes } from "lucide-react";

import { LogoBadge } from "@/components/logo-badge";
import { shouldShowImageLogo } from "@/lib/logo";
import type { LogoKind } from "@/lib/types";

type ToolIdentityBadgeProps = {
  label: string;
  logoUrl?: string;
  logoKind: LogoKind;
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-6 w-6 rounded-md",
  md: "h-8 w-8 rounded-lg",
} as const;

const iconSize = {
  sm: 13,
  md: 16,
} as const;

export function ToolIdentityBadge({ label, logoUrl, logoKind, size = "md", className = "" }: ToolIdentityBadgeProps) {
  if (shouldShowImageLogo({ logoKind, logoUrl })) {
    return <LogoBadge label={label} logoUrl={logoUrl} logoKind={logoKind} size={size} className={className} />;
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizeClasses[size]} inline-flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] ${className}`.trim()}
    >
      <Boxes size={iconSize[size]} strokeWidth={2} />
    </div>
  );
}
