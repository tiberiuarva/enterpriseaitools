import type { Metadata } from "next";
import { CalendarClock, ExternalLink } from "lucide-react";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { lastUpdated } from "@/lib/data";
import { EU_AI_ACT_OFFICIAL_URL, formatUtcDate, type EuAiActMilestone } from "@/lib/eu-ai-act";
import milestoneData from "@/data/eu-ai-act.json";
import {
  euAiActObligations,
  getObligationsForActor,
  type EuAiActActor,
  type EuAiActObligation,
} from "@/lib/eu-ai-act-obligations";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { withBasePath } from "@/lib/site";

const PAGE_TITLE = "EU AI Act tracker — obligations & deadlines";
const PAGE_DESCRIPTION =
  "Source-backed EU AI Act tracker for enterprise AI tooling: which obligations apply to providers, deployers, and GPAI model providers, from when, with every claim linked to the official text.";

const ACTOR_SECTIONS: { actor: EuAiActActor; title: string; intro: string }[] = [
  {
    actor: "provider",
    title: "Providers of AI systems",
    intro: "Organisations that develop an AI system and place it on the EU market or put it into service under their own name.",
  },
  {
    actor: "deployer",
    title: "Deployers of AI systems",
    intro: "Organisations using an AI system under their authority in the EU — the role most enterprise buyers of the tools tracked here hold.",
  },
  {
    actor: "gpai-provider",
    title: "General-purpose AI model providers",
    intro: "Providers of general-purpose AI models (foundation models), regardless of how the model reaches the market.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Which EU AI Act obligations already apply?",
    answer:
      "Since 2 February 2025: the Article 5 prohibitions on unacceptable-risk practices and the Article 4 AI-literacy duty. Since 2 August 2025: transparency obligations for general-purpose AI model providers (Articles 53-55). Commission enforcement powers over GPAI providers begin 2 August 2026.",
  },
  {
    question: "When do high-risk AI system obligations apply?",
    answer:
      "Under the adopted AI Act, most remaining obligations — including Annex III high-risk requirements — are legally due on 2 August 2026. The Digital Omnibus on AI (provisional agreement, May 2026, not yet in the Official Journal) would defer stand-alone high-risk obligations to 2 December 2027 and product-embedded ones to 2 August 2028.",
  },
  {
    question: "Is this legal advice?",
    answer:
      "No. This page maps tracked tools and roles to the official text of Regulation (EU) 2024/1689 with a source link on every claim. It is source-backed information to orient a compliance review, not legal advice.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/eu-ai-act",
  modifiedTime: euAiActObligations.asOf,
});

function ObligationRow({ obligation }: { obligation: EuAiActObligation }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--color-border)] py-3 last:border-b-0 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex w-full items-center gap-2 sm:w-64 sm:shrink-0">
        <span className="inline-flex shrink-0 rounded-full bg-[var(--color-bg-hover)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-text-secondary)]">
          {obligation.articles}
        </span>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{obligation.title}</span>
      </div>
      <div className="text-sm text-[var(--color-text-secondary)]">
        <p>
          {obligation.summary}
          {obligation.kind === "voluntary" ? <span className="text-[var(--color-text-primary)]"> (voluntary)</span> : null}
        </p>
        <p className="mt-1 text-xs">
          Applies from <time dateTime={obligation.appliesFrom}>{formatUtcDate(obligation.appliesFrom)}</time>
          {obligation.deferral
            ? ` — proposed deferral to ${formatUtcDate(obligation.deferral.proposedDate)} (${obligation.deferral.status})`
            : null}
        </p>
        <a
          href={obligation.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:underline"
        >
          <ExternalLink size={12} aria-hidden="true" />
          Official text
        </a>
      </div>
    </div>
  );
}

