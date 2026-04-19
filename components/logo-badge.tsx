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

function buildMonogram(name: string) {
  const rawTokens = name
    .split(/[^A-Za-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  const tokens = rawTokens.filter((token, index) => {
    const lower = token.toLowerCase();

    if (["the", "and", "for"].includes(lower)) {
      return false;
    }

    if (lower === "ai" && rawTokens.length > 2 && index !== 0) {
      return false;
    }

    return true;
  });

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
  // Keep rendering audited non-fallback assets, but default unclassified legacy records to images until they are reviewed.
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
      aria-label={`${name} fallback monogram`}
    >
      {monogram}
    </div>
  );
}
