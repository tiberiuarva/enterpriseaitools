"use client";

import { useEffect, useRef, useState } from "react";

type Option = { id: string; label: string; count: number };

// Filters the server-rendered timeline by event type (data-type) and impact.
export function TimelineControls({ targetId, types, total }: { targetId: string; types: Option[]; total: number }) {
  const [type, setType] = useState("all");
  const [keyOnly, setKeyOnly] = useState(false);
  // The count is written straight into the DOM from the effect that filters it.
  const shownRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.getElementById(targetId);
    if (!root) return;
    let count = 0;
    root.querySelectorAll<HTMLElement>("[data-event]").forEach((el) => {
      const matches = (type === "all" || el.dataset.type === type) && (!keyOnly || el.dataset.impact === "high");
      el.hidden = !matches;
      if (matches) count += 1;
    });
    const filtering = type !== "all" || keyOnly;
    root.querySelectorAll<HTMLElement>("[data-year]").forEach((year) => {
      year.hidden = year.querySelector("[data-event]:not([hidden])") === null;
      const details = year.querySelector<HTMLDetailsElement>("details[data-year-details]");
      if (details && filtering && !year.hidden) details.open = true;
    });
    if (shownRef.current) shownRef.current.textContent = String(count);
  }, [targetId, type, keyOnly]);

  const chip = (active: boolean) =>
    `inline-flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition ${
      active
        ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]"
    }`;

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Event type">
        <button type="button" aria-pressed={keyOnly} onClick={() => setKeyOnly((value) => !value)} className={chip(keyOnly)}>
          Key milestones only
        </button>
        <span aria-hidden="true" className="mx-1 w-px shrink-0 self-stretch bg-[var(--color-border)]" />
        {[{ id: "all", label: "All types", count: total }, ...types].map((option) => (
          <button key={option.id} type="button" aria-pressed={type === option.id} onClick={() => setType(option.id)} className={chip(type === option.id)}>
            {option.label}
            <span className="tabular-nums opacity-70">{option.count}</span>
          </button>
        ))}
      </div>
      <p aria-live="polite" className="text-sm text-[var(--color-text-secondary)]">
        Showing <span ref={shownRef} className="font-semibold tabular-nums text-[var(--color-text-primary)]">{total}</span> of {total} events
      </p>
    </div>
  );
}