export default function EuAiActPage() {
  const pageUrl = `${siteUrl}/eu-ai-act/`;
  const timeline = (milestoneData as EuAiActMilestone[])
    .slice()
    .sort((a, b) => a.appliesOn.localeCompare(b.appliesOn));
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "EU AI Act tracker", url: pageUrl },
    ]),
    buildWebPageJsonLd({ name: PAGE_TITLE, url: pageUrl, description: PAGE_DESCRIPTION }),
    buildFaqPageJsonLd(FAQ_ITEMS),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/eu-ai-act">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />

        <nav className="text-sm text-[var(--color-text-secondary)]">
          <a href={withBasePath("/")} className="text-[var(--color-primary)] hover:underline">
            Home
          </a>
          <span aria-hidden="true"> / </span>
          <span>EU AI Act tracker</span>
        </nav>

        <section className="card-flat p-6 md:p-8">
          <h1 className="text-h1 text-[var(--color-text-primary)]">EU AI Act tracker</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--color-text-secondary)]">
            Which obligations of Regulation (EU) 2024/1689 apply to providers, deployers, and general-purpose AI model
            providers, from when — every claim linked to the official text. Each tracked tool&apos;s page maps its own
            risk tier to this reference.
          </p>
          <p className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-hover)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
            <strong className="text-[var(--color-text-primary)]">Not legal advice.</strong> This page is source-backed
            information to orient a compliance review. Obligations depend on how your organisation develops or deploys a
            system; confirm against the official text and your counsel.
          </p>
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            Canonical starting point at the source:{" "}
            <a
              href={EU_AI_ACT_OFFICIAL_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              the European Commission&apos;s AI regulatory framework overview
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            .
          </p>
        </section>

        <section className="card-flat p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Where the law stands as of {formatUtcDate(euAiActObligations.asOf)}
            </h2>
            <a
              href={euAiActObligations.statusSourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              Legislative status source
            </a>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{euAiActObligations.statusSummary}</p>
        </section>

        <section className="card-flat p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Application timeline</h2>
            <a
              href={withBasePath("/eu-ai-act-deadlines.ics")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-primary)] hover:underline"
            >
              <CalendarClock size={14} aria-hidden="true" />
              Subscribe to deadlines (.ics)
            </a>
          </div>
          <ol className="mt-4 flex flex-col gap-3">
            {timeline.map((milestone) => (
              <li key={milestone.appliesOn} className="border-l-2 border-[var(--color-primary)] pl-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <time dateTime={milestone.appliesOn} className="font-semibold text-[var(--color-text-primary)]">
                    {formatUtcDate(milestone.appliesOn)}
                  </time>
                  <span className="font-medium">{milestone.label}</span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{milestone.summary}</p>
                <a
                  href={milestone.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex text-xs font-medium text-[var(--color-primary)] hover:underline"
                >
                  Source
                </a>
              </li>
            ))}
          </ol>
        </section>

        {ACTOR_SECTIONS.map(({ actor, title, intro }) => (
          <section key={actor} className="card-flat p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{intro}</p>
            <div className="mt-4">
              {getObligationsForActor(actor).map((obligation) => (
                <ObligationRow key={obligation.id} obligation={obligation} />
              ))}
            </div>
          </section>
        ))}

        <section className="card-flat p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">How tracked tools map to this</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
            Every tool record carries a source-backed EU AI Act risk tier in its governance posture. The tool&apos;s page
            shows the obligations implicated by that tier. Start from a category hub —{" "}
            <a href={withBasePath("/agents")} className="text-[var(--color-primary)] hover:underline">
              agents
            </a>
            ,{" "}
            <a href={withBasePath("/orchestration")} className="text-[var(--color-primary)] hover:underline">
              orchestration
            </a>
            ,{" "}
            <a href={withBasePath("/governance")} className="text-[var(--color-primary)] hover:underline">
              governance
            </a>
            , or{" "}
            <a href={withBasePath("/assistants")} className="text-[var(--color-primary)] hover:underline">
              assistants
            </a>{" "}
            — or use the{" "}
            <a href={withBasePath("/evaluate")} className="text-[var(--color-primary)] hover:underline">
              guided evaluation
            </a>
            , which already asks for your EU AI Act role.
          </p>
        </section>
      </main>
    </HomeShell>
  );
}
