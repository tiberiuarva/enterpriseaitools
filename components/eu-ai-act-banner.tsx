"use client";

import { useEffect, useId, useState } from "react";
import { ArrowRight, CalendarClock } from "lucide-react";
import {
  EU_AI_ACT_OFFICIAL_URL,
  formatUtcDate,
  getCurrentAndNextMilestones,
} from "@/lib/eu-ai-act";

function getMsUntilNextUtcDay(now: Date) {
  const nextUtcMidnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );

  return nextUtcMidnight - now.getTime();
}

function useNow() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    let timer: number | undefined;

    const scheduleNextUpdate = () => {
      const nextNow = new Date();
      setNow(nextNow);
      timer = window.setTimeout(scheduleNextUpdate, getMsUntilNextUtcDay(nextNow));
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        if (timer !== undefined) {
          window.clearTimeout(timer);
        }
        scheduleNextUpdate();
      }
    };

    scheduleNextUpdate();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  return now;
}

export function EuAiActBanner() {
  const bannerLabelId = useId();
  const now = useNow();
  // Keep SSR and the first client render byte-stable on this static site.
  // The live UTC-sensitive milestone state only appears after hydration.
  const milestoneState = now ? getCurrentAndNextMilestones(now) : null;
  const daysLeft = milestoneState?.nextMilestone.daysUntil ?? null;
  const isActiveToday = daysLeft === 0;
  const statusLabel = milestoneState
    ? milestoneState.hasUpcomingMilestone
      ? isActiveToday
        ? "Applies today"
        : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`
      : "Latest tranche already applies"
    : "Countdown loads after hydration";

  const nextMilestoneText = milestoneState
    ? `${milestoneState.nextMilestone.label} · ${formatUtcDate(milestoneState.nextMilestone.appliesOn)}`
    : "Official milestone date loads after hydration";

  return (
    <aside
      aria-labelledby={bannerLabelId}
      className="border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]/60"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-1.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-text-secondary)] sm:text-sm">
            <span id={bannerLabelId} className="font-medium text-[var(--color-text-primary)]">
              EU AI Act
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-card)] px-2 py-0.5 text-[11px] font-medium tabular-nums text-[var(--color-text-secondary)]">
              <CalendarClock size={12} aria-hidden="true" />
              {statusLabel}
            </span>
            <span className="truncate">Next milestone: {nextMilestoneText}</span>
          </div>
        </div>

        <a
          href={EU_AI_ACT_OFFICIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit shrink-0 items-center gap-1 text-xs font-medium text-[var(--color-text-secondary)] underline-offset-4 transition hover:text-[var(--color-text-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] sm:text-sm"
        >
          Official timeline
          <span className="sr-only"> (opens in a new tab)</span>
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
