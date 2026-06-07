import type { Metadata } from "next";
import { EvaluateClient } from "@/components/evaluate-client";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { lastUpdated, tools } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";

const title = "Help me evaluate enterprise AI tools";
const description =
  "Answer a few questions about deployment, data sensitivity, jurisdiction, certifications, and licensing to get a ranked, source-backed shortlist of enterprise AI tools.";

export const metadata: Metadata = buildMetadata({
  title,
  description,
  path: "/evaluate",
});

export default function EvaluatePage() {
  const pageUrl = `${siteUrl}/evaluate/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "Help me evaluate", url: pageUrl },
    ]),
    buildWebPageJsonLd({ name: title, url: pageUrl, description, siteUrl }),
    buildFaqPageJsonLd([
      {
        question: "Does this flow capture any data?",
        answer: "No. The guided flow runs entirely in your browser; no answers, results, or analytics are sent anywhere. There is no signup, no email capture, and no backend.",
      },
      {
        question: "How are results ranked?",
        answer: "Hard filters first (category, deployment requirement, permissive-license requirement), then transparent additive scoring over the M2 governance fields (data residency, SOC 2 / ISO 27001 / ISO 42001, EU AI Act role, license risk, audit logging). Every result lists its match reasons and any cautions.",
      },
      {
        question: "Where do the underlying facts come from?",
        answer: "Every governance value is source-backed in data/tools.json with a primary-source URL (vendor trust centers, compliance docs, repository LICENSE files). Click into any result's per-tool page to see the source URL on every asserted claim.",
      },
    ]),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/evaluate">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <h1 className="text-[2rem] font-extrabold leading-tight text-[var(--color-text-primary)]">Help me evaluate</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            A short guided flow that returns a ranked shortlist with a readable governance posture for each result. It
            runs entirely in your browser — no sign-up, no data leaves the page. Every result links to the tool&apos;s
            full source-backed posture.
          </p>
        </section>
        <EvaluateClient tools={tools} />
      </main>
    </HomeShell>
  );
}
