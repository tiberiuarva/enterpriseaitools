import { ChevronDown } from "lucide-react";
import type { VendorFaq } from "@/lib/types";
import type { SourceLink as SourceLinkData } from "@/lib/vendor-overview";
import { SourceLink } from "./primitives";

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

// Question-and-answer accordion with each answer's sources.
export function FaqList({ faqs }: { faqs: VendorFaq[] }) {
  if (faqs.length === 0) return null;
  return (
    <ul className="flex flex-col divide-y divide-[var(--color-border)]">
      {faqs.map((faq) => (
        <li key={faq.id}>
          <details className="group py-1">
            <summary className="flex cursor-pointer select-none list-none items-start justify-between gap-3 rounded py-3 text-sm font-medium text-[var(--color-text-primary)] transition hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] [&::-webkit-details-marker]:hidden">
              <span>{faq.question}</span>
              <ChevronDown size={16} aria-hidden="true" className="mt-1 shrink-0 text-[var(--color-text-secondary)] transition group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-sm leading-6 text-[var(--color-text-secondary)]">
              {faq.answer}
              {faq.sourceUrls.map((url) => (
                <span key={url}>
                  {" "}
                  <SourceLink href={url} />
                </span>
              ))}
            </p>
          </details>
        </li>
      ))}
    </ul>
  );
}
