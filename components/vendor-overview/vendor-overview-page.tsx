import { ChevronDown } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { withBasePath } from "@/lib/site";
import { VENDOR_STACKS, buildVendorStack, vendorStackGaps, type VendorStack } from "@/lib/stacks";
import type { Platform, Tool, UpdateEntry, VendorOverview } from "@/lib/types";
import { currentModels, domainCounts, formatPartialDate, overviewSources, relatedUpdates } from "@/lib/vendor-overview";
import { HubFaqs } from "@/components/hub-faqs";
import { StackMap } from "@/components/stack-map";
import { EntryCatalog } from "./entry-catalog";
import { EvolutionTimeline } from "./evolution-timeline";
import { ModelMap, PriceLadder } from "./model-map";
import { RelatedUpdates, SourceList } from "./panels";
import { OverviewSection } from "./primitives";
import { SectionNav, type SectionNavCluster } from "./section-nav";
import { StackHero } from "./stack-hero";
import { AslSteps, ChannelTree, CompanyBand, DomainTiles, EcosystemOrbit, PlanTags, RoadmapHorizon, TimelineRiver, TrustWall } from "./visuals";

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
  const industries = domain("industry-solutions");

  const clusters: SectionNavCluster[] = [
    { label: "Overview", links: [{ id: "overview", label: "The stack" }] },
    {
      label: "Products",
      links: [
        { id: "claude-models", label: "Models" },
        { id: "availability", label: "Where to run" },
        { id: "pricing", label: "Plans" },
        { id: "enterprise", label: "Trust & safety" },
        ...(industries ? [{ id: "industry-solutions", label: "Industries" }] : []),
      ],
    },
    {
      label: "Beyond Claude",
      links: [
        { id: "ecosystem", label: "Ecosystem" },
        { id: "company-partners", label: "Company" },
        { id: "timeline", label: "History" },
        { id: "roadmap", label: "What's next" },
      ],
    },
    {
      label: "Reference",
      links: [
        { id: "catalog", label: "All offerings" },
        { id: "market", label: "Market map" },
        { id: "faq", label: "FAQ" },
        { id: "sources", label: "Sources" },
      ],
    },
  ];

  const stats = [
    { label: "offerings", value: overview.entries.length },
    { label: "families", value: overview.domains.length },
    { label: "current models", value: current.length },
    { label: "ways to run", value: overview.availability.length },
    { label: "years of history", value: Number(overview.reviewedAt.slice(0, 4)) - Number([...overview.timeline].sort((a, b) => a.date.localeCompare(b.date))[0]?.date.slice(0, 4) ?? overview.reviewedAt.slice(0, 4)) },
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

      <section id="overview" aria-labelledby="overview-heading" className="vo-hero card-flat scroll-mt-[calc(var(--site-header-height)+4rem)] p-6 md:p-10">
        <StackHero overview={overview} stats={stats} sourcesCount={sources.length} />
        <details className="group/answer mt-8 border-t border-[var(--color-border)] pt-5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-[var(--color-text-primary)] [&::-webkit-details-marker]:hidden">
            <ChevronDown size={16} aria-hidden="true" className="text-[var(--color-text-secondary)] transition group-open/answer:rotate-180" />
            {overview.name} in one paragraph
          </summary>
          <p className="mt-3 max-w-4xl text-body-sm text-[var(--color-text-secondary)]">{overview.answer}</p>
        </details>
        <nav aria-label="Other vendor stacks" className="mt-5 flex flex-wrap gap-2 text-sm">
          {[
            ...VENDOR_STACKS.filter((other) => other.slug !== stack.slug).map((other) => ({ href: `/stacks/${other.slug}`, label: `${other.name} stack` })),
            { href: "/stacks", label: "All vendor stacks" },
          ].map((link) => (
            <a
              key={link.href}
              href={withBasePath(link.href)}
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </section>

      <SectionNav clusters={clusters} />

      <OverviewSection id="claude-models" eyebrow="Models" title="Every Claude model, on one map" intro={domain("claude-models")?.intro}>
        <div className="flex flex-col gap-10">
          <ModelMap models={overview.models} today={overview.reviewedAt} statusSource={overview.modelStatusSource} />
          <PriceLadder models={overview.models} />
        </div>
      </OverviewSection>

      <OverviewSection
        id="availability"
        eyebrow="Where to run"
        title={`${overview.availability.length} ways to get Claude`}
        intro="Buy direct, run it inside your cloud, or use it inside products you already have. Who operates the service decides who processes your data."
      >
        <ChannelTree availability={overview.availability} />
      </OverviewSection>

      <OverviewSection id="pricing" eyebrow="Plans" title="What it costs" intro="List prices in US dollars, as published. Each plan links to the page it was checked against.">
        <PlanTags plans={overview.plans} />
      </OverviewSection>

      <OverviewSection
        id="enterprise"
        eyebrow="Trust & safety"
        title="Can an enterprise trust it?"
        intro={
          <>
            Vendor-level controls across the commercial products, then the safety levels models ship under. Per-product posture:{" "}
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
        <div className="flex flex-col gap-10">
          <TrustWall rows={overview.governance} />
          {overview.safetyLevels.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h3 className="text-h3 text-[var(--color-text-primary)]">AI Safety Levels under the Responsible Scaling Policy</h3>
              <AslSteps levels={overview.safetyLevels} />
            </div>
          ) : null}
        </div>
      </OverviewSection>

      {industries ? (
        <OverviewSection id="industry-solutions" eyebrow="Industries" title={industries.label} intro={industries.tagline}>
          <DomainTiles domain={industries} entries={overview.entries} count={counts[industries.id]} />
        </OverviewSection>
      ) : null}

      <OverviewSection
        id="ecosystem"
        eyebrow="Beyond Claude"
        title={`What surrounds the products`}
        intro={`${overview.name} also writes open standards, publishes research and safety policy, and runs programs for learners, scientists and partners.`}
      >
        <EcosystemOrbit overview={overview} counts={counts} />
      </OverviewSection>

      <OverviewSection id="company-partners" eyebrow="Company" title={`${overview.name}, the company`} intro={domain("company-partners")?.tagline}>
        <CompanyBand company={overview.company} />
      </OverviewSection>

      <OverviewSection id="timeline" eyebrow="History" title={`How ${overview.name} got here`} intro={`${overview.timeline.length} events. Each dot is one; the larger ones are key milestones. Select a dot to read it.`}>
        <TimelineRiver events={overview.timeline} />
        <details className="group/history mt-8 border-t border-[var(--color-border)] pt-5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
            <ChevronDown size={16} aria-hidden="true" className="transition group-open/history:rotate-180" />
            Full history · {overview.timeline.length} events
          </summary>
          <div className="mt-5">
            <EvolutionTimeline overview={overview} />
          </div>
        </details>
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

      <OverviewSection id="roadmap" eyebrow="What's next" title="Announced plans" intro="Only what the vendor has said publicly, in its own words, with the date it said it.">
        <RoadmapHorizon items={overview.roadmap} />
      </OverviewSection>

      <OverviewSection
        id="catalog"
        eyebrow="Reference"
        title={`All ${overview.entries.length} offerings`}
        intro="Search or filter everything above. Each card shows status, launch year and its primary source; renamed products list former names."
      >
        <EntryCatalog overview={overview} />
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
