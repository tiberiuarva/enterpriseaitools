import { CATEGORIES, STACK_LAYERS, layerForCategory } from "@/lib/categories";
import { withBasePath } from "@/lib/site";
import { pairsWith, vendorStackForTool } from "@/lib/stacks";
import type { Tool } from "@/lib/types";

type ToolStackContextProps = {
  tool: Tool;
  tools: Tool[];
};

// "Where it sits": the tool's layer and category in the stack, any other
// categories it covers, and the same vendor's products in other categories.
export function ToolStackContext({ tool, tools }: ToolStackContextProps) {
  const home = layerForCategory(tool.category);
  const covered = new Set([tool.category, ...(tool.alsoCovers ?? [])]);
  const pairs = pairsWith(tool, tools);
  const vendorStack = vendorStackForTool(tool);

  return (
    <section aria-labelledby="stack-context-heading" className="card-flat p-6">
      <h2 id="stack-context-heading" className="text-lg font-semibold text-[var(--color-text-primary)]">
        Where it sits in the stack
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
        Listed under{" "}
        <a href={withBasePath(`/${tool.category}`)} className="font-medium text-[var(--color-primary)] hover:underline">
          {CATEGORIES[tool.category].navLabel}
        </a>{" "}
        in the{" "}
        <a href={withBasePath(home.href)} className="font-medium text-[var(--color-primary)] hover:underline">
          {home.label}
        </a>{" "}
        layer.
        {tool.alsoCovers?.length
          ? ` Also covers ${tool.alsoCovers.map((category) => CATEGORIES[category].navLabel).join(", ")}.`
          : null}
      </p>

      <ol className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Stack layers, with this tool's categories highlighted">
        {STACK_LAYERS.map((layer) => (
          <li key={layer.id} className="rounded-xl border border-[var(--color-border)] p-3">
            <div className="text-caption uppercase tracking-wide text-[var(--color-text-secondary)]">{layer.label}</div>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {layer.categories.map((category) => {
                const active = covered.has(category);
                return (
                  <li key={category}>
                    <a
                      href={withBasePath(`/${category}`)}
                      aria-current={category === tool.category ? "true" : undefined}
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                        active
                          ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {active ? <span className="sr-only">Covers: </span> : null}
                      {CATEGORIES[category].navLabel}
                    </a>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>

      {pairs.length > 0 ? (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Pairs with, from {tool.vendor}</h3>
          <ul className="mt-2 flex flex-wrap gap-2">
            {pairs.map((pair) => (
              <li key={pair.id}>
                <a
                  href={withBasePath(`/tools/${pair.id}`)}
                  className="inline-flex flex-col rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm transition hover:border-[var(--color-primary)]"
                >
                  <span className="font-medium text-[var(--color-text-primary)]">{pair.name}</span>
                  <span className="text-xs text-[var(--color-text-secondary)]">{CATEGORIES[pair.category].navLabel}</span>
                </a>
              </li>
            ))}
          </ul>
          {vendorStack ? (
            <a
              href={withBasePath(`/stacks/${vendorStack.slug}`)}
              className="mt-3 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              See the full {vendorStack.name} stack
            </a>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
