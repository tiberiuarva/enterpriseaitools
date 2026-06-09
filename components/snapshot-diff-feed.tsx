import type { SnapshotDiffEvent } from "@/lib/types";
import { withBasePath } from "@/lib/site";

const FIELD_LABELS: Record<string, string> = {
  license: "License",
  version: "Version",
  lastRelease: "Last release",
  status: "Status",
  githubStars: "GitHub stars",
  tracked: "Tracking",
  "governance.dataResidency": "Data residency",
  "governance.deployment": "Deployment",
  "governance.auditLogging": "Audit logging",
  "governance.soc2": "SOC 2",
  "governance.iso27001": "ISO 27001",
  "governance.iso42001": "ISO 42001",
  "governance.euAiAct.role": "EU AI Act role",
  "governance.licenseRisk.level": "License risk",
};

function formatFieldLabel(field: string) {
  return FIELD_LABELS[field] ?? field;
}

function formatValue(value: unknown) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function SnapshotDiffFeed({
  events,
  snapshotCount,
}: {
  events: SnapshotDiffEvent[];
  snapshotCount: number;
}) {
  if (snapshotCount < 2) {
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Auto-detected changes</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Snapshot-derived change events appear here once two or more weekly snapshots exist.
          Current snapshot count: {snapshotCount}.
        </p>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Auto-detected changes</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          No drift detected across the {snapshotCount} tracked weekly snapshots — every tool kept the same license,
          version, status, and governance posture between adjacent runs.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Auto-detected changes</h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Derived automatically by diffing successive weekly snapshots ({snapshotCount} tracked).
        Newest first.
      </p>
      <ol className="mt-4 flex flex-col gap-3">
        {events.map((event, index) => (
          <li
            key={`${event.toolId}-${event.from}-${event.to}-${event.field}-${index}`}
            className={`border-l-2 pl-4 ${event.highImpact ? "border-[var(--color-warning)]" : "border-[var(--color-border)]"}`}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
              <span>{event.to}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold uppercase tracking-wide">Auto-detected</span>
              {event.highImpact ? (
                <span className="rounded-full bg-[color:var(--color-warning-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[color:var(--color-warning)]">
                  High impact
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-sm text-[var(--color-text-primary)]">
              <a
                href={withBasePath(`/tools/${event.toolId}`)}
                className="font-semibold text-[var(--color-primary)] hover:underline"
              >
                {event.toolName}
              </a>{" "}
              · <span className="font-medium">{formatFieldLabel(event.field)}</span>: {formatValue(event.previous)} →{" "}
              {formatValue(event.current)}
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              From snapshot diff {event.from} → {event.to}.
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
