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

export function LogoBadge({ name, logoUrl, size = "md", className = "" }: LogoBadgeProps) {
  const classes = `${sizeClasses[size]} ${className}`.trim();

  if (logoUrl) {
    return (
      <div className={`overflow-hidden border border-[var(--color-border)] bg-white ${classes}`}>
        <img
          src={withBasePath(logoUrl)}
          alt={`${name} logo`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
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
