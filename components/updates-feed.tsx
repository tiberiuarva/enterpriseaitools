"use client";

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
                  {update.toolName}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
                  {update.category} · {update.type}
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{update.summary}</p>
                <a
                  href={update.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Source
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
