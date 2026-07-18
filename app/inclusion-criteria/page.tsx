import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { lastUpdated } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { githubRepoUrl, withBasePath } from "@/lib/site";

const PAGE_TITLE = "Inclusion criteria — what gets listed and why";
const PAGE_DESCRIPTION =
  "The objective rules for what enterpriseai.tools lists, labels, and removes: category fit, enterprise relevance, a resolvable primary source for every required field — and no way to buy a listing.";
const LAST_REVIEWED = "2026-07-17";

const INCLUSION_RULES = [
  "Category fit: the product belongs to a tracked category — agent frameworks, orchestration, governance/guardrails, assistants, or the cloud platform layer that powers them.",
  "Enterprise relevance: the product is plausibly adoptable by a regulated-enterprise team — production posture, governance surface, or a clear path to one.",
  "Public evidence: official documentation, a product page, or a maintained repository exists and is sufficient to describe the product accurately.",
  "Provenance: every required schema field can be populated from a resolvable primary source. If the required fields cannot be source-backed, the record waits.",
  "License clarity: the license can be read from the upstream LICENSE file. Ambiguous or contradictory licensing is disclosed with a warning, not smoothed over.",
];

const EXCLUSION_RULES = [
  "Research demos, unmaintained experiments, and stealth products without public product evidence.",
  "Products with no plausible enterprise adoption path (consumer-only tools, hobby projects).",
  "Coverage-for-coverage's-sake: this is a bounded, opinionated tracker, not an exhaustive AI directory.",
];

const STATUS_RULES = [
  "Archived or maintenance-mode projects that remain enterprise-relevant stay listed with an explicit status label — a deprecated tool still deployed in enterprises is exactly what a reader needs to see flagged.",
  "Records are removed (rather than status-labelled) only when public evidence disappears entirely, provenance re-verification fails permanently, or the product was out of scope to begin with.",
  "Removals and status changes are dated events in the public change feed, not silent deletions.",
];

const PROPOSAL_RULES = [
  "Anyone can propose a listing or a correction through the public repository — the proposal must satisfy every rule above and populate the schema's required fields with sources.",
  "Vendors may propose factual corrections to their own record with sources, exactly like anyone else.",
  "No fee, sponsorship, badge program, or relationship accelerates or influences listing, placement, or wording — see the impartiality policy.",
];

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/inclusion-criteria",
  modifiedTime: LAST_REVIEWED,
});

function RuleSection({ id, title, intro, rules }: { id: string; title: string; intro?: string; rules: string[] }) {
  return (
    <section id={id} className="card-flat scroll-mt-24 p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
      {intro ? <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{intro}</p> : null}
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
        {rules.map((rule) => (
          <li key={rule.slice(0, 40)}>{rule}</li>
        ))}
      </ul>
    </section>
  );
}

export default function InclusionCriteriaPage() {
  const pageUrl = `${siteUrl}/inclusion-criteria/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "Inclusion criteria", url: pageUrl },
    ]),
    buildWebPageJsonLd({ name: PAGE_TITLE, url: pageUrl, description: PAGE_DESCRIPTION }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/inclusion-criteria">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <nav className="text-sm text-[var(--color-text-secondary)]">
          <a href={withBasePath("/")} className="text-[var(--color-primary)] hover:underline">
            Home
          </a>
          <span aria-hidden="true"> / </span>
          <span>Inclusion criteria</span>
        </nav>

        <section className="card-flat p-6 md:p-8">
          <h1 className="text-h1 text-[var(--color-text-primary)]">Inclusion criteria</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            What gets listed on this site is decided by the written rules below — never by payment, partnership, or
            persuasion. The rules are deliberately objective so a reader can predict what belongs here and check our
            consistency against them.
          </p>
          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
            Last reviewed <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time> · see also the{" "}
            <a href={withBasePath("/methodology")} className="text-[var(--color-primary)] hover:underline">
              methodology
            </a>{" "}
            and the{" "}
            <a href={withBasePath("/impartiality")} className="text-[var(--color-primary)] hover:underline">
              impartiality policy
            </a>
          </p>
        </section>

        <RuleSection id="qualifies" title="What qualifies" rules={INCLUSION_RULES} />
        <RuleSection id="excluded" title="What stays out" rules={EXCLUSION_RULES} />
        <RuleSection
          id="status-and-removal"
          title="Status labels and removal"
          intro="Being listed is not an endorsement of health — status is tracked honestly and preserved."
          rules={STATUS_RULES}
        />
        <RuleSection
          id="proposing"
          title="Proposing a listing or correction"
          rules={PROPOSAL_RULES}
        />

        <section className="card-flat p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Where to propose</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Use the structured issue templates in{" "}
            <a href={githubRepoUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
              the repository
            </a>{" "}
            (Propose a tool, Data correction, License correction) or open a PR per the CONTRIBUTING guide — each
            requires the primary sources that back every field. CI validates schema, provenance, and license gates
            automatically before human review; proposals that fail are declined with the failing rule named.
          </p>
        </section>
      </main>
    </HomeShell>
  );
}
