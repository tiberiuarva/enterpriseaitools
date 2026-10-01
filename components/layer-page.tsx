import { ArrowUpRight } from "lucide-react";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { CATEGORIES, STACK_LAYERS, type LayerId } from "@/lib/categories";
import { lastUpdated, tools, updateCountByTool, updates } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import { previewTools } from "@/lib/stacks";

// How analysts and vendors frame the control plane; shown on /control-plane so
// the grouping is traceable to sources rather than asserted.
const CONTROL_PLANE_SOURCES = [
  {
    name: "Forrester",
    summary:
      "Defines an agent control plane that inventories, governs, orchestrates and assures agents across vendors, separate from the planes that build agents and orchestrate processes.",
    url: "https://www.forrester.com/blogs/announcing-our-evaluation-of-the-agent-control-plane-market/",
  },
  {
    name: "Microsoft",
    summary: "Positions Agent 365 as the control plane for agents, organised as observe, govern and secure.",
    url: "https://learn.microsoft.com/en-us/microsoft-agent-365/overview",
  },
  {
    name: "Gartner",
    summary: "Tracks guardian agents: technology that supervises other agents, a category it expects to grow alongside agentic AI.",
    url: "https://www.gartner.com/en/newsroom/press-releases/2025-06-11-gartner-predicts-that-guardian-agents-will-capture-10-15-percent-of-the-agentic-ai-market-by-2030",
  },
] as const;

function getLayer(id: LayerId) {
  const layer = STACK_LAYERS.find((candidate) => candidate.id === id);
  if (!layer) throw new Error(`Unknown stack layer ${id}`);
  return layer;
}

export function buildLayerMetadata(id: LayerId) {
  const layer = getLayer(id);
  return buildMetadata({ title: layer.title, description: layer.metaDescription, path: layer.href });
}

export function LayerPage({ id }: { id: LayerId }) {
  const layer = getLayer(id);
  const pageUrl = `${siteUrl}${layer.href}/`;
  const layerTools = tools.filter((tool) => layer.categories.includes(tool.category));
  const suites = tools
    .filter((tool) => (tool.alsoCovers ?? []).filter((category) => layer.categories.includes(category)).length >= 2)
    .sort((a, b) => a.name.localeCompare(b.name));
  const layerUpdates = updates.filter((update) => (layer.categories as readonly string[]).includes(update.category)).slice(0, 4);
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: layer.title, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({ name: layer.title, url: pageUrl, description: layer.metaDescription }),
    buildToolListJsonLd(layerTools, layer.title, layer.metaDescription, pageUrl),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath={layer.href}>
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="card-flat p-6 md:p-10">
          <p className="text-caption uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Stack layer · {layer.tagline}</p>
          <h1 className="mt-3 text-h1 text-[var(--color-text-primary)]">{layer.title}</h1>
          <p className="mt-3 max-w-3xl text-body text-[var(--color-text-secondary)]">{layer.intro}</p>
          <p className="mt-4 text-sm text-[var(--color-text-tertiary)]">
            {layerTools.length} tools in {layer.categories.length} categories ·{" "}
            <a href={withBasePath("/")} className="text-[var(--color-primary)] hover:underline">
              see the whole stack
            </a>
          </p>
        </section>

        <section aria-labelledby="layer-categories-heading">
          <h2 id="layer-categories-heading" className="text-h2 text-[var(--color-text-primary)]">
            Categories in this layer
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {layer.categories.map((category) => {
              const meta = CATEGORIES[category];
              const count = tools.filter((tool) => tool.category === category).length;
              const examples = previewTools(tools, category, 3, updateCountByTool);
              return (
                <li key={category} className="card-flat flex flex-col gap-3 p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-h3 text-[var(--color-text-primary)]">
                      <a href={withBasePath(`/${category}`)} className="inline-flex items-center gap-1 hover:text-[var(--color-primary)]">
                        {meta.navLabel}
                        <ArrowUpRight size={16} aria-hidden="true" />
                      </a>
                    </h3>
                    <span className="shrink-0 text-caption tabular-nums text-[var(--color-text-tertiary)]">{count} tools</span>
                  </div>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{meta.summary}</p>
                  {examples.length > 0 ? (
                    <ul className="flex flex-wrap gap-1.5" aria-label={`Examples in ${meta.navLabel}`}>
                      {examples.map((tool) => (
                        <li key={tool.id}>
                          <a
                            href={withBasePath(`/tools/${tool.id}`)}
                            className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                          >
                            {tool.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        {suites.length > 0 ? (
          <section aria-labelledby="layer-suites-heading" className="card-flat p-6">
            <h2 id="layer-suites-heading" className="text-h2 text-[var(--color-text-primary)]">
              Suites that span several categories
            </h2>
            <p className="mt-2 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">
              Each tool is listed under its main function. These also cover two or more other categories in this layer.
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {suites.map((tool) => (
                <li key={tool.id} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
                  <a href={withBasePath(`/tools/${tool.id}`)} className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] sm:w-64 sm:shrink-0">
                    {tool.name}
                  </a>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {CATEGORIES[tool.category].navLabel} · also{" "}
                    {(tool.alsoCovers ?? []).map((category) => CATEGORIES[category].navLabel.toLowerCase()).join(", ")}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {id === "control" ? (
          <section aria-labelledby="layer-standards-heading" className="card-flat p-6">
            <h2 id="layer-standards-heading" className="text-h2 text-[var(--color-text-primary)]">
              How the industry frames the control plane
            </h2>
            <p className="mt-2 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">
              There is no single standard yet. These are the framings this grouping follows; gateways are included as the point
              where policy is enforced on every model and tool call.
            </p>
            <ul className="mt-4 flex flex-col gap-3">
              {CONTROL_PLANE_SOURCES.map((source) => (
                <li key={source.name} className="text-sm leading-6 text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text-primary)]">{source.name}:</span> {source.summary}{" "}
                  <a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-[var(--color-primary)] hover:underline">
                    Source
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {layerUpdates.length > 0 ? (
          <section aria-labelledby="layer-updates-heading" className="card-flat p-6">
            <h2 id="layer-updates-heading" className="text-h2 text-[var(--color-text-primary)]">
              Recent updates in this layer
            </h2>
            <ul className="mt-4 flex flex-col gap-4">
              {layerUpdates.map((update) => (
                <li key={update.id} className="border-l-2 border-[var(--color-primary)] pl-4">
                  <div className="text-caption uppercase tracking-wide text-[var(--color-text-tertiary)]">{update.date}</div>
                  <a href={withBasePath(`/tools/${update.toolId}`)} className="mt-1 block font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]">
                    {update.toolName}
                  </a>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">{update.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </HomeShell>
  );
}
