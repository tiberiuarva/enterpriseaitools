import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { CATEGORIES } from "@/lib/categories";
import { withBasePath } from "@/lib/site";
import { VENDOR_STACKS, buildVendorStack, vendorStackGaps, type VendorStack } from "@/lib/stacks";
import type { Platform, Tool, UpdateEntry, VendorOverview } from "@/lib/types";
import { currentModels, domainCounts, formatPartialDate, formatUsd, overviewSources, relatedUpdates } from "@/lib/vendor-overview";
import { HubFaqs } from "@/components/hub-faqs";
import { StackMap } from "@/components/stack-map";
import { EntryCatalog } from "./entry-catalog";
import { EvolutionTimeline } from "./evolution-timeline";
import { ModelLineup, ModelMap } from "./model-map";
import { RelatedUpdates, SourceList } from "./panels";
import { OverviewSection, SourceLink } from "./primitives";
import { SectionNav, type SectionNavCluster } from "./section-nav";
import { StackHero, type HeroStat } from "./stack-hero";
import { faqLead, flagshipName, governanceSummary, planPriceRange } from "@/lib/vendor-viz";
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
  const flagship = flagshipName(overview);
  const modelsDomain = domain("claude-models") ?? overview.domains.find((item) => item.cluster === "products");
  const batch = overview.entries.find((entry) => entry.id === "batch-api");
  // Section headings ask the questions the page's own FAQ answers; the lead
  // line is that answer's first sentence, with its source.
  const question = (faqId: string, fallback: string) => faqLead(overview.faqs, faqId)?.question ?? fallback;
  const lead = (faqId: string, fallback?: ReactNode): ReactNode => {
    const item = faqLead(overview.faqs, faqId);
    if (!item) return fallback;
    return (
      <>
        {item.lead} {item.sourceUrl ? <SourceLink href={item.sourceUrl} /> : null}
      </>
    );
  };
  // A sub-question answered inline, for sections that carry more than one.
  const qa = (faqId: string): ReactNode => {
    const item = faqLead(overview.faqs, faqId);
    if (!item) return null;
    return (
      <span className="block">
        <span className="font-semibold text-[var(--color-text-primary)]">{item.question}</span> {item.lead}{" "}
        {item.sourceUrl ? <SourceLink href={item.sourceUrl} /> : null}
      </span>
    );
  };

  const clusters: SectionNavCluster[] = [
    { label: "Overview", links: [{ id: "overview", label: "The stack" }] },
    {
      label: "Products",
      links: [
        { id: "claude-models", label: "Models" },
        { id: "pricing", label: "Plans" },
        { id: "availability", label: "Where to run" },
        { id: "enterprise", label: "Trust & safety" },
        ...(industries ? [{ id: "industry-solutions", label: "Industries" }] : []),
      ],
    },
    {
      label: `Beyond ${flagship}`,
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

  const lowestInput = Math.min(...current.flatMap((model) => (model.pricing ? [model.pricing.inputPerMTok] : [])));
  const individualRange = planPriceRange(overview.plans, ["individual"]);
  const governance = governanceSummary(overview.governance);
  const directOrCloud = overview.availability.filter((item) => item.channel !== "partner").length;
  const stats: HeroStat[] = [
    { value: current.length, label: "current models", detail: Number.isFinite(lowestInput) ? `from ${formatUsd(lowestInput)} per M input tokens` : undefined, href: "#claude-models" },
    {
      value: overview.plans.length,
      label: "plans",
      detail: individualRange ? `${formatUsd(individualRange.min)}–${formatUsd(individualRange.max)}/mo for individuals` : undefined,
      href: "#pricing",
    },
    { value: overview.availability.length, label: "ways to run", detail: `${directOrCloud} direct or via a cloud provider`, href: "#availability" },
    { value: governance.counts.yes, label: `of ${overview.governance.length} controls in place`, href: "#enterprise" },
    { value: overview.entries.length, label: "offerings", detail: `in ${overview.domains.length} families`, href: "#catalog" },
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

      <OverviewSection
        id="claude-models"
        eyebrow={`${flagship} today`}
        title={question("best-model", `Which ${flagship} model should I use?`)}
        intro={lead("best-model", modelsDomain?.intro)}
      >
        <div className="flex flex-col gap-10">
          <ModelLineup
            models={overview.models}
            today={overview.reviewedAt}
            footnote={batch ? { text: `${batch.name}: ${batch.description}`, sourceUrl: batch.sourceUrl } : undefined}
          />
          <div className="flex flex-col gap-3">
            <h3 className="text-h3 text-[var(--color-text-primary)]">Every {flagship} model, on one map</h3>
            <ModelMap models={overview.models} today={overview.reviewedAt} statusSource={overview.modelStatusSource} label={`${flagship} model`} />
          </div>
        </div>
      </OverviewSection>

      <OverviewSection id="pricing" eyebrow="Plans" title={`What does ${flagship} cost?`} intro={lead("plans", "List prices in US dollars, as published.")}>
        <PlanTags plans={overview.plans} />
      </OverviewSection>

      <OverviewSection
        id="availability"
        eyebrow="Where to run"
        title={question("where-run", `Where can I run ${flagship}?`)}
        intro={lead("where-run", "Buy direct, run it inside your cloud, or use it inside products you already have.")}
      >
        <ChannelTree availability={overview.availability} hub={flagship} />
      </OverviewSection>

      <OverviewSection
        id="enterprise"
        eyebrow="Trust & safety"
        title="Can an enterprise trust it?"
        intro={
          <>
            {qa("training-data")}
            {qa("eu-residency")}
          </>
        }
      >
        <div className="flex flex-col gap-10">
          <TrustWall rows={overview.governance} />
          <p className="-mt-6 text-caption text-[var(--color-text-tertiary)]">
            Per-product governance posture:{" "}
            {toolLinks.map((entry, index) => (
              <span key={entry.id}>
                {index > 0 ? ", " : null}
                <a href={withBasePath(`/tools/${entry.toolId}`)} className="font-medium text-[var(--color-accent)] hover:underline">
                  {entry.name}
                </a>
              </span>
            ))}
            .
          </p>
          {overview.safetyLevels.length > 0 ? (
            <div className="flex flex-col gap-3">
              <h3 className="text-h3 text-[var(--color-text-primary)]">AI Safety Levels under the Responsible Scaling Policy</h3>
              <AslSteps levels={overview.safetyLevels} />
            </div>
          ) : null}
        </div>
      </OverviewSection>

      {industries ? (
        <OverviewSection id="industry-solutions" eyebrow={industries.label} title={`Is there a ${flagship} for my sector?`} intro={industries.tagline}>
          <DomainTiles domain={industries} entries={overview.entries} count={counts[industries.id]} />
        </OverviewSection>
      ) : null}

      <OverviewSection
        id="ecosystem"
        eyebrow={`Beyond ${flagship}`}
        title={`What does ${overview.name} do besides ${flagship}?`}
        intro={`${overview.name} also writes open standards, publishes research and safety policy, and runs programs for learners, scientists and partners.`}
      >
        <EcosystemOrbit overview={overview} counts={counts} flagship={flagship} />
      </OverviewSection>

      <OverviewSection
        id="company-partners"
        eyebrow="Company"
        title={question("what-is-anthropic", `Who is ${overview.name}?`)}
        intro={lead("what-is-anthropic", domain("company-partners")?.tagline)}
      >
        <CompanyBand company={overview.company} />
      </OverviewSection>

      <OverviewSection id="timeline" eyebrow="History" title={`How did ${overview.name} get here?`} intro={`${overview.timeline.length} events. Each dot is one; the larger ones are key milestones. Select a dot to read it.`}>
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

      <OverviewSection
        id="roadmap"
        eyebrow="What's next"
        title={`What has ${overview.name} said is coming?`}
        intro="Only what the vendor has said publicly, in its own words, with the date it said it."
      >
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
          title={`Questions about ${overview.name} and ${flagship}`}
          headingId="faq-heading"
        />
      </div>

      <OverviewSection id="sources" eyebrow="Sources" title="Every source on this page" intro={`${sources.length} distinct primary sources, each checked on or before ${formatPartialDate(overview.reviewedAt)}.`}>
        <SourceList sources={sources} />
      </OverviewSection>
    </>
  );
}
