"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock } from "lucide-react";
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
  const now = useNow();

  if (!now) {
    return (
      <aside
        aria-label="EU AI Act countdown"
        className="min-h-[92px] border-b border-[var(--color-border)] bg-[var(--color-primary-soft)]"
      >
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
                  Loading countdown…
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Tracking the European Commission&apos;s published EU AI Act timeline in UTC.
              </p>
            </div>
          </div>

          <a
            href={EU_AI_ACT_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            Official timeline
            <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </aside>
    );
  }

  const { nextMilestone, currentMilestones, hasUpcomingMilestone } = getCurrentAndNextMilestones(now);
  const daysLeft = nextMilestone.daysUntil;
  const isActiveToday = daysLeft === 0;
  const milestonePrefix = hasUpcomingMilestone
    ? isActiveToday
      ? "Today's milestone:"
      : "Next milestone:"
    : "Latest published milestone:";
  const statusLabel = hasUpcomingMilestone
    ? isActiveToday
      ? "Applies today (UTC)."
      : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left.`
    : "Latest published milestone already applies.";

  const latestCurrentMilestone = hasUpcomingMilestone ? currentMilestones.at(-1) : null;
  const currentSummary = latestCurrentMilestone
    ? `Already in force: ${latestCurrentMilestone.label}.`
    : null;

  return (
    <aside
      aria-label="EU AI Act countdown"
      className="min-h-[92px] border-b border-[var(--color-border)] bg-[var(--color-primary-soft)]"
    >
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
              <span className="font-medium text-[var(--color-text-primary)]">{milestonePrefix}</span> {nextMilestone.label} on {formatUtcDate(nextMilestone.appliesOn)}. {nextMilestone.summary}
              {currentSummary ? ` ${currentSummary}` : ""}
            </p>
          </div>
        </div>

        <a
          href={EU_AI_ACT_OFFICIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
        >
          Official timeline
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </aside>
  );
}
