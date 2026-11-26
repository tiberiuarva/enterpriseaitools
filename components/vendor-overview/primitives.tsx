import type { ReactNode } from "react";
import type { VendorEntryStatus } from "@/lib/types";
import { ENTRY_STATUS_LABELS, ENTRY_STATUS_TONE } from "@/lib/vendor-overview";

export function OverviewSection({
  id,
  eyebrow,
  title,
  intro,
  aside,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="card-flat scroll-mt-[calc(var(--site-header-height)+4rem)] p-5 sm:p-6 md:p-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? <p className="text-caption uppercase tracking-[0.16em] text-[var(--color-text-tertiary)]">{eyebrow}</p> : null}
          <h2 id={`${id}-heading`} className="mt-1 text-h2 text-[var(--color-text-primary)]">
            {title}
          </h2>
          {intro ? <p className="mt-2 text-body-sm text-[var(--color-text-secondary)]">{intro}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      <div className="mt-5 md:mt-6">{children}</div>
    </section>
  );
}

export function StatusBadge({ status }: { status: VendorEntryStatus }) {
  return <span className={`badge-dot badge-dot-${ENTRY_STATUS_TONE[status]} whitespace-nowrap`}>{ENTRY_STATUS_LABELS[status]}</span>;
}

// External citation. Opens in a new tab like every source link on the site.
export function SourceLink({ href, label = "Source", className = "" }: { href: string; label?: string; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={className ? `source-link ${className}` : "source-link"}>
      {label}
    </a>
  );
}

export function Chip({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "accent" | "warning" }) {
  const toneClass =
    tone === "accent"
      ? "border-[var(--color-accent-soft)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
      : tone === "warning"
        ? "border-[var(--color-warning-soft)] bg-[var(--color-warning-soft)] text-[var(--color-warning)]"
        : "";
  return <span className={`chip ${toneClass}`}>{children}</span>;
}
