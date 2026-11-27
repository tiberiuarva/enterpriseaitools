import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { CATEGORIES } from "@/lib/categories";
import { withBasePath } from "@/lib/site";
import { VENDOR_STACKS, buildVendorStack, type VendorStack } from "@/lib/stacks";
import type { Tool, UpdateEntry, VendorOverview } from "@/lib/types";
import { currentModels, domainCounts, formatPartialDate, formatUsd, overviewSources, relatedUpdates } from "@/lib/vendor-overview";
import { EntryCatalog } from "./entry-catalog";
import { EvolutionTimeline } from "./evolution-timeline";
import { ModelLineup, ModelMap } from "./model-map";
import { FaqList, SourceList } from "./panels";
import { OverviewSection, SourceLink } from "./primitives";
import { SectionNav, type SectionNavLink } from "./section-nav";
import { StackHero, type HeroStat } from "./stack-hero";
import { SECTION_FAQ_IDS, faqLead, flagshipName, planPriceRange, splitFaqs } from "@/lib/vendor-viz";
import { AslSteps, BeyondFlagship, ChannelTree, PlanTags, RoadmapStrip, TimelineRiver, TrustWall } from "./visuals";

type Props = {
  overview: VendorOverview;
  stack: VendorStack;
  tools: Tool[];
  updates: UpdateEntry[];
};

