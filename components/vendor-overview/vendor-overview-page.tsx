import { CATEGORIES } from "@/lib/categories";
import { withBasePath } from "@/lib/site";
import { VENDOR_STACKS, buildVendorStack, vendorStackGaps, type VendorStack } from "@/lib/stacks";
import type { Platform, Tool, UpdateEntry, VendorOverview } from "@/lib/types";
import { currentModels, domainCounts, formatPartialDate, overviewSources, relatedUpdates } from "@/lib/vendor-overview";
import { HubFaqs } from "@/components/hub-faqs";
import { StackMap } from "@/components/stack-map";
import { EntryCatalog } from "./entry-catalog";
import { EvolutionTimeline } from "./evolution-timeline";
import { ModelLineage } from "./model-lineage";
import {
  AvailabilityGrid,
  CompanyPanel,
  DomainHighlights,
  GovernancePanel,
  PlanGrid,
  RelatedUpdates,
  RoadmapPanel,
  SafetyScale,
  SourceList,
} from "./panels";
import { OverviewSection } from "./primitives";
import { SectionNav, type SectionNavCluster } from "./section-nav";
import { VendorStackDiagram } from "./vendor-stack-diagram";

const ECOSYSTEM_SECTIONS = ["industry-solutions", "open-standards", "research", "safety-policy", "programs"] as const;

type Props = {
  overview: VendorOverview;
  stack: VendorStack;
  tools: Tool[];
  platforms: Platform[];
  updates: UpdateEntry[];
  activity: ReadonlyMap<string, number>;
};

