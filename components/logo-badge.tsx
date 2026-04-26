import Image from "next/image";

import { shouldShowImageLogo } from "@/lib/logo";
import { withBasePath } from "@/lib/site";
import type { LogoKind } from "@/lib/types";

type LogoBadgeProps = {
  label: string;
  logoUrl?: string;
  logoKind: LogoKind;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-6 w-6 rounded-md text-[10px]",
  md: "h-8 w-8 rounded-lg text-[11px]",
  lg: "h-10 w-10 rounded-xl text-xs",
} as const;

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 40,
} as const;

const baseContainerClasses = "overflow-hidden border";

const containerClassesByKind = {
  "service-icon": "border-[color:rgba(59,130,246,0.28)] bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(219,234,254,0.7))]",
  default: "border-[var(--color-border)] bg-white",
  fallback:
    "border-[var(--color-border)] bg-[linear-gradient(180deg,var(--color-bg-surface),var(--color-bg-card))] text-[var(--color-text-primary)]",
} as const;

function getFallbackMonogram(label: string) {
  const meaningfulParts = label
    .trim()
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z0-9]/g, ""))
    .filter(Boolean)
    .filter((part) => !new Set(["ai", "the", "and", "for", "of", "to", "by"]).has(part.toLowerCase()));

  const parts = meaningfulParts.length > 0 ? meaningfulParts : [label.replace(/[^A-Za-z0-9]/g, "").slice(0, 2)];
  const monogram = parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return monogram || "AI";
}

export function LogoBadge({ label, logoUrl, logoKind, size = "md", className = "" }: LogoBadgeProps) {
  const classes = `${sizeClasses[size]} ${className}`.trim();

  if (!shouldShowImageLogo({ logoKind, logoUrl })) {
    return (
      <div
        className={`${baseContainerClasses} ${containerClassesByKind.fallback} ${classes} inline-flex items-center justify-center font-semibold tracking-[0.08em]`}
        aria-hidden="true"
        title={`${label} fallback badge`}
      >
        {getFallbackMonogram(label)}
      </div>
    );
  }

  const imageLogoUrl = logoUrl!;
  const containerClasses = `${baseContainerClasses} ${logoKind === "service-icon" ? containerClassesByKind["service-icon"] : containerClassesByKind.default} ${classes}`;

  return (
    <div className={containerClasses} aria-hidden="true">
      <Image
        src={withBasePath(imageLogoUrl)}
        alt=""
        width={imageSizes[size]}
        height={imageSizes[size]}
        loading="lazy"
        className="h-full w-full object-contain p-0.5"
      />
    </div>
  );
}
