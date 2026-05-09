"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock } from "lucide-react";
import {
  EU_AI_ACT_OFFICIAL_URL,
  formatUtcDate,
  getCurrentAndNextMilestones,
} from "@/lib/eu-ai-act";

function useNow() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return now;
}

export function EuAiActBanner() {
  const now = useNow();
  const { nextMilestone, currentMilestones } = getCurrentAndNextMilestones(now ?? new Date("2026-05-09T00:00:00Z"));
  const daysLeft = nextMilestone.daysUntil;
  const isActiveToday = daysLeft === 0;
  const isFutureMilestone = daysLeft >= 0;
  const statusLabel = !now
    ? "Timeline loaded from the current EU AI Act milestone schedule."
    : isActiveToday
      ? "Applies today (UTC)."
      : isFutureMilestone
        ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left.`
        : "Current milestone already passed; tracking the latest published tranche.";

  const currentSummary = currentMilestones.length
    ? `${currentMilestones[currentMilestones.length - 1].label} already applies.`
    : "Earlier AI Act milestones are already in force.";

  return (
    <aside className="border-b border-[var(--color-border)] bg-[var(--color-primary-soft)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="mt-0.5 shrink-0 text-[var(--color-primary)]">
            <AlertTriangle size={18} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-[var(--color-text-primary)]">
              <span>EU AI Act countdown</span>
              <span className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-primary)]">
                <CalendarClock size={12} className="mr-1" aria-hidden="true" />
                {statusLabel}
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              <span className="font-medium text-[var(--color-text-primary)]">Next milestone:</span> {nextMilestone.label} on {formatUtcDate(nextMilestone.appliesOn)}. {nextMilestone.summary} {currentSummary}
            </p>
          </div>
        </div>

        <a
          href={EU_AI_ACT_OFFICIAL_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Official timeline
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
