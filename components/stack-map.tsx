import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, FOUNDATION_LINK, STACK_LAYERS, type LayerId } from "@/lib/categories";
import { getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import { VENDOR_STACKS, buildVendorStack, isCurrentTool, previewTools, type VendorStack } from "@/lib/stacks";
import type { Platform, Tool } from "@/lib/types";

type StackMapProps = {
  tools: Tool[];
  // Update-feed activity per tool id, used to pick recognisable examples.
  activity?: ReadonlyMap<string, number>;
  platforms: Platform[];
  // When set, each category shows this vendor's products instead of the market preview.
  vendor?: VendorStack;
  headingLevel?: "h2" | "h3";
};

const layerTone: Record<LayerId, string> = {
  build: "border-[var(--color-info)] bg-[var(--color-info-soft)]",
  control: "border-[var(--color-primary)] bg-[var(--color-primary-soft)]",
  use: "border-[var(--color-success)] bg-[var(--color-success-soft)]",
};

function ToolChip({ tool }: { tool: Tool }) {
  return (
    <li className="min-w-0 max-w-full">
      <a
        href={withBasePath(`/tools/${tool.id}`)}
        title={tool.name}
        className="block max-w-full truncate rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
      >
        {tool.name}
      </a>
    </li>
  );
}

// The site's map of the enterprise AI stack: three layers over the cloud
// foundation, each category with its tool count and example tools. Plain
// nested lists, so it reads correctly without CSS and to screen readers.
export function StackMap({ tools, activity, platforms, vendor, headingLevel = "h2" }: StackMapProps) {
  const Heading = headingLevel;
  const vendorRows = vendor ? buildVendorStack(vendor, tools) : null;
  const foundation = vendor ? platforms.filter((platform) => platform.id === vendor.platformId) : platforms;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3" aria-label={vendor ? `${vendor.name} products by stack layer` : "Enterprise AI stack layers"}>
        {[...STACK_LAYERS].reverse().map((layer) => {
          const cells = vendorRows?.find((row) => row.layer.id === layer.id)?.cells;
          return (
            <li key={layer.id} className={`rounded-2xl border-l-4 p-4 ${layerTone[layer.id]}`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:gap-6">
                <div className="lg:w-56 lg:shrink-0">
                  <Heading className="text-h3 text-[var(--color-text-primary)]">
                    <a href={withBasePath(layer.href)} className="inline-flex items-center gap-1 hover:text-[var(--color-primary)]">
                      {layer.label}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  </Heading>
                  <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">{layer.tagline}</p>
                </div>
                <ul className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {layer.categories.map((category) => {
                    const meta = CATEGORIES[category];
                    const total = tools.filter((tool) => tool.category === category && isCurrentTool(tool)).length;
                    const shown = cells ? cells.find((cell) => cell.category === category)?.tools ?? [] : previewTools(tools, category, 3, activity);
                    return (
                      <li key={category} className="card-flat flex min-w-0 flex-col gap-2 px-3 py-2.5 sm:py-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <a
                            href={withBasePath(`/${category}`)}
                            className="text-sm font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)]"
                          >
                            {meta.navLabel}
                          </a>
                          <span className="shrink-0 text-caption tabular-nums text-[var(--color-text-secondary)]">
                            {vendor ? `${shown.length} tracked` : `${total} ${total === 1 ? "tool" : "tools"}`}
                          </span>
                        </div>
                        {shown.length > 0 ? (
                          <ul className={`${vendor ? "flex" : "hidden sm:flex"} min-w-0 flex-wrap gap-1.5`} aria-label={vendor ? `${vendor.name} in ${meta.navLabel}` : `Examples in ${meta.navLabel}`}>
                            {shown.map((tool) => (
                              <ToolChip key={tool.id} tool={tool} />
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-[var(--color-text-secondary)]">
                            {vendor ? `No ${vendor.name} product tracked here yet.` : "No current tools tracked yet."}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
        <li className="rounded-2xl border-l-4 border-[var(--color-border-strong)] bg-[var(--color-bg-surface)] p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <div className="lg:w-56 lg:shrink-0">
              <Heading className="text-h3 text-[var(--color-text-primary)]">
                <a href={withBasePath(FOUNDATION_LINK.href)} className="inline-flex items-center gap-1 hover:text-[var(--color-primary)]">
                  {FOUNDATION_LINK.label}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              </Heading>
              <p className="mt-1 text-body-sm text-[var(--color-text-secondary)]">{FOUNDATION_LINK.tagline}</p>
            </div>
            <ul className="flex flex-wrap gap-2" aria-label="Cloud AI platforms">
              {foundation.map((platform) => (
                <li key={platform.id}>
                  <a
                    href={withBasePath(`/platforms#${getPlatformFragmentId(platform.id)}`)}
                    className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    {platform.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </li>
      </ul>
      {!vendor ? (
        <p className="text-body-sm text-[var(--color-text-secondary)]">
          See one vendor across every layer:{" "}
          {VENDOR_STACKS.map((stack, index) => (
            <span key={stack.slug}>
              {index > 0 ? " · " : null}
              <a href={withBasePath(`/stacks/${stack.slug}`)} className="font-medium text-[var(--color-primary)] hover:underline">
                {stack.name}
              </a>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
