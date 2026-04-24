import { Bot, BriefcaseBusiness, GitBranch, ShieldCheck } from "lucide-react";
import { FilteredCategorySections } from "@/components/filtered-category-sections";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { PlatformCategoryBar } from "@/components/platform-category-bar";
import { RelatedHubs } from "@/components/related-hubs";
import { ToolCard } from "@/components/tool-card";
import { VendorToolsSection } from "@/components/vendor-tools-section";
import { WarningBox } from "@/components/warning-box";
import { siteUrl } from "@/lib/metadata";
import type { CategoryComparison } from "@/lib/category-comparisons";
import type { Platform, Tool, ToolCategory, UpdateEntry } from "@/lib/types";

type IconName = "bot" | "git-branch" | "shield-check" | "briefcase-business";

type CategoryPageProps = {
  category: ToolCategory;
  title: string;
  description: string;
  iconName: IconName;
  tools: Tool[];
  updates: UpdateEntry[];
  platforms: Platform[];
  comparison?: CategoryComparison;
  enableFiltering?: boolean;
};

const iconMap = {
  bot: Bot,
  "git-branch": GitBranch,
  "shield-check": ShieldCheck,
  "briefcase-business": BriefcaseBusiness,
} as const;

function sortByName(tools: Tool[]) {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

export function CategoryPage({ category, title, description, iconName, tools, updates, platforms, comparison, enableFiltering = false }: CategoryPageProps) {
  const Icon = iconMap[iconName];
  const vendorTools = sortByName(tools.filter((tool) => tool.type === "vendor"));
  const nonVendorTools = sortByName(tools.filter((tool) => tool.type !== "vendor"));
  const warningTools = sortByName(tools.filter((tool) => tool.licenseWarning || tool.statusNote));
  const visibleUpdates = updates.slice(0, 5);

  const pageUrl = `${siteUrl}/${category}/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: title, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({
      name: title,
      url: pageUrl,
      description,
    }),
    buildToolListJsonLd(tools, title, description, pageUrl),
  ];

  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[color:rgba(59,130,246,0.12)] p-3 text-[var(--color-primary)]">
            <Icon size={28} />
          </div>
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight text-[var(--color-text-primary)]">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
            <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{tools.length} tools in current dataset</div>
          </div>
        </div>
      </section>

      <PlatformCategoryBar category={category} platforms={platforms} headingLevel={3} />

      {enableFiltering ? (
        <FilteredCategorySections tools={tools} updates={updates} comparison={comparison} />
      ) : (
        <>
          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:1200px]">
            <h2 className="text-lg font-semibold">Open source and third-party tools</h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{nonVendorTools.length} tracked tools in this category.</p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {nonVendorTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} compact />
              ))}
            </div>
          </section>

          {warningTools.length > 0 ? (
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:320px]">
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
            <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:360px]">
              <h2 className="text-lg font-semibold">Recent updates</h2>
              <div className="mt-4 space-y-4">
                {visibleUpdates.map((update) => (
                  <div key={update.id} className="border-l-2 border-[var(--color-primary)] pl-4">
                    <div className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">{update.date}</div>
                    <div className="mt-1 font-semibold">{update.title ?? update.toolName}</div>
                    <div className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">{update.toolName}</div>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{update.summary}</p>
                    <a href={update.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">Source</a>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <VendorToolsSection
            vendorTools={vendorTools}
            comparison={comparison}
            showComparison={Boolean(comparison)}
            description={
              comparison
                ? "The vendor-specific detail sits below the broader category set so visitors can first understand the non-vendor landscape, then compare the native cloud offerings side by side."
                : "Vendor tool cards are grouped below the broader category set. Detailed vendor comparison rows are still being added for this category."
            }
          />

          <RelatedHubs
            currentPath={`/${category}`}
            title="Explore adjacent hubs"
            intro="Compare the active category against the platform foundation layer, the cross-category updates feed, and the sourcing/contribution guide."
            hubs={[
              {
                href: "/platforms",
                title: "Platforms",
                description: "Review Microsoft Foundry, AWS Bedrock, and Google Vertex AI as the foundation layer behind this category.",
              },
              {
                href: "/updates",
                title: "Weekly updates",
                description: "Check the changelog-style feed for releases, deprecations, acquisitions, and other notable market changes.",
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
