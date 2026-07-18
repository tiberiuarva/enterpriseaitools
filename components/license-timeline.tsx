import { ExternalLink } from "lucide-react";
import type { LicenseHistoryEvent } from "@/lib/types";

export function LicenseTimeline({
  history,
  toolName,
  licenseWarning,
}: {
  history: LicenseHistoryEvent[];
  toolName: string;
  licenseWarning?: string;
}) {
  const newestFirst = [...history].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="card-flat p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">License history</h2>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
        Verified license transitions for {toolName}, newest first. Relicensing is tracked as a first-class procurement
        risk — see the license-change feed for all tracked tools.
      </p>
      {licenseWarning ? (
        <p className="mt-3 rounded-lg border border-[var(--color-warning)] bg-[color:var(--color-warning-soft)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
          {licenseWarning}
        </p>
      ) : null}
      <ol className="mt-4 flex flex-col gap-3">
        {newestFirst.map((event) => {
          const restrictive = event.direction === "restrictive";
          return (
            <li
              key={`${event.date}-${event.toLicense}`}
              className={`border-l-2 pl-4 ${restrictive ? "border-[var(--color-warning)]" : "border-[var(--color-success)]"}`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                <time dateTime={event.date} className="font-semibold text-[var(--color-text-primary)]">
                  {event.date}
                </time>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    restrictive
                      ? "bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning)]"
                      : "bg-[color:var(--color-success-soft)] text-[color:var(--color-success)]"
                  }`}
                >
                  {restrictive ? "More restrictive" : "More open"}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-primary)]">
                {event.fromLicense} <span aria-hidden="true">→</span>
                <span className="sr-only">to</span> {event.toLicense}
                {event.convertsOn && event.convertsTo ? (
                  <span className="text-[var(--color-text-secondary)]">
                    {" "}
                    (auto-converts to {event.convertsTo} on <time dateTime={event.convertsOn}>{event.convertsOn}</time>)
                  </span>
                ) : null}
              </p>
              {event.notes ? <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{event.notes}</p> : null}
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                <ExternalLink size={12} aria-hidden="true" />
                {event.sourceTitle ?? "Source"}
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
