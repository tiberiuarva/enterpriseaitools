import { AlertTriangle, Info, OctagonAlert } from "lucide-react";
import { useId, type ReactNode } from "react";

type WarningVariant = "warning" | "deprecated" | "info";

type WarningBoxProps = {
  variant?: WarningVariant;
  title?: string;
  children: ReactNode;
};

const styles: Record<WarningVariant, { icon: typeof AlertTriangle; border: string; bg: string; text: string; defaultTitle: string }> = {
  warning: {
    icon: AlertTriangle,
    border: "border-[var(--color-warning)]",
    bg: "bg-[color:var(--color-warning-soft)]",
    text: "text-[var(--color-warning)]",
    defaultTitle: "Warning",
  },
  deprecated: {
    icon: OctagonAlert,
    border: "border-[var(--color-danger)]",
    bg: "bg-[color:var(--color-danger-soft)]",
    text: "text-[var(--color-danger)]",
    defaultTitle: "Deprecated",
  },
  info: {
    icon: Info,
    border: "border-[var(--color-accent)]",
    bg: "bg-[color:var(--color-accent-soft)]",
    text: "text-[var(--color-accent)]",
    defaultTitle: "Info",
  },
};

export function WarningBox({ variant = "warning", title, children }: WarningBoxProps) {
  const style = styles[variant];
  const Icon = style.icon;
  const headingId = useId();

  return (
    <section
      role="note"
      aria-labelledby={headingId}
      className={`rounded-xl border-l-4 ${style.border} ${style.bg} p-4`}
    >
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className={style.text} size={18} />
        <div>
          <h3 id={headingId} className={`text-sm font-semibold uppercase tracking-wide ${style.text}`}>
            {title ?? style.defaultTitle}
          </h3>
          <div className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{children}</div>
        </div>
      </div>
    </section>
  );
}
