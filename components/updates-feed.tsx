"use client";

import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { UpdateEntry, UpdateImpact } from "@/lib/types";

const categoryOptions = [
  { label: "All", value: "all" },
  { label: "Platforms", value: "platforms" },
  { label: "Agents", value: "agents" },
  { label: "Orchestration", value: "orchestration" },
  { label: "Governance", value: "governance" },
  { label: "Assistants", value: "assistants" },
] as const;

const viewOptions = [
  { label: "High impact", value: "high-impact" },
  { label: "All updates", value: "all-updates" },
] as const;

type FeedView = (typeof viewOptions)[number]["value"];

function formatUpdateLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getImpactTone(impact?: UpdateImpact) {
  switch (impact) {
    case "high":
      return "border-[color:var(--color-danger)] bg-[color:var(--color-danger-soft)] text-[color:var(--color-danger)]";
    case "medium":
      return "border-[color:var(--color-warning)] bg-[color:var(--color-warning-soft)] text-[color:var(--color-warning)]";
    default:
      return "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]";
  }
}

export function UpdatesFeed({ updates }: { updates: UpdateEntry[] }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [view, setView] = useState<FeedView>("high-impact");

  const filtered = useMemo(
    () => categoryFilter === "all" ? updates : updates.filter((u) => u.category === categoryFilter),
    [updates, categoryFilter],
  );

  const hasHighImpactUpdates = useMemo(
    () => filtered.some((update) => update.impact === "high"),
    [filtered],
  );

  const effectiveView: FeedView = view === "high-impact" && hasHighImpactUpdates ? "high-impact" : "all-updates";

  const visibleUpdates = useMemo(() => {
    if (effectiveView === "all-updates") {
      return filtered;
    }

    return filtered.filter((update) => update.impact === "high");
  }, [effectiveView, filtered]);

  const hiddenCount = filtered.length - visibleUpdates.length;
  const showingHighImpact = effectiveView === "high-impact";

  return (
    <>
      <div className="card-flat p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Market intelligence feed</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
              Default view shows only the highest-impact market moves. Expand to the full log when you need lower-signal releases and routine product churn.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1">
            <fieldset className="flex flex-wrap gap-1">
              <legend className="sr-only">Choose updates feed view</legend>
              {viewOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={effectiveView === option.value}
                  onClick={() => setView(option.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                    effectiveView === option.value
                      ? "bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </fieldset>
          </div>
        </div>

        <fieldset className="mt-4 flex flex-wrap gap-2">
          <legend className="sr-only">Filter updates by category</legend>
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={categoryFilter === option.value}
              onClick={() => setCategoryFilter(option.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                categoryFilter === option.value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-text-inverse)]"
                  : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </fieldset>
      </div>

      <section className="mt-6 card-flat p-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[var(--color-text-secondary)]">
            {showingHighImpact
              ? `${visibleUpdates.length} high-impact updates shown${hiddenCount > 0 ? `, ${hiddenCount} lower-signal updates hidden` : ""}.`
              : view === "high-impact" && !hasHighImpactUpdates
                ? `${visibleUpdates.length} updates shown. No high-impact updates are currently available, so the full log is shown by default.`
                : `${visibleUpdates.length} updates shown.`}
          </p>
          {showingHighImpact && hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setView("all-updates")}
              className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Show full log
            </button>
          ) : null}
        </div>

        {visibleUpdates.length > 0 ? (
          <div className="space-y-6">
            {visibleUpdates.map((update) => (
              <article id={update.id} key={update.id} className="flex gap-4 scroll-mt-24 border-l-2 border-[var(--color-border)] pl-4">
                <div className="w-28 shrink-0 text-caption uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  {update.date}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-[var(--color-text-primary)]">
                      {update.title ?? update.toolName}
                    </div>
                    {update.impact ? (
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${getImpactTone(update.impact)}`}
                      >
                        {update.impact} impact
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
                    <span>{update.toolName}</span>
                    <span aria-hidden="true">•</span>
                    <span>{formatUpdateLabel(update.category)}</span>
                    <span aria-hidden="true">•</span>
                    <span>{formatUpdateLabel(update.type)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{update.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    {update.sourceTitle ? (
                      <span className="text-[var(--color-text-secondary)]">
                        Source: <span className="font-medium text-[var(--color-text-primary)]">{update.sourceTitle}</span>
                      </span>
                    ) : null}
                    <a
                      href={update.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-[var(--color-primary)] hover:underline"
                      aria-label={`Open source for ${update.toolName} in a new tab`}
                    >
                      Read source
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 text-sm text-[var(--color-text-secondary)]">
            No updates match this filter in the current view. Try another category or switch to the full log.
          </div>
        )}
      </section>
    </>
  );
}
