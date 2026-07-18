import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { lastUpdated } from "@/lib/data";
import { FRESHNESS_THRESHOLD_DAYS } from "@/lib/freshness";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { githubRepoUrl, withBasePath } from "@/lib/site";

const PAGE_TITLE = "Methodology — how the data is verified";
const PAGE_DESCRIPTION =
  "How the dataset is verified: a primary source on every claim, licenses read from upstream LICENSE files, weekly updates, and dated verification on every record.";
const LAST_REVIEWED = "2026-07-17";

const SECTIONS: { id: string; title: string; paragraphs: string[]; bullets?: string[] }[] = [
  {
    id: "source-backed",
    title: "Source-backed or not published",
    paragraphs: [
      "Every factual claim in the dataset carries a primary-source URL — official documentation, the canonical repository, a vendor release note, or an official regulatory text. If a claim cannot be traced to a verifiable source, it is left out rather than guessed. Automated validators reject records with missing provenance before anything is published.",
    ],
    bullets: [
      "Governance claims (data residency, audit logging, SOC 2, ISO 27001, ISO 42001, EU AI Act tier, license risk) require a source URL whenever a fact is asserted; an honest “unknown” with a stated reason is preferred over an unsourced “yes”.",
      "Update-feed entries always carry the source that reported the change.",
      "Secondary summaries never substitute for primary sources.",
    ],
  },
  {
    id: "license-verification",
    title: "License verification",
    paragraphs: [
      "License accuracy is treated as a release-blocking invariant, not a metadata detail. Labels are read from the upstream LICENSE file of the actual repository, not from marketing pages or package registries.",
    ],
    bullets: [
      "Any non-OSI-approved clause — Commons Clause, BSL/BUSL, SSPL, Elastic License, “source-available” terms — gets a plain-language warning on the record.",
      "License corrections never happen silently: a discrepancy opens a public data-correction issue with the evidence, and the field changes only after verification.",
      "Mislabelling source-available code as MIT is treated as a release blocker.",
    ],
  },
  {
    id: "freshness",
    title: "Freshness and the weekly update cadence",
    paragraphs: [
      "The dataset is refreshed on a weekly cadence: a scan for source-backed changes (releases, license changes, deprecations, certifications, renames, acquisitions) feeds the updates log, and dataset snapshots are diffed so routine drift is auto-detected rather than manually noticed.",
      `Every tool record carries a dated “verified” stamp from its last governance review. A record whose review is older than ${FRESHNESS_THRESHOLD_DAYS} days is visibly flagged as stale on its page — staleness is disclosed, never hidden.`,
    ],
  },
  {
    id: "naming",
    title: "Canonical naming",
    paragraphs: [
      "Products are rendered under their current canonical name; prior names are preserved as aliases so external links and searches keep resolving after vendor rebrands. Renames are recorded as dated events in the change feed.",
    ],
  },
  {
    id: "review-process",
    title: "Review process and auditability",
    paragraphs: [
      "Every change — data, copy, or code — ships through a reviewed pull request in the public repository, so the full history of every claim is auditable in git. Automated gates validate schema conformance, provenance, license flags, and generated artifacts before anything merges.",
    ],
  },
  {
    id: "future",
    title: "What will be added to this page",
    paragraphs: [
      "When the maturity radar (editorial adopt/trial/assess/hold verdicts) and the reproducible readiness score ship, their criteria and formulas will be published here in full before either appears on a tool page. The verdict will be editorial, dated, and evidence-backed; the score will be mechanical, versioned, and reproducible from published rules — and the two will stay clearly distinguished.",
    ],
  },
];

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/methodology",
  modifiedTime: LAST_REVIEWED,
});

export default function MethodologyPage() {
  const pageUrl = `${siteUrl}/methodology/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "Methodology", url: pageUrl },
    ]),
    buildWebPageJsonLd({ name: PAGE_TITLE, url: pageUrl, description: PAGE_DESCRIPTION }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/methodology">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <nav className="text-sm text-[var(--color-text-secondary)]">
          <a href={withBasePath("/")} className="text-[var(--color-primary)] hover:underline">
            Home
          </a>
          <span aria-hidden="true"> / </span>
          <span>Methodology</span>
        </nav>

        <section className="card-flat p-6 md:p-8">
          <h1 className="text-h1 text-[var(--color-text-primary)]">Methodology</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            How the dataset behind this site is gathered, verified, and kept current. The short version: a primary
            source on every claim, licenses read from the upstream LICENSE file, a weekly update cadence with dated
            verification on every record, and every change auditable in a public git history.
          </p>
          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
            Last reviewed <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time> · see also{" "}
            <a href={withBasePath("/inclusion-criteria")} className="text-[var(--color-primary)] hover:underline">
              inclusion criteria
            </a>{" "}
            and the{" "}
            <a href={withBasePath("/impartiality")} className="text-[var(--color-primary)] hover:underline">
              impartiality policy
            </a>
          </p>
        </section>

        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="card-flat scroll-mt-24 p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                {section.bullets.map((bullet) => (
                  <li key={bullet.slice(0, 40)}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <section className="card-flat p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Check the work</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            The dataset, the schema that governs it, the validators that enforce these rules, and the full change
            history are public in{" "}
            <a href={githubRepoUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
              the repository
            </a>
            . If a claim looks wrong, the{" "}
            <a href={withBasePath("/impartiality")} className="text-[var(--color-primary)] hover:underline">
              correction path
            </a>{" "}
            explains how to challenge it with sources.
          </p>
        </section>
      </main>
    </HomeShell>
  );
}
