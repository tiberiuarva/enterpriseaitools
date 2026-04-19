import Image from "next/image";

import { withBasePath } from "@/lib/site";
import type { LogoKind } from "@/lib/types";

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

const monogramStopwords = new Set(["the", "and", "for"]);

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
  // Keep rendering audited non-fallback assets, but intentionally let legacy records with undefined logoKind
  // keep using their current image until each entry is reviewed and explicitly classified.
  const imageLogoUrl = logoUrl && logoKind !== "fallback" ? logoUrl : undefined;

  if (imageLogoUrl) {
    return (
      <div className={`overflow-hidden border border-[var(--color-border)] bg-white ${classes}`}>
        <Image
          src={withBasePath(imageLogoUrl)}
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
      role="img"
      aria-label={`${name} monogram`}
    >
      <span aria-hidden="true">{monogram}</span>
    </div>
  );
}
