import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd, buildToolListJsonLd } from "@/components/json-ld";
import { StackMap } from "@/components/stack-map";
import { CATEGORIES, CATEGORY_ORDER } from "@/lib/categories";
import { lastUpdated, platforms, tools, updateCountByTool } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import { VENDOR_STACKS, buildVendorStack, countCoveredCategories, getVendorStack, vendorStackGaps, vendorStackTools } from "@/lib/stacks";

export function generateStaticParams(): { vendor: string }[] {
  return VENDOR_STACKS.map((stack) => ({ vendor: stack.slug }));
}

export const dynamicParams = false;

function describe(name: string) {
  return `What ${name} offers at each layer of the enterprise AI stack, from its cloud platform to agents, control plane and assistants, with gaps shown.`;
}

export async function generateMetadata({ params }: { params: Promise<{ vendor: string }> }): Promise<Metadata> {
  const { vendor } = await params;
  const stack = getVendorStack(vendor);
  if (!stack) notFound();
  return buildMetadata({ title: `${stack.name} enterprise AI stack`, description: describe(stack.name), path: `/stacks/${stack.slug}` });
}

export default async function VendorStackPage({ params }: { params: Promise<{ vendor: string }> }) {
  const { vendor } = await params;
  const stack = getVendorStack(vendor);
  if (!stack) notFound();

  const rows = buildVendorStack(stack, tools);
  const covered = countCoveredCategories(rows);
  const gaps = vendorStackGaps(rows);
  const vendorTools = vendorStackTools(rows);
  const title = `${stack.name} enterprise AI stack`;
  const pageUrl = `${siteUrl}/stacks/${stack.slug}/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: title, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({ name: title, url: pageUrl, description: describe(stack.name) }),
    buildToolListJsonLd(vendorTools, title, describe(stack.name), pageUrl),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath={`/stacks/${stack.slug}`}>
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="card-flat p-6 md:p-10">
          <p className="text-caption uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Vendor stack</p>
          <h1 className="mt-3 text-h1 text-[var(--color-text-primary)]">{title}</h1>
          <p className="mt-3 max-w-3xl text-body text-[var(--color-text-secondary)]">
            The {vendorTools.length} current {stack.name} products tracked here, placed on the same stack map as the rest of the market.
            They cover {covered} of {CATEGORY_ORDER.length} categories. Suites appear in every category they cover, and an empty
            category means nothing from {stack.name} is tracked there yet, not that the capability does not exist.
          </p>
          <nav aria-label="Other vendor stacks" className="mt-4 flex flex-wrap gap-2 text-sm">
            {VENDOR_STACKS.filter((other) => other.slug !== stack.slug).map((other) => (
              <a
                key={other.slug}
                href={withBasePath(`/stacks/${other.slug}`)}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-3 py-1.5 font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {other.name} stack
              </a>
            ))}
          </nav>
        </section>

        <StackMap tools={tools} activity={updateCountByTool} platforms={platforms} vendor={stack} />

        {gaps.length > 0 ? (
          <section aria-labelledby="stack-gaps-heading" className="card-flat p-6">
            <h2 id="stack-gaps-heading" className="text-h2 text-[var(--color-text-primary)]">
              Where to look beyond {stack.name}
            </h2>
            <p className="mt-2 max-w-3xl text-body-sm text-[var(--color-text-secondary)]">
              No {stack.name} product is tracked in these categories. Compare the independent and open source options there.
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
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
          </section>
        ) : null}
      </main>
    </HomeShell>
  );
}
