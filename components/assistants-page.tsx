import { BriefcaseBusiness } from "lucide-react";
import { PlatformCategoryBar } from "@/components/platform-category-bar";
import { ToolCard } from "@/components/tool-card";
import { WarningBox } from "@/components/warning-box";
import type { AssistantsSubcategory } from "@/lib/assistants-comparisons";
import { withBasePath } from "@/lib/site";
import type { Platform, Tool, UpdateEntry } from "@/lib/types";

const subcategoryOrder: AssistantsSubcategory[] = ["coding", "productivity", "build-your-own"];

const subcategoryLabels: Record<AssistantsSubcategory, string> = {
  coding: "Coding",
  productivity: "Productivity",
  "build-your-own": "Build Your Own",
};

function sortByName(tools: Tool[]) {
  return [...tools].sort((a, b) => a.name.localeCompare(b.name));
}

export function AssistantsPage({ title, description, tools, updates, platforms }: { title: string; description: string; tools: Tool[]; updates: UpdateEntry[]; platforms: Platform[] }) {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-[color:rgba(59,130,246,0.12)] p-3 text-[var(--color-primary)]">
            <BriefcaseBusiness size={28} />
          </div>
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight text-[var(--color-text-primary)]">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">{description}</p>
            <div className="mt-3 text-sm text-[var(--color-text-secondary)]">{tools.length} tools in current dataset</div>
          </div>
        </div>
      </section>

      <PlatformCategoryBar category="assistants" platforms={platforms} />

      <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 [content-visibility:auto] [contain-intrinsic-size:96px]">
        <div className="flex flex-wrap gap-2">
          {subcategoryOrder.map((subcategory) => (
            <a
              key={subcategory}
              href={`${withBasePath("/assistants")}#${subcategory}`}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              {subcategoryLabels[subcategory]}
            </a>
          ))}
        </div>
      </section>

      {subcategoryOrder.map((subcategory) => {
        const subcategoryTools = sortByName(tools.filter((tool) => tool.subcategory === subcategory));
        const vendorTools = subcategoryTools.filter((tool) => tool.type === "vendor");
        const nonVendorTools = subcategoryTools.filter((tool) => tool.type !== "vendor");
        const warnings = subcategoryTools.filter((tool) => tool.licenseWarning || tool.statusNote);

        return (
          <section key={subcategory} id={subcategory} className="scroll-mt-24 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:1400px]">
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-semibold">{subcategoryLabels[subcategory]} assistants</h2>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  Vendor and non-vendor tools tracked in the {subcategoryLabels[subcategory].toLowerCase()} assistants segment.
                </p>
              </div>

              <div>
                <h3 className="text-base font-semibold">Cloud vendor tools</h3>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {vendorTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} compact />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-base font-semibold">
                  {subcategory === "coding" ? "Commercial alternatives" : "Additional tools"}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {nonVendorTools.length > 0
                    ? `${nonVendorTools.length} tracked tools in this subcategory.`
                    : "No additional non-vendor tools are currently tracked in this subcategory."}
                </p>
                {nonVendorTools.length > 0 ? (
                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {nonVendorTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} compact />
                    ))}
                  </div>
                ) : null}
              </div>

              {warnings.length > 0 ? (
                <div>
                  <h3 className="text-base font-semibold">Important notes</h3>
                  <div className="mt-4 space-y-3">
                    {warnings.map((tool) => (
                      <WarningBox key={tool.id}>
                        <strong>{tool.name}:</strong> {tool.licenseWarning ?? tool.statusNote}
                      </WarningBox>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        );
      })}

      {updates.length > 0 ? (
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:360px]">
          <h2 className="text-lg font-semibold">Recent updates</h2>
          <div className="mt-4 space-y-4">
            {updates.slice(0, 5).map((update) => (
              <div key={update.id} className="border-l-2 border-[var(--color-primary)] pl-4">
                <div className="text-xs uppercase tracking-wide text-[var(--color-secondary)]">{update.date}</div>
                <div className="mt-1 font-semibold">{update.toolName}</div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{update.summary}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
