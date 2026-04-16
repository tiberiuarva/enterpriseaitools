import type { LucideIcon } from "lucide-react";

type StatPillProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  highlighted?: boolean;
};

export function StatPill({ icon: Icon, label, value, highlighted = false }: StatPillProps) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm ${
        highlighted
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
          : "border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)]"
      }`}
    >
      <Icon size={16} />
      <span className="text-xs uppercase tracking-wide opacity-80">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
