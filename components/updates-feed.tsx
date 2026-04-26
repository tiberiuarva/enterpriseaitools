"use client";

import { ArrowUpRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { UpdateEntry } from "@/lib/types";

const categoryOptions = [
  { label: "All", value: "all" },
  { label: "Platforms", value: "platforms" },
  { label: "Agents", value: "agents" },
  { label: "Orchestration", value: "orchestration" },
  { label: "Governance", value: "governance" },
  { label: "Assistants", value: "assistants" },
] as const;

function formatUpdateLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function UpdatesFeed({ updates }: { updates: UpdateEntry[] }) {
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(
    () => categoryFilter === "all" ? updates : updates.filter((u) => u.category === categoryFilter),
    [updates, categoryFilter],
  );

  return (
    <>
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <fieldset className="flex flex-wrap gap-2">
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

      <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">{filtered.length} updates shown.</p>
        <div className="space-y-6">
          {filtered.map((update) => (
            <article key={update.id} className="flex gap-4 border-l-2 border-[var(--color-border)] pl-4">
              <div className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--color-secondary)]">
                {update.date}
              </div>
              <div>
                <div className="text-base font-semibold text-[var(--color-text-primary)]">
                  {update.title ?? update.toolName}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
                  <span>{update.toolName}</span>
                  <span aria-hidden="true">•</span>
                  <span>{formatUpdateLabel(update.category)}</span>
                  <span aria-hidden="true">•</span>
                  <span>{formatUpdateLabel(update.type)}</span>
                  {update.impact ? (
                    <>
                      <span aria-hidden="true">•</span>
                      <span>{formatUpdateLabel(update.impact)} impact</span>
                    </>
                  ) : null}
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
      </section>
    </>
  );
}
