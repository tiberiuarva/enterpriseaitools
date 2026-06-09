import { ArrowUpRight, GitCompare } from "lucide-react";
import type { ComparisonPair } from "@/lib/comparisons";
import { withBasePath } from "@/lib/site";

type RelatedComparisonsProps = {
  pairs: ComparisonPair[];
  title?: string;
  intro?: string;
  currentSlug?: string;
  headingId?: string;
};

export function RelatedComparisons({
  pairs,
  title = "Side-by-side comparisons",
  intro = "Read these tools next to one another across every tracked governance dimension.",
  currentSlug,
  headingId = "related-comparisons-heading",
}: RelatedComparisonsProps) {
  const visiblePairs = currentSlug ? pairs.filter((pair) => pair.slug !== currentSlug) : pairs;

  if (visiblePairs.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="card-flat p-6"
    >
      <div className="flex items-start gap-3">
        <GitCompare size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--color-text-secondary)]" />
        <div>
          <h2 id={headingId} className="text-h2 text-[var(--color-text-primary)]">
            {title}
          </h2>
          <p className="mt-1 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">{intro}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visiblePairs.map((pair) => (
          <a
            key={pair.slug}
            href={withBasePath(`/tools/compare/${pair.slug}`)}
            className="group flex items-start justify-between gap-3 card card-hover p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-card)]"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">{pair.title}</div>
              <p className="mt-1 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                {pair.description}
              </p>
            </div>
            <ArrowUpRight
              size={16}
              aria-hidden="true"
              className="mt-1 shrink-0 text-[var(--color-text-secondary)] transition group-hover:text-[var(--color-primary)]"
            />
          </a>
        ))}
      </div>
    </section>
  );
}
