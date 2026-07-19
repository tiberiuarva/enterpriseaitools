import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { lastUpdated } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { githubRepoUrl, withBasePath } from "@/lib/site";

const PAGE_TITLE = "Editorial independence & corrections";
const PAGE_DESCRIPTION =
  "How placement is decided, how corrections are handled, how the project is funded, and what data it collects — a plain, factual note for the record.";
const LAST_REVIEWED = "2026-07-17";

const PLACEMENT_POINTS = [
  "Listing, position, and any future verdict or score are decided by data and written rules — not by payment.",
  "There are no listing fees, sponsored slots, or paid “verified” badges. A verification date reflects a review, not a purchase.",
  "No advertising, affiliate links, or referral revenue from listed vendors.",
];

const CORRECTION_STEPS = [
  "Open a public issue naming the record, the field, the value you believe is wrong, and the primary source that supports the correction.",
  "Corrections are resolved by comparing sources, in public, in the issue thread.",
  "License corrections follow a stricter path: the upstream LICENSE file is re-read and the record changes only after verification, with the change logged in the public feed.",
  "Vendors are welcome to correct facts about their own products this way.",
];

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/impartiality",
  modifiedTime: LAST_REVIEWED,
});

export default function ImpartialityPage() {
  const pageUrl = `${siteUrl}/impartiality/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "Editorial independence", url: pageUrl },
    ]),
    buildWebPageJsonLd({ name: PAGE_TITLE, url: pageUrl, description: PAGE_DESCRIPTION }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/impartiality">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <nav className="text-sm text-[var(--color-text-secondary)]">
          <a href={withBasePath("/")} className="text-[var(--color-primary)] hover:underline">
            Home
          </a>
          <span aria-hidden="true"> / </span>
          <span>Editorial independence</span>
        </nav>

        <section className="card-flat p-6 md:p-8">
          <h1 className="text-h1 text-[var(--color-text-primary)]">Editorial independence &amp; corrections</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            A short, factual note for the record: how placement is decided, how to correct something that is wrong, how
            the project is funded, and what it collects about you.
          </p>
          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
            Last reviewed <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time> · see also the{" "}
            <a href={withBasePath("/methodology")} className="text-[var(--color-primary)] hover:underline">
              methodology
            </a>{" "}
            and{" "}
            <a href={withBasePath("/inclusion-criteria")} className="text-[var(--color-primary)] hover:underline">
              inclusion criteria
            </a>
          </p>
        </section>

        <section id="placement" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Placement is not for sale</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
            {PLACEMENT_POINTS.map((point) => (
              <li key={point.slice(0, 40)}>{point}</li>
            ))}
          </ul>
        </section>

        <section id="corrections" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Corrections</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            If a fact is wrong, the fastest way to fix it is to show the source.
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
            {CORRECTION_STEPS.map((step) => (
              <li key={step.slice(0, 40)}>{step}</li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Start a correction in{" "}
            <a href={githubRepoUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
              the public repository
            </a>
            .
          </p>
        </section>

        <section id="funding" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">How it is funded and run</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            enterpriseai.tools is an open-source project (MIT-licensed, public repository) maintained by Tiberiu Arva and
            run on static hosting at low cost. It carries no ads and no paid tiers today. Should the project ever take
            funding — a donation, a grant, an acknowledged sponsor — it would be disclosed here and kept behind a firewall
            from the data: nothing that touches listing, placement, wording, or a future verdict or score is ever for sale.
          </p>
        </section>

        <section id="privacy" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">What it collects: nothing</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            No analytics, no tracking scripts, no cookies, no email capture. Pages are static files with no runtime
            third-party requests, so nothing phones home when you read them. Subscribing means RSS/Atom or the calendar
            feed, which identify nobody.
          </p>
        </section>

        <section id="accountability" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Accountability</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            The dataset is edited by a named maintainer —{" "}
            <a
              href="https://www.linkedin.com/in/tiberiuarva/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              Tiberiu Arva
            </a>{" "}
            — and every edit is attributable in the public git history.
          </p>
        </section>
      </main>
    </HomeShell>
  );
}
