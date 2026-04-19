import Image from "next/image";

import { withBasePath } from "@/lib/site";
import type { LogoKind } from "@/lib/types";

type LogoBadgeProps = {
  name: string;
  logoUrl?: string;
  logoKind: LogoKind;
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

// Keep this list deliberately short and ASCII-only. It exists to trim obvious filler words,
// not to normalize brand semantics across languages or strip tokens like "AI".
const monogramStopwords = new Set(["the", "and", "for"]);
const imageKinds = new Set<LogoKind>(["official-product", "official-vendor", "service-icon", "project-logo"]);

function splitNameTokens(name: string) {
  return name.match(/[\p{L}\p{N}]+/gu) ?? [];
}

function buildMonogram(name: string) {
  const rawTokens = splitNameTokens(name)
    .map((token) => token.trim())
    .filter(Boolean);

  const tokens = rawTokens.filter((token) => !monogramStopwords.has(token.toLowerCase()));

  if (tokens.length === 0) {
    const firstCharacter = name.trim().match(/[\p{L}\p{N}]/u)?.[0];

    return firstCharacter ? firstCharacter.toUpperCase() : "?";
  }

  if (tokens.length === 1) {
    return Array.from(tokens[0]).slice(0, 2).join("").toUpperCase();
  }

  return tokens
    .slice(0, 2)
    .map((token) => Array.from(token)[0]?.toUpperCase() ?? "")
    .join("");
}

export function LogoBadge({ name, logoUrl, logoKind, size = "md", className = "" }: LogoBadgeProps) {
  const classes = `${sizeClasses[size]} ${className}`.trim();
  const monogram = buildMonogram(name);
  const imageLogoUrl = logoUrl && imageKinds.has(logoKind) ? logoUrl : undefined;
  const imageTitle =
    logoKind === "service-icon"
      ? `${name} service icon`
      : logoKind === "official-vendor"
        ? `${name} vendor logo`
        : `${name} logo`;

  if (imageLogoUrl) {
    const containerClasses =
      logoKind === "service-icon"
        ? `relative overflow-hidden border border-[color:rgba(59,130,246,0.28)] bg-[linear-gradient(180deg,rgba(239,246,255,0.95),rgba(219,234,254,0.7))] ${classes}`
        : `overflow-hidden border border-[var(--color-border)] bg-white ${classes}`;

    return (
      <div className={containerClasses} title={imageTitle}>
        <Image
          src={withBasePath(imageLogoUrl)}
          alt={imageTitle}
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

  return (
    <div
      className={`flex items-center justify-center border border-[color:rgba(59,130,246,0.18)] bg-[linear-gradient(180deg,rgba(59,130,246,0.10),rgba(59,130,246,0.18))] font-semibold tracking-[0.08em] text-[var(--color-primary)] ${classes}`}
      role="img"
      aria-label={`${name} fallback monogram`}
      title={`${name} reviewed fallback monogram`}
    >
      <span aria-hidden="true">{monogram}</span>
    </div>
  );
}
