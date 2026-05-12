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
  emphasize?: boolean;
};

const sizeClasses = {
  sm: "h-6 w-6 rounded-md text-[10px]",
  md: "h-8 w-8 rounded-lg text-[11px]",
  lg: "h-10 w-10 rounded-xl text-xs",
} as const;

const subtleSizeClasses = {
  sm: "h-5 w-5 rounded-md text-[9px]",
  md: "h-6 w-6 rounded-md text-[10px]",
  lg: "h-8 w-8 rounded-lg text-[11px]",
} as const;

const projectLogoSizeClasses = {
  sm: "h-6 w-14 rounded-md px-1",
  md: "h-9 w-20 rounded-lg px-1.5",
  lg: "h-10 w-24 rounded-xl px-2",
} as const;

const subtleProjectLogoSizeClasses = {
  sm: "h-5 w-10 rounded-md px-1",
  md: "h-6 w-14 rounded-md px-1",
  lg: "h-8 w-[4.5rem] rounded-lg px-1.5",
} as const;

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 40,
} as const;

const projectLogoImageSizes = {
  sm: { width: 56, height: 24 },
  md: { width: 80, height: 36 },
  lg: { width: 96, height: 40 },
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

export function LogoBadge({ label, logoUrl, logoKind, size = "md", className = "", emphasize = true }: LogoBadgeProps) {
  const isProjectLogo = logoKind === "project-logo";
  const dimensionMap = isProjectLogo
    ? { emphasize: projectLogoSizeClasses, subtle: subtleProjectLogoSizeClasses }
    : { emphasize: sizeClasses, subtle: subtleSizeClasses };
  const dimensionClasses = dimensionMap[emphasize ? "emphasize" : "subtle"][size];
  const classes = `${dimensionClasses} ${className}`.trim();

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
  const imageDimensions = isProjectLogo
    ? projectLogoImageSizes[size]
    : { width: imageSizes[size], height: imageSizes[size] };

  return (
    <div className={containerClasses} aria-hidden="true">
      <Image
        src={withBasePath(imageLogoUrl)}
        alt=""
        width={imageDimensions.width}
        height={imageDimensions.height}
        loading="lazy"
        className={`h-full w-full object-contain ${isProjectLogo ? "p-1" : "p-0.5"}`}
      />
    </div>
  );
}
