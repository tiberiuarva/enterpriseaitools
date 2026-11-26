import { ChevronDown } from "lucide-react";
import type { UpdateEntry } from "@/lib/types";
import { formatPartialDate, type SourceLink as SourceLinkData } from "@/lib/vendor-overview";
import { withBasePath } from "@/lib/site";

// ── Sources and related updates ──────────────────────────────────────────

export function SourceList({ sources }: { sources: SourceLinkData[] }) {
  return (
    <details className="group/sources">
      <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 rounded-full text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
        <ChevronDown size={14} aria-hidden="true" className="transition group-open/sources:rotate-180" />
        <span className="group-open/sources:hidden">Show all {sources.length} sources</span>
        <span className="hidden group-open/sources:inline">Hide sources</span>
      </summary>
    <ol className="mt-3 grid list-decimal grid-cols-1 gap-x-8 gap-y-1.5 pl-6 text-sm marker:text-[var(--color-text-tertiary)] md:grid-cols-2 xl:grid-cols-3">
      {sources.map((source) => (
        <li key={source.url} className="min-w-0 pl-1">
          <a href={source.url} target="_blank" rel="noreferrer" className="break-words text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:underline">
            {source.title === source.url ? source.url.replace(/^https:\/\//, "") : source.title}
          </a>
        </li>
      ))}
    </ol>
    </details>
  );
}

export function RelatedUpdates({ updates }: { updates: UpdateEntry[] }) {
  if (updates.length === 0) return null;
  return (
    <ul className="divide-y divide-[var(--color-border)]">
      {updates.map((update) => (
        <li key={update.id} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
          <time dateTime={update.date} className="shrink-0 text-caption tabular-nums text-[var(--color-text-tertiary)] sm:w-24">
            {formatPartialDate(update.date)}
          </time>
          <a href={withBasePath(`/updates#${update.id}`)} className="text-sm text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:underline">
            {update.title ?? update.summary}
          </a>
        </li>
      ))}
    </ul>
  );
}
