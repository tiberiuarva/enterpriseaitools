import { ChevronDown, HelpCircle } from "lucide-react";
import type { HubFaq } from "@/lib/hub-faqs";

type HubFaqsProps = {
  faqs: HubFaq[];
  title?: string;
  intro?: string;
  headingId?: string;
};

export function HubFaqs({
  faqs,
  title = "Frequently asked questions",
  intro,
  headingId = "hub-faqs-heading",
}: HubFaqsProps) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby={headingId}
      className="card-flat p-6"
    >
      <div className="flex items-start gap-3">
        <HelpCircle size={20} aria-hidden="true" className="mt-1 shrink-0 text-[var(--color-text-secondary)]" />
        <div>
          <h2 id={headingId} className="text-h2 text-[var(--color-text-primary)]">
            {title}
          </h2>
          {intro ? (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{intro}</p>
          ) : null}
        </div>
      </div>
      <ul className="mt-4 flex flex-col divide-y divide-[var(--color-border)]">
        {faqs.map((faq) => (
          <li key={faq.question}>
            <details className="group py-1">
              <summary className="flex cursor-pointer select-none list-none items-start justify-between gap-3 rounded py-3 text-sm font-medium text-[var(--color-text-primary)] transition hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-[var(--color-text-secondary)] transition group-open:rotate-180"
                />
              </summary>
              <p className="pb-4 text-sm leading-6 text-[var(--color-text-secondary)]">{faq.answer}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
