import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/components/json-ld";
import { CATEGORY_ORDER } from "@/lib/categories";
import { lastUpdated, tools } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";
import { VENDOR_STACKS, buildVendorStack, countCoveredCategories, vendorStackTools } from "@/lib/stacks";

const title = "Enterprise AI stacks by vendor";
const description =
  "Compare what Microsoft, AWS and Google each offer across the enterprise AI stack, from cloud platform to control plane and assistants, with gaps shown.";

export const metadata: Metadata = buildMetadata({ title, description, path: "/stacks" });

export default function StacksIndexPage() {
  const pageUrl = `${siteUrl}/stacks/`;
  const summaries = VENDOR_STACKS.map((stack) => {
    const rows = buildVendorStack(stack, tools);
    return { stack, covered: countCoveredCategories(rows), products: vendorStackTools(rows).length };
  });
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: title, url: pageUrl },
    ]),
    buildCollectionPageJsonLd({ name: title, url: pageUrl, description }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/stacks">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="card-flat p-6 md:p-10">
          <h1 className="text-h1 text-[var(--color-text-primary)]">{title}</h1>
          <p className="mt-3 max-w-3xl text-body text-[var(--color-text-secondary)]">
            Most teams start from a cloud vendor they already use. Each page places that vendor&apos;s current products on the
            stack map and lists the categories where nothing of theirs is tracked yet.
          </p>
        </section>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {summaries.map(({ stack, covered, products }) => (
            <li key={stack.slug}>
              <a
                href={withBasePath(`/stacks/${stack.slug}`)}
                className="card group flex h-full flex-col gap-2 p-5 transition hover:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
              >
                <h2 className="inline-flex items-center gap-1 text-h3 text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                  {stack.name} stack
                  <ArrowUpRight size={16} aria-hidden="true" />
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {products} current products covering {covered} of {CATEGORY_ORDER.length} categories.
                </p>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </HomeShell>
  );
}
