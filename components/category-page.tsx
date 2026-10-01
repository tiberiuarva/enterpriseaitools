import { Activity, ArrowUpRight, Bot, BriefcaseBusiness, Fingerprint, GitBranch, LayoutDashboard, Network, Radio, ShieldCheck } from "lucide-react";
import { FilteredCategorySections } from "@/components/filtered-category-sections";
import { HubFaqs } from "@/components/hub-faqs";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildFaqPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { PlatformCategoryBar } from "@/components/platform-category-bar";
import { RelatedComparisons } from "@/components/related-comparisons";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolCard } from "@/components/tool-card";
import { WarningBox } from "@/components/warning-box";
import type { ComparisonPair } from "@/lib/comparisons";
import type { HubFaq } from "@/lib/hub-faqs";
import { siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import { CATEGORIES, layerForCategory, type CategoryIconName as IconName } from "@/lib/categories";
import type { CategoryComparison } from "@/lib/category-comparisons";
import type { Platform, Tool, ToolCategory, UpdateEntry } from "@/lib/types";

type CategoryPageProps = {
  category: ToolCategory;
  title: string;
  description: string;
  introParagraphs?: string[];
  iconName: IconName;
  tools: Tool[];
  updates: UpdateEntry[];
  platforms: Platform[];
  comparison?: CategoryComparison;
  enableFiltering?: boolean;
  faqs?: HubFaq[];
  relatedPairs?: ComparisonPair[];
  // Tools listed in another category that also cover this one (`alsoCovers`).
  alsoCoveredBy?: Tool[];
};

const iconMap = {
  bot: Bot,
  "git-branch": GitBranch,
  "shield-check": ShieldCheck,
  "briefcase-business": BriefcaseBusiness,
  radio: Radio,
  "layout-dashboard": LayoutDashboard,
  fingerprint: Fingerprint,
  activity: Activity,
  network: Network,
} as const satisfies Record<IconName, unknown>;

function sortByName(tools: Tool[]) {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

export function CategoryPage({ category, title, description, introParagraphs, iconName, tools, updates, platforms, comparison, enableFiltering = false, faqs, relatedPairs = [], alsoCoveredBy = [] }: CategoryPageProps) {
  const Icon = iconMap[iconName];
  const vendorTools = sortByName(tools.filter((tool) => tool.type === "vendor"));
  const nonVendorTools = sortByName(tools.filter((tool) => tool.type !== "vendor"));
  const warningTools = sortByName(tools.filter((tool) => tool.licenseWarning || tool.statusNote));
  const visibleUpdates = updates.slice(0, 5);

  const pageUrl = `${siteUrl}/${category}/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: layerForCategory(category).title, url: `${siteUrl}${layerForCategory(category).href}/` },
      { name: title, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({
      name: title,
      url: pageUrl,
      description,
    }),
    buildToolListJsonLd(tools, title, description, pageUrl),
    ...(faqs && faqs.length > 0 ? [buildFaqPageJsonLd(faqs)] : []),
  ];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <JsonLd data={jsonLd} />
      <section className="card-flat p-6 md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="flex items-start gap-3">
            <Icon size={20} aria-hidden="true" className="mt-2 shrink-0 text-[var(--color-text-secondary)]" />
            <div className="max-w-2xl">
              <a
                href={withBasePath(layerForCategory(category).href)}
                className="text-caption uppercase tracking-[0.12em] text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)]"
              >
                {layerForCategory(category).label} layer
              </a>
              <h1 className="mt-1 text-h1 text-[var(--color-text-primary)]">{title}</h1>
              <p className="mt-3 text-body text-[var(--color-text-secondary)]">{description}</p>
              {introParagraphs && introParagraphs.length > 0 ? (
                <div className="mt-3 space-y-3 text-body-sm text-[var(--color-text-secondary)]">
                  {introParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <dl className="grid shrink-0 grid-cols-1 gap-2 md:text-right">
            <div>
              <dt className="text-caption uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">In dataset</dt>
              <dd className="text-h2 text-[var(--color-text-primary)]">{tools.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {alsoCoveredBy.length > 0 ? (
        <section aria-labelledby="also-covers-heading" className="card-flat p-6">
          <h2 id="also-covers-heading" className="text-lg font-semibold">
            Also covers this
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Suites listed under another category that include this capability too.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {sortByName(alsoCoveredBy).map((tool) => (
              <li key={tool.id}>
                <a
                  href={withBasePath(`/tools/${tool.id}`)}
                  className="inline-flex flex-col rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm transition hover:border-[var(--color-primary)]"
                >
                  <span className="font-medium text-[var(--color-text-primary)]">{tool.name}</span>
                  <span className="text-xs text-[var(--color-text-tertiary)]">{CATEGORIES[tool.category].navLabel}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {enableFiltering ? (
        <FilteredCategorySections
          category={category}
          tools={tools}
          updates={updates}
          platforms={platforms}
          comparison={comparison}
          faqs={faqs}
          relatedPairs={relatedPairs}
        />
      ) : (
        <>
          <PlatformCategoryBar category={category} platforms={platforms} />
          {vendorTools.length > 0 ? (
            <section className="card-flat p-6">
              <h2 className="text-lg font-semibold">Major vendor tools</h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                {comparison
                  ? "Compare the cloud-native vendor offerings first, then use the broader open source and third-party list below to assess alternatives."
                  : "Cloud-native vendor tools are grouped first here, with the broader open source and third-party landscape listed below."}
              </p>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {vendorTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} compact />
                ))}
              </div>
            </section>
          ) : null}
          <section className="card-flat p-6">
            <h2 className="text-lg font-semibold">Open source and third-party tools</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{nonVendorTools.length} tracked tools in this category.</p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {nonVendorTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} compact />
              ))}
            </div>
          </section>

          {warningTools.length > 0 ? (
            <section className="card-flat p-6">
              <h2 className="text-lg font-semibold">Important notes</h2>
              <div className="mt-4 space-y-3">
                {warningTools.map((tool) => (
                  <WarningBox key={tool.id}>
                    <strong>{tool.name}:</strong> {tool.licenseWarning ?? tool.statusNote}
                  </WarningBox>
                ))}
              </div>
            </section>
          ) : null}

          {updates.length > 0 ? (
            <section className="card-flat p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">Recent updates</h2>
                <a
                  href={`${withBasePath("/updates")}#auto-detected`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
                >
                  See auto-detected changes
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
              <div className="mt-4 space-y-4">
                {visibleUpdates.map((update) => (
                  <div key={update.id} className="border-l-2 border-[var(--color-primary)] pl-4">
                    <div className="text-caption uppercase tracking-wide text-[var(--color-text-tertiary)]">{update.date}</div>
                    <div className="mt-1 font-semibold">{update.title ?? update.toolName}</div>
                    <div className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">{update.toolName}</div>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{update.summary}</p>
                    <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">Source</a>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <RelatedComparisons pairs={relatedPairs} title="Popular comparisons in this category" />

          {faqs && faqs.length > 0 ? <HubFaqs faqs={faqs} /> : null}

          <RelatedHubs
            currentPath={`/${category}`}
            title="Explore adjacent hubs"
            intro="Compare the active category against the platform foundation layer, the cross-category updates feed, and the sourcing/contribution guide."
            hubs={[
              {
                href: "/platforms",
                title: "Platforms",
                description: "Review Microsoft Foundry, Amazon Bedrock, and Gemini Enterprise Agent Platform as the foundation layer behind this category.",
              },
              {
                href: "/updates",
                title: "Weekly updates",
                description: "Check the market-intelligence feed for high-impact moves, plus the expandable full log for releases, deprecations, acquisitions, and other notable changes.",
              },
              {
                href: "/about",
                title: "About and contribution rules",
                description: "See sourcing standards, contribution rules, and project scope before adding or updating tracked tools.",
              },
            ]}
          />
        </>
      )}
    </main>
  );
}
