import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { CATEGORIES, layerForCategory } from "@/lib/categories";
import { lastUpdated, tools, updateCountByTool } from "@/lib/data";
import { JOURNEYS } from "@/lib/journeys";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import { previewTools } from "@/lib/stacks";

const title = "Start with your question";
const description = `${JOURNEYS.length} step-by-step paths across the enterprise AI stack: rolling out assistants, shipping a first agent, governing existing agents, and always-on agents.`;

export const metadata: Metadata = buildMetadata({ title, description, path: "/start" });

export default function StartPage() {
  const pageUrl = `${siteUrl}/start/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: title, url: pageUrl },
    ]),
    buildWebPageJsonLd({ name: title, url: pageUrl, description, siteUrl }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/start">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="card-flat p-6 md:p-10">
          <h1 className="text-h1 text-[var(--color-text-primary)]">{title}</h1>
          <p className="mt-3 max-w-3xl text-body text-[var(--color-text-secondary)]">
            Each path walks through the decisions in the order teams usually face them, with the category to compare at every
            step. Pick the one closest to what you are trying to do.
          </p>
          <nav aria-label="Paths on this page" className="mt-5">
            <ul className="flex flex-wrap gap-2">
              {JOURNEYS.map((journey) => (
                <li key={journey.id}>
                  <a
                    href={`#${journey.id}`}
                    className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    {journey.question}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        {JOURNEYS.map((journey) => (
          <section
            key={journey.id}
            id={journey.id}
            aria-labelledby={`${journey.id}-heading`}
            className="card-flat scroll-mt-[calc(var(--site-header-height)_+_1rem)] p-6"
          >
            <h2 id={`${journey.id}-heading`} className="text-h2 text-[var(--color-text-primary)]">
              {journey.question}
            </h2>
            <p className="mt-2 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">{journey.summary}</p>
            <ol className="mt-5 flex flex-col gap-4">
              {journey.steps.map((step, index) => {
                const meta = CATEGORIES[step.category];
                const examples = previewTools(tools, step.category, 3, updateCountByTool);
                return (
                  <li key={step.category} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-semibold tabular-nums text-[var(--color-primary)]"
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <a
                          href={withBasePath(`/${step.category}`)}
                          className="inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                        >
                          {meta.navLabel}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </a>
                        <span className="text-caption text-[var(--color-text-secondary)]">{layerForCategory(step.category).label}</span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{step.decide}</p>
                      {examples.length > 0 ? (
                        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                          For example:{" "}
                          {examples.map((tool, toolIndex) => (
                            <span key={tool.id}>
                              {toolIndex > 0 ? ", " : null}
                              <a href={withBasePath(`/tools/${tool.id}`)} className="text-[var(--color-primary)] hover:underline">
                                {tool.name}
                              </a>
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        <p className="text-sm text-[var(--color-text-secondary)]">
          Already know your constraints?{" "}
          <a href={withBasePath("/evaluate")} className="font-medium text-[var(--color-primary)] hover:underline">
            Get a ranked shortlist
          </a>
          .
        </p>
      </main>
    </HomeShell>
  );
}
