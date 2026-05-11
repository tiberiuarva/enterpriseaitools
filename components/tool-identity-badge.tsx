import { Boxes } from "lucide-react";

type ToolIdentityBadgeProps = {
  size?: "sm" | "md";
  className?: string;
};

const sizeClasses = {
  sm: "h-6 w-6 rounded-md",
  md: "h-8 w-8 rounded-lg",
} as const;

const iconSize = {
  sm: 13,
  md: 16,
} as const;

export function ToolIdentityBadge({ size = "md", className = "" }: ToolIdentityBadgeProps) {
  return (
    <div
      aria-hidden="true"
      className={`${sizeClasses[size]} inline-flex items-center justify-center border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] ${className}`.trim()}
    >
      <Boxes size={iconSize[size]} strokeWidth={2} />
    </div>
  );
}
