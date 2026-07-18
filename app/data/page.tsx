import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildDataCatalogJsonLd } from "@/components/json-ld";
import { lastUpdated } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { githubRepoUrl, withBasePath } from "@/lib/site";

const PAGE_TITLE = "Open data & API — consume the dataset";
const PAGE_DESCRIPTION =
  "The full source-backed dataset as a versioned static JSON API, Atom feeds, shields.io badges, and llms.txt — free to consume, MIT-licensed, no key, no tracking, no paid placement.";
const LAST_REVIEWED = "2026-07-17";
const SCHEMA_URL = "https://github.com/tiberiuarva/enterpriseaitools/blob/main/data/SCHEMA.md";

const ENDPOINTS: { path: string; note: string }[] = [
  { path: "/api/v1/index.json", note: "Manifest: schema version, counts, every endpoint, and all tool ids" },
  { path: "/api/v1/tools.json", note: "All tracked tools with full source-backed governance posture" },
  { path: "/api/v1/platforms.json", note: "The cloud foundation platforms" },
  { path: "/api/v1/updates.json", note: "The full source-backed change log" },
  { path: "/api/v1/tools/crewai.json", note: "Any single tool by id (see index.json for the id list)" },
  { path: "/api/v1/badge/crewai/license.json", note: "shields.io endpoint badge — also status.json and verified.json" },
];

const FEEDS: { path: string; note: string }[] = [
  { path: "/updates.xml", note: "Site-wide updates feed (Atom)" },
  { path: "/updates-agents.xml", note: "Agents only — also orchestration, governance, assistants, platforms" },
  { path: "/updates-licenses.xml", note: "License changes only — the relicensing alert channel" },
  { path: "/eu-ai-act-deadlines.ics", note: "EU AI Act deadline calendar (iCalendar)" },
  { path: "/llms.txt", note: "Index for LLM agents; llms-full.txt is the whole site in one fetch" },
];

const STABILITY_RULES = [
  "Endpoints under /api/v1/ are additive: fields may be added, existing fields are not renamed or removed within v1.",
  "Record ids are permanent. A renamed product keeps its id; prior names are preserved as aliases.",
  "Every artifact is regenerated from the canonical dataset on each build and is deterministic — identical data produces identical files.",
  "Breaking changes would ship as /api/v2/ with v1 kept alive; there are currently no plans for a v2.",
];

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/data",
  modifiedTime: LAST_REVIEWED,
  atomFeedPath: "/updates.xml",
});

function LinkTable({ rows }: { rows: { path: string; note: string }[] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs uppercase tracking-wide text-[var(--color-text-secondary)]">
            <th scope="col" className="py-2 pr-4 font-semibold">
              URL
            </th>
            <th scope="col" className="py-2 font-semibold">
              What it is
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.path} className="border-b border-[var(--color-border)] last:border-b-0 align-top">
              <td className="py-2 pr-4">
                <a href={withBasePath(row.path)} className="font-mono text-xs text-[var(--color-primary)] hover:underline">
                  {row.path}
                </a>
              </td>
              <td className="py-2 text-[var(--color-text-secondary)]">{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DataPage() {
  const pageUrl = `${siteUrl}/data/`;
  const badgeExampleId = "crewai";
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "Open data & API", url: pageUrl },
    ]),
    buildDataCatalogJsonLd({
      name: "enterpriseai.tools open dataset",
      url: pageUrl,
      description: PAGE_DESCRIPTION,
      datasets: [
        {
          name: "Tools dataset",
          url: pageUrl,
          description: "Source-backed governance posture for every tracked enterprise AI tool.",
          downloadUrl: `${siteUrl}/api/v1/tools.json`,
        },
        {
          name: "Platforms dataset",
          url: pageUrl,
          description: "The cloud foundation platforms tracked as the enterprise AI base layer.",
          downloadUrl: `${siteUrl}/api/v1/platforms.json`,
        },
        {
          name: "Updates dataset",
          url: pageUrl,
          description: "Source-backed change log: releases, deprecations, license and certification changes.",
          downloadUrl: `${siteUrl}/api/v1/updates.json`,
        },
      ],
    }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/data">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <nav className="text-sm text-[var(--color-text-secondary)]">
          <a href={withBasePath("/")} className="text-[var(--color-primary)] hover:underline">
            Home
          </a>
          <span aria-hidden="true"> / </span>
          <span>Open data &amp; API</span>
        </nav>

        <section className="card-flat p-6 md:p-8">
          <h1 className="text-h1 text-[var(--color-text-primary)]">Open data &amp; API</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            The entire dataset behind this site is public: a versioned static JSON API, Atom feeds, embeddable badges,
            and llms.txt. No key, no rate-limit games, no tracking — and because there is{" "}
            <a href={withBasePath("/impartiality")} className="text-[var(--color-primary)] hover:underline">
              no paid placement
            </a>
            , what you pull is what the evidence supports.
          </p>
          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
            Last reviewed <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time> · dataset license: MIT (each record&apos;s
            own software license is a field on the record) · schema:{" "}
            <a href={SCHEMA_URL} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
              data/SCHEMA.md
            </a>
          </p>
        </section>

        <section className="card-flat p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">JSON API (static, versioned)</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Every endpoint is a build-time artifact — plain JSON on a CDN, cacheable forever, fetchable from browsers,
            CI jobs, and agents alike. Start at the manifest.
          </p>
          <LinkTable rows={ENDPOINTS} />
        </section>

        <section className="card-flat p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Feeds &amp; calendars</h2>
          <LinkTable rows={FEEDS} />
        </section>

        <section className="card-flat p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Embeddable badges</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Live, source-backed badges for any tracked tool via the{" "}
            <a
              href="https://shields.io/badges/endpoint-badge"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              shields.io endpoint schema
            </a>
            : <code className="font-mono text-xs">license</code>, <code className="font-mono text-xs">status</code>, and{" "}
            <code className="font-mono text-xs">verified</code> (the dated governance-review stamp). Drop this in a
            README:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-hover)] p-3 text-xs leading-5 text-[var(--color-text-primary)]">
            {`![license](https://img.shields.io/endpoint?url=${encodeURIComponent(`${siteUrl}/api/v1/badge/${badgeExampleId}/license.json`)})`}
          </pre>
          <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
            Swap <code className="font-mono">{badgeExampleId}</code> for any tool id from{" "}
            <a href={withBasePath("/api/v1/index.json")} className="text-[var(--color-primary)] hover:underline">
              the manifest
            </a>
            , and <code className="font-mono">license</code> for <code className="font-mono">status</code> or{" "}
            <code className="font-mono">verified</code>.
          </p>
        </section>

        <section className="card-flat p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Stability &amp; versioning</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
            {STABILITY_RULES.map((rule) => (
              <li key={rule.slice(0, 40)}>{rule}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Consuming the data somewhere interesting? Open an issue in{" "}
            <a href={githubRepoUrl} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline">
              the repository
            </a>{" "}
            — knowing what depends on v1 is how we keep the stability promise.
          </p>
        </section>
      </main>
    </HomeShell>
  );
}
