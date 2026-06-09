import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/components/json-ld";
import { RelatedHubs } from "@/components/related-hubs";
import { comparisonPairs } from "@/lib/comparisons";
import { lastUpdated, tools } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";

const title = "Tool comparisons";
const description =
  "Curated side-by-side comparisons of tracked enterprise AI tools — governance posture, license risk, deployment surface, and certifications laid out column-by-column.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/tools/compare",
});

export default function CompareIndexPage() {
  const pageUrl = `${siteUrl}/tools/compare/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: title, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({ name: title, url: pageUrl, description }),
  ];

  const pairsWithTools = comparisonPairs.map((pair) => ({
    pair,
    resolvedTools: pair.toolIds
      .map((id) => tools.find((tool) => tool.id === id))
      .filter((tool): tool is NonNullable<typeof tool> => Boolean(tool)),
  }));

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/tools/compare">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <section className="card-flat p-6 md:p-10">
          <h1 className="text-h1 text-[var(--color-text-primary)]">{title}</h1>
          <p className="mt-3 max-w-2xl text-body text-[var(--color-text-secondary)]">{description}</p>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pairsWithTools.map(({ pair, resolvedTools }) => (
            <a
              key={pair.slug}
              href={withBasePath(`/tools/compare/${pair.slug}`)}
              className="card-flat p-5 transition hover:border-[var(--color-primary)]"
            >
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">{pair.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{pair.description}</p>
              <ul className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-text-secondary)]">
                {resolvedTools.map((tool) => (
                  <li
                    key={tool.id}
                    className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-2.5 py-1"
                  >
                    {tool.name}
                  </li>
                ))}
              </ul>
            </a>
          ))}
        </section>

        <RelatedHubs
          currentPath="/tools/compare"
          title="Explore the broader landscape"
          intro="Use the category hubs to compare every tracked tool within a category, or pivot into the platform foundation layer."
          hubs={[
            { href: "/platforms", title: "Platforms", description: "Microsoft Foundry, Amazon Bedrock, and the Gemini Enterprise Agent Platform." },
            { href: "/agents", title: "AI Agent Frameworks", description: "Compare managed cloud agent stacks with open-source frameworks." },
            { href: "/governance", title: "AI Governance", description: "Guardrails, safety controls, and policy tooling." },
            { href: "/assistants", title: "AI Assistants", description: "Coding, productivity, and build-your-own assistants." },
          ]}
        />
      </main>
    </HomeShell>
  );
}
