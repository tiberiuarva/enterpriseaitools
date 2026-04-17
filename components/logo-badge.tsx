import Image from "next/image";

import { withBasePath } from "@/lib/site";

type LogoBadgeProps = {
  name: string;
  logoUrl?: string;
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

export function LogoBadge({ name, logoUrl, size = "md", className = "" }: LogoBadgeProps) {
  const classes = `${sizeClasses[size]} ${className}`.trim();

  if (logoUrl) {
    return (
      <div className={`overflow-hidden border border-[var(--color-border)] bg-white ${classes}`}>
        <Image
          src={withBasePath(logoUrl)}
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
      className={`flex items-center justify-center bg-[color:rgba(59,130,246,0.12)] font-semibold text-[var(--color-primary)] ${classes}`}
      aria-label={`${name} fallback avatar`}
    >
      {name.charAt(0)}
    </div>
  );
}
