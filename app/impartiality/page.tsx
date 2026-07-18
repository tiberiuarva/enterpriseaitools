import type { Metadata } from "next";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { lastUpdated } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { githubRepoUrl, withBasePath } from "@/lib/site";

const PAGE_TITLE = "Impartiality — nothing here can be bought";
const PAGE_DESCRIPTION =
  "The permanent no-pay-to-play policy: no listing fees, no sponsored placement, no paid badges, no vendor influence — and a public, source-based correction path for disputed facts.";
const LAST_REVIEWED = "2026-07-17";

const POLICY_POINTS = [
  "No listing fees. No product has ever paid to be listed, and none can.",
  "No sponsored placement or ranking. Position on any page is determined by data and written rules, never by spend.",
  "No paid badges or “verified” programs. A verification date on a record reflects our review, not a vendor purchase.",
  "No advertising, no affiliate links, no referral revenue from any listed vendor.",
  "No vendor influence on verdicts. When editorial assessments ship, they will carry a dated rationale and the same no-vendor-influence rule.",
];

const PRIVACY_POINTS = [
  "No analytics and no tracking scripts — we cannot see who you are, and we do not want to.",
  "No cookies, no email capture, no lead funnel. Subscribing means RSS/Atom or the calendar feed, which identify nobody.",
  "No runtime third-party requests: pages are static files, and nothing phones home when you read them.",
];

const CORRECTION_STEPS = [
  "Open a public issue in the repository naming the record, the field, the value you believe is wrong, and the primary source that supports the correction.",
  "Corrections are resolved by comparing sources, in public, in the issue thread — never by who is asking or what they spend.",
  "License corrections follow a stricter path: the upstream LICENSE file is re-read and the record changes only after verification, with the change logged in the public feed.",
  "Vendors are welcome to correct facts about their own products this way. Facts can be corrected; position cannot be bought.",
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
      { name: "Impartiality", url: pageUrl },
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
          <span>Impartiality</span>
        </nav>

        <section className="card-flat p-6 md:p-8">
          <h1 className="text-h1 text-[var(--color-text-primary)]">Nothing here can be bought</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Most tool directories monetize the listing itself — paid placement, paid “verified” badges, bid-ranked
            positions, or analyst access economies. This site is built on the opposite premise: the data is the product,
            and its value depends on no one being able to influence it. This page is the standing policy that makes that
            checkable.
          </p>
          <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
            Last reviewed <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time> · permanent policy · see also the{" "}
            <a href={withBasePath("/methodology")} className="text-[var(--color-primary)] hover:underline">
              methodology
            </a>{" "}
            and{" "}
            <a href={withBasePath("/inclusion-criteria")} className="text-[var(--color-primary)] hover:underline">
              inclusion criteria
            </a>
          </p>
        </section>

        <section id="policy" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">The no-pay-to-play policy</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
            {POLICY_POINTS.map((point) => (
              <li key={point.slice(0, 40)}>{point}</li>
            ))}
          </ul>
        </section>

        <section id="funding" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">How the project is funded and run</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            enterpriseai.tools is an open-source project (MIT-licensed, public repository) maintained by Tiberiu Arva
            and run on static hosting at negligible cost. There is no revenue model: no subscriptions, no ads, no paid
            tiers, no sponsored content. That independence is deliberate — it removes every channel through which a
            vendor could pay to shape the data.
          </p>
        </section>

        <section id="privacy" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Zero tracking</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
            {PRIVACY_POINTS.map((point) => (
              <li key={point.slice(0, 40)}>{point}</li>
            ))}
          </ul>
        </section>

        <section id="corrections" className="card-flat scroll-mt-24 p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Corrections: resolved by sources, not by spend</h2>
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
            — through a regulated-enterprise delivery lens, and every edit is attributable in the public git history.
            If this policy is ever violated, the evidence would be public; that is intentional.
          </p>
        </section>
      </main>
    </HomeShell>
  );
}