export function VendorOverviewPage({ overview, stack, tools, platforms, updates, activity }: Props) {
  const counts = domainCounts(overview);
  const current = currentModels(overview.models);
  const sources = overviewSources(overview);
  const feed = relatedUpdates(overview, updates);
  const gaps = vendorStackGaps(buildVendorStack(stack, tools));
  const domain = (id: string) => overview.domains.find((candidate) => candidate.id === id);
  const toolLinks = overview.entries.filter((entry) => entry.toolId);

  const clusters: SectionNavCluster[] = [
    { label: "Overview", links: [{ id: "overview", label: "Summary" }, { id: "map", label: "Stack map" }, { id: "market", label: "Market map" }] },
    {
      label: "Products",
      links: [
        { id: "catalog", label: "All offerings" },
        { id: "claude-models", label: "Models" },
        { id: "pricing", label: "Plans & pricing" },
        { id: "availability", label: "Where to run" },
        { id: "enterprise", label: "Enterprise & trust" },
        { id: "industry-solutions", label: "Industries" },
      ],
    },
    {
      label: "Ecosystem",
      links: [
        { id: "open-standards", label: "Open standards" },
        { id: "research", label: "Research" },
        { id: "safety-policy", label: "Safety & policy" },
        { id: "programs", label: "Programs" },
      ],
    },
    {
      label: "Company & history",
      links: [
        { id: "company-partners", label: "Company" },
        { id: "timeline", label: "Timeline" },
        { id: "roadmap", label: "What's next" },
        { id: "faq", label: "FAQ" },
        { id: "sources", label: "Sources" },
      ],
    },
  ];

  const stats = [
    { label: "Offerings tracked", value: String(overview.entries.length) },
    { label: "Product families", value: String(overview.domains.length) },
    { label: "Current Claude models", value: String(current.length) },
    { label: "Ways to run Claude", value: String(overview.availability.length) },
    { label: "Sources cited", value: String(sources.length) },
  ];

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-[var(--color-text-secondary)]">
        <ol className="flex flex-wrap items-center gap-x-1.5">
          {[
            { name: "Home", href: "/" },
            { name: "Vendor stacks", href: "/stacks" },
          ].map((crumb) => (
            <li key={crumb.href} className="flex items-center gap-x-1.5">
              <a href={withBasePath(crumb.href)} className="text-[var(--color-primary)] hover:underline">
                {crumb.name}
              </a>
              <span aria-hidden="true">/</span>
            </li>
          ))}
          <li aria-current="page">{overview.title}</li>
        </ol>
      </nav>

      <section id="overview" aria-labelledby="overview-heading" className="card-flat scroll-mt-[calc(var(--site-header-height)+4rem)] p-6 md:p-10">
        <p className="text-caption uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Vendor stack</p>
        <h1 id="overview-heading" className="mt-3 text-display text-[var(--color-text-primary)]">
          {overview.title}
        </h1>
        <p className="mt-4 max-w-3xl text-body text-[var(--color-text-secondary)]">{overview.answer}</p>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[var(--color-border)] px-4 py-3">
              <dt className="text-caption text-[var(--color-text-secondary)]">{stat.label}</dt>
              <dd className="mt-0.5 text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="text-[var(--color-text-secondary)]">
            Last reviewed <time dateTime={overview.reviewedAt}>{formatPartialDate(overview.reviewedAt)}</time> against {sources.length} primary sources.
          </span>
          <a href={withBasePath("/methodology")} className="font-medium text-[var(--color-accent)] hover:underline">
            How we source data
          </a>
        </div>
        <nav aria-label="Other vendor stacks" className="mt-4 flex flex-wrap gap-2 text-sm">
          {[
            ...VENDOR_STACKS.filter((other) => other.slug !== stack.slug).map((other) => ({ href: `/stacks/${other.slug}`, label: `${other.name} stack` })),
            { href: "/stacks", label: "All vendor stacks" },
          ].map((link) => (
            <a
              key={link.href}
              href={withBasePath(link.href)}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-3 py-1.5 font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </section>

      <SectionNav clusters={clusters} />

      <OverviewSection
        id="map"
        eyebrow="Overview"
        title={`How the ${overview.name} stack fits together`}
        intro={`${overview.domains.length} families of offerings in three rows. Claude is the largest product family; open standards, research, safety policy and programs surround it. Select a family to jump to its full list.`}
      >
        <VendorStackDiagram overview={overview} />
      </OverviewSection>

      <OverviewSection
        id="catalog"
        eyebrow="Products"
        title="Every offering, by family"
        intro="Search or filter the full catalog. Each entry shows its status, launch year and the primary source it comes from. Renamed products list their former names."
      >
        <EntryCatalog overview={overview} />
      </OverviewSection>

      <OverviewSection
        id="claude-models"
        eyebrow="Products"
        title="Claude models: lineage and what's available"
        intro={domain("claude-models")?.intro}
      >
        <ModelLineage models={overview.models} statusSource={overview.modelStatusSource} />
      </OverviewSection>

      <OverviewSection
        id="pricing"
        eyebrow="Products"
        title="Plans and pricing"
        intro="List prices in US dollars as published by the vendor. Every price links to the page it was checked against and shows when."
      >
        <PlanGrid plans={overview.plans} />
      </OverviewSection>

      <OverviewSection
        id="availability"
        eyebrow="Products"
        title="Where you can run Claude"
        intro="Buy direct from Anthropic, run the models inside your cloud, or use Claude inside partner products. Who operates the service determines who processes your data."
      >
        <AvailabilityGrid availability={overview.availability} />
      </OverviewSection>

      <OverviewSection
        id="enterprise"
        eyebrow="Products"
        title="Enterprise, security and compliance"
        intro={
          <>
            Vendor-level posture across the commercial products. Per-product governance posture lives on the tool pages:{" "}
            {toolLinks.map((entry, index) => (
              <span key={entry.id}>
                {index > 0 ? ", " : null}
                <a href={withBasePath(`/tools/${entry.toolId}`)} className="font-medium text-[var(--color-accent)] hover:underline">
                  {entry.name}
                </a>
              </span>
            ))}
            .
          </>
        }
      >
        <GovernancePanel rows={overview.governance} />
      </OverviewSection>

      {ECOSYSTEM_SECTIONS.map((id) => {
        const item = domain(id);
        if (!item) return null;
        return (
          <OverviewSection key={id} id={id} eyebrow={id === "industry-solutions" ? "Products" : "Ecosystem"} title={item.label} intro={item.intro}>
            <div className="flex flex-col gap-6">
              {id === "safety-policy" && overview.safetyLevels.length > 0 ? (
                <div>
                  <h3 className="mb-3 text-h3 text-[var(--color-text-primary)]">AI Safety Levels under the Responsible Scaling Policy</h3>
                  <SafetyScale levels={overview.safetyLevels} />
                </div>
              ) : null}
              <DomainHighlights domain={item} entries={overview.entries} count={counts[id]} />
            </div>
          </OverviewSection>
        );
      })}

      <OverviewSection id="company-partners" eyebrow="Company" title="Company and partners" intro={domain("company-partners")?.intro}>
        <CompanyPanel company={overview.company} />
      </OverviewSection>

      <OverviewSection
        id="timeline"
        eyebrow="History"
        title={`How ${overview.name} got here`}
        intro="Models, products, platform launches, safety policy, research, partnerships and company milestones from the first funding round to today. Filter by type or show only the key milestones."
      >
        <EvolutionTimeline overview={overview} />
        {feed.length > 0 ? (
          <div className="mt-8 border-t border-[var(--color-border)] pt-6">
            <h3 className="text-h3 text-[var(--color-text-primary)]">Latest from the weekly change feed</h3>
            <RelatedUpdates updates={feed} />
            <a href={withBasePath("/updates")} className="mt-2 inline-flex text-sm font-medium text-[var(--color-accent)] hover:underline">
              All updates →
            </a>
          </div>
        ) : null}
      </OverviewSection>

      <OverviewSection
        id="roadmap"
        eyebrow="What's next"
        title="Announced plans"
        intro="Only plans the vendor has stated publicly, in its own words, with the date it said so. No analyst speculation."
      >
        <RoadmapPanel items={overview.roadmap} />
      </OverviewSection>

      <section id="market" aria-labelledby="market-heading" className="card-flat scroll-mt-[calc(var(--site-header-height)+4rem)] p-5 sm:p-6 md:p-8">
        <h2 id="market-heading" className="text-h2 text-[var(--color-text-primary)]">
          Where {stack.name} sits on the enterprise AI stack map
        </h2>
        <p className="mt-2 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">
          The same map used for every vendor, showing the {stack.name} products tracked in each category and where to compare alternatives.
        </p>
        <div className="mt-5">
          <StackMap tools={tools} activity={activity} platforms={platforms} vendor={stack} headingLevel="h3" />
        </div>
        {gaps.length > 0 ? (
          <div className="mt-5">
            <p className="text-body-sm text-[var(--color-text-secondary)]">No {stack.name} product is tracked in these categories yet:</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {gaps.map((category) => (
                <li key={category}>
                  <a
                    href={withBasePath(`/${category}`)}
                    className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    {CATEGORIES[category].navLabel}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <div id="faq" className="scroll-mt-[calc(var(--site-header-height)+4rem)]">
        <HubFaqs
          faqs={overview.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))}
          title={`Questions about ${overview.name} and Claude`}
          headingId="faq-heading"
        />
      </div>

      <OverviewSection id="sources" eyebrow="Sources" title="Every source on this page" intro={`${sources.length} distinct primary sources, each checked on or before ${formatPartialDate(overview.reviewedAt)}.`}>
        <SourceList sources={sources} />
      </OverviewSection>
    </>
  );
}
