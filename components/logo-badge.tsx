import Image from "next/image";

import { shouldShowImageLogo } from "@/lib/logo";
import { withBasePath } from "@/lib/site";
import type { LogoKind } from "@/lib/types";

type LogoBadgeProps = {
  name: string;
  logoUrl?: string;
  logoKind: LogoKind;
  size?: "sm" | "md" | "lg";
  className?: string;
  decorative?: boolean;
};

const sizeClasses = {
  sm: "h-6 w-6 rounded-md text-[10px]",
  md: "h-8 w-8 rounded-lg text-sm",
  lg: "h-10 w-10 rounded-xl text-base",
} as const;

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 40,
} as const;

export function LogoBadge({ name, logoUrl, logoKind, size = "md", className = "", decorative = false }: LogoBadgeProps) {
  if (!shouldShowImageLogo({ logoKind, logoUrl })) {
    return null;
  }

  const classes = `${sizeClasses[size]} ${className}`.trim();
  const imageLogoUrl = logoUrl!;
  const imageTitle =
    logoKind === "service-icon"
      ? `${name} service icon`
      : logoKind === "official-vendor"
        ? `${name} vendor logo`
        : `${name} logo`;

  const containerClasses =
    logoKind === "service-icon"
      ? `relative overflow-hidden border border-[color:rgba(59,130,246,0.28)] bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(219,234,254,0.7))] ${classes}`
      : `overflow-hidden border border-[var(--color-border)] bg-white ${classes}`;

  return (
    <div className={containerClasses} title={decorative ? undefined : imageTitle} aria-hidden={decorative || undefined}>
      <Image
        src={withBasePath(imageLogoUrl)}
        alt={decorative ? "" : `${name} logo`}
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
