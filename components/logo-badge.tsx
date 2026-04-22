import Image from "next/image";

import { shouldShowImageLogo } from "@/lib/logo";
import { withBasePath } from "@/lib/site";
import type { LogoKind } from "@/lib/types";

type LogoBadgeProps = {
  logoUrl?: string;
  logoKind: LogoKind;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-6 w-6 rounded-md",
  md: "h-8 w-8 rounded-lg",
  lg: "h-10 w-10 rounded-xl",
} as const;

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 40,
} as const;

export function LogoBadge({ logoUrl, logoKind, size = "md", className = "" }: LogoBadgeProps) {
  if (!shouldShowImageLogo({ logoKind, logoUrl })) {
    return null;
  }

  const classes = `${sizeClasses[size]} ${className}`.trim();
  const imageLogoUrl = logoUrl!;

  const containerClasses =
    logoKind === "service-icon"
      ? `relative overflow-hidden border border-[color:rgba(59,130,246,0.28)] bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(219,234,254,0.7))] ${classes}`
      : `overflow-hidden border border-[var(--color-border)] bg-white ${classes}`;

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
      {logoKind === "service-icon" ? (
        <span className="absolute right-0.5 top-0.5 rounded bg-[var(--color-primary)] px-1 py-[1px] text-[8px] font-semibold uppercase tracking-[0.08em] text-white">
          svc
        </span>
      ) : null}
    </div>
  );
}