export function VendorOverviewPage({ overview, stack, tools, updates }: Props) {
  const counts = domainCounts(overview);
  const current = currentModels(overview.models);
  const sources = overviewSources(overview);
  const latest = relatedUpdates(overview, updates)[0];
  const stackRows = buildVendorStack(stack, tools);
  const stackCells = stackRows.flatMap((row) => row.cells);
  const tracked = stackCells.filter((cell) => cell.tools.length > 0);
  const faqs = splitFaqs(overview.faqs, SECTION_FAQ_IDS);
  const domain = (id: string) => overview.domains.find((candidate) => candidate.id === id);
  const toolLinks = overview.entries.filter((entry) => entry.toolId);
  const industries = domain("industry-solutions");
  const flagship = flagshipName(overview);
  const modelsDomain = domain("claude-models") ?? overview.domains.find((item) => item.cluster === "products");
  const batch = overview.entries.find((entry) => entry.id === "batch-api");
  // Pricing modifiers shown under the model tables, each from its own sourced entry.
  const priceNotes = ["batch-api", "prompt-caching"].flatMap((id) => {
    const entry = overview.entries.find((item) => item.id === id);
    return entry ? [{ text: `${entry.name}: ${entry.description}`, sourceUrl: entry.sourceUrl }] : [];
  });
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

  const navLinks: SectionNavLink[] = [
    { id: "claude-models", label: "Models" },
    { id: "pricing", label: "Plans" },
    { id: "availability", label: "Where to run" },
    { id: "enterprise", label: "Trust" },
    { id: "roadmap", label: "What's next" },
    { id: "timeline", label: "History" },
    { id: "catalog", label: "All offerings" },
  ];

  const lowestInput = Math.min(...current.flatMap((model) => (model.pricing ? [model.pricing.inputPerMTok] : [])));
  const individualRange = planPriceRange(overview.plans, ["individual"]);
  // Three headline numbers; channels and controls have their own sections and the tower's labels.
  const stats: HeroStat[] = [
    { value: current.length, label: "current models", detail: Number.isFinite(lowestInput) ? `from ${formatUsd(lowestInput)} per M input tokens` : undefined, href: "#claude-models" },
    {
      value: overview.plans.length,
      label: "plans",
      detail: individualRange ? `${formatUsd(individualRange.min)}–${formatUsd(individualRange.max)}/mo for individuals` : undefined,
      href: "#pricing",
    },
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
      </section>

      <SectionNav links={navLinks} />

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
            <ModelMap models={overview.models} today={overview.reviewedAt} statusSource={overview.modelStatusSource} label={`${flagship} model`} priceNotes={priceNotes} />
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
        <ChannelTree availability={overview.availability} hub={flagship} hubVendor={overview.name} />
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

      {overview.roadmap.length > 0 ? (
        <OverviewSection
          id="roadmap"
          eyebrow="What's next"
          title={`What has ${overview.name} said is coming?`}
          intro="Only public vendor statements, with the date each was made. Soonest first."
        >
          <RoadmapStrip items={overview.roadmap} />
        </OverviewSection>
      ) : null}

      <div id="more" className="flex items-center gap-4 pt-2 md:pt-4">
        <p className="text-caption uppercase tracking-[0.2em] text-[var(--color-text-tertiary)]">Go deeper</p>
        <span aria-hidden="true" className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <OverviewSection
        id="ecosystem"
        eyebrow={`Beyond ${flagship}`}
        title={`What does ${overview.name} do besides ${flagship}?`}
        intro={`Open standards, research, safety policy and programs${industries ? `, plus ${flagship} editions for specific sectors` : ""}.`}
      >
        <BeyondFlagship overview={overview} counts={counts} industries={industries} flagship={flagship} />
      </OverviewSection>

      <OverviewSection id="timeline" eyebrow="History" title={`How did ${overview.name} get here?`} intro={`${overview.timeline.length} events, one dot each; larger dots are key milestones.`}>
        <TimelineRiver events={overview.timeline} />
        <details className="group/history mt-6">
          <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
            <ChevronDown size={14} aria-hidden="true" className="transition group-open/history:rotate-180" />
            Full history · {overview.timeline.length} events
          </summary>
          <div className="mt-5">
            <EvolutionTimeline overview={overview} />
          </div>
        </details>
        {latest ? (
          <p className="mt-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-text-secondary)]">
            <span className="text-caption uppercase tracking-[0.12em] text-[var(--color-text-tertiary)]">Latest change</span>{" "}
            <time dateTime={latest.date} className="tabular-nums">
              {formatPartialDate(latest.date)}
            </time>
            :{" "}
            <a href={withBasePath(`/updates#${latest.id}`)} className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:underline">
              {latest.title ?? latest.summary}
            </a>{" "}
            ·{" "}
            <a href={withBasePath("/updates")} className="font-medium text-[var(--color-accent)] hover:underline">
              All updates →
            </a>
          </p>
        ) : null}
      </OverviewSection>

      <OverviewSection
        id="catalog"
        eyebrow="Product map"
        title={`All ${overview.entries.length} offerings`}
        intro="Every offering is a tile, and the bigger and bolder the tile, the more central the offering. Select one to see what it is, who it is for and its source. Everything is generally available unless marked."
      >
        <EntryCatalog overview={overview} flagship={flagship} />
      </OverviewSection>

      <OverviewSection
        id="market"
        eyebrow="Market map"
        title={`Where ${stack.name} sits on the enterprise AI stack`}
        intro={`${stack.name} products are tracked in ${tracked.length} of ${stackCells.length} categories of the map used for every vendor.`}
      >
        <ul className="flex flex-col divide-y divide-[var(--color-border)]">
          {tracked.map((cell) => (
            <li key={cell.category} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
              <a href={withBasePath(`/${cell.category}`)} className="shrink-0 text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:underline sm:w-56">
                {CATEGORIES[cell.category].navLabel}
              </a>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {cell.tools.map((tool, index) => (
                  <span key={tool.id}>
                    {index > 0 ? ", " : null}
                    <a href={withBasePath(`/tools/${tool.id}`)} className="hover:text-[var(--color-accent)] hover:underline">
                      {tool.name}
                    </a>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <a href={withBasePath("/stacks")} className="mt-3 inline-flex text-sm font-medium text-[var(--color-accent)] hover:underline">
          Compare vendors on the full map →
        </a>
      </OverviewSection>

      <OverviewSection id="faq" eyebrow="FAQ" title={`More questions about ${overview.name} and ${flagship}`}>
        <FaqList faqs={faqs.more} />
        {faqs.asked.length > 0 ? (
          <details className="group/asked mt-3">
            <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline [&::-webkit-details-marker]:hidden">
              <ChevronDown size={14} aria-hidden="true" className="transition group-open/asked:rotate-180" />
              Full answers to the {faqs.asked.length} questions asked above
            </summary>
            <div className="mt-2">
              <FaqList faqs={faqs.asked} />
            </div>
          </details>
        ) : null}
      </OverviewSection>

      <OverviewSection id="sources" eyebrow="Sources" title="Every source on this page" intro={`${sources.length} distinct primary sources, each checked on or before ${formatPartialDate(overview.reviewedAt)}.`}>
        <SourceList sources={sources} />
      </OverviewSection>

      <nav aria-label="Other vendor stacks" className="flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-1 text-caption uppercase tracking-[0.14em] text-[var(--color-text-tertiary)]">Other vendor stacks</span>
        {[
          ...VENDOR_STACKS.filter((other) => other.slug !== stack.slug).map((other) => ({ href: `/stacks/${other.slug}`, label: other.name })),
          { href: "/stacks", label: "All" },
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
    </>
  );
}
