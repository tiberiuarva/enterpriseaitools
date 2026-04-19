import Image from "next/image";

import { withBasePath } from "@/lib/site";
import type { Platform, Tool } from "@/lib/types";

type LogoKind = NonNullable<Tool["logoKind"] | Platform["logoKind"]>;

type LogoBadgeProps = {
  name: string;
  logoUrl?: string;
  logoKind?: LogoKind;
  size?: "sm" | "md" | "lg";
  className?: string;
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

function buildMonogram(name: string) {
  const tokens = name
    .split(/[^A-Za-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !["ai", "the", "and", "for"].includes(token.toLowerCase()));

  if (tokens.length === 0) return "?";
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();

  return tokens
    .slice(0, 2)
    .map((token) => token.charAt(0).toUpperCase())
    .join("");
}

export function LogoBadge({ name, logoUrl, logoKind, size = "md", className = "" }: LogoBadgeProps) {
  const classes = `${sizeClasses[size]} ${className}`.trim();
  const monogram = buildMonogram(name);
  const shouldRenderImage = Boolean(logoUrl && logoKind !== "fallback");

  if (shouldRenderImage) {
    return (
      <div className={`overflow-hidden border border-[var(--color-border)] bg-white ${classes}`}>
        <Image
          src={withBasePath(logoUrl!)}
          alt={`${name} logo`}
          width={imageSizes[size]}
          height={imageSizes[size]}
          loading="lazy"
          className="h-full w-full object-contain p-0.5"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center border border-[color:rgba(59,130,246,0.18)] bg-[linear-gradient(180deg,rgba(59,130,246,0.10),rgba(59,130,246,0.18))] font-semibold tracking-[0.08em] text-[var(--color-primary)] ${classes}`}
      aria-label={`${name} fallback monogram`}
      title={logoKind === "fallback" ? `${name} uses a reviewed fallback badge` : `${name} monogram`}
    >
      {monogram}
    </div>
  );
}
