import type { Metadata } from "next";
import { ConsentSettingsButton } from "@/components/consent-settings-button";
import { HomeShell } from "@/components/home-shell";
import { JsonLd, buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/components/json-ld";
import { lastUpdated } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { githubRepoUrl, withBasePath } from "@/lib/site";

const PAGE_TITLE = "Privacy, cookies, and analytics";
const PAGE_DESCRIPTION =
  "Exactly what this site collects and when: no account, no email capture, no advertising, and Google Analytics that loads only after you accept it.";
const LAST_REVIEWED = "2026-09-13";

const DEFAULT_POINTS = [
  "No account, no sign-up, no email capture, and no contact form. There is nothing here to log in to.",
  "No advertising, no ad network, no remarketing pixels, and no data sold or shared with data brokers.",
  "No third-party fonts, embeds, or scripts fetched while you read. Pages are static files served from one origin.",
  "Until you accept analytics, no request is made to Google and no analytics cookie is written. Declining is a real decline, not a reduced-tracking mode.",
];

const ANALYTICS_POINTS = [
  "Which pages you view on this site, in what order, and how long the visit lasts.",
  "Approximate location derived from your IP address — country and region level, not a street address. Google discards the full IP address and does not log or store it for Analytics.",
  "Device basics: browser, operating system, screen size, and whether you arrived from a search engine, a link, or directly.",
  "Two first-party cookies (`_ga` and `_ga_<id>`) that let Google Analytics tell a returning visit from a new one. They expire after two years, and you can delete them at any time in your browser.",
];

const NEVER_POINTS = [
  "We never send Google your name, email address, or any other identifier — we do not have one to send.",
  "Advertising signals stay switched off permanently. Google Consent Mode is configured with ad storage, ad user data, and ad personalisation denied, whatever you choose about analytics.",
  "Google Signals and advertising-features reporting are not enabled on this property.",
  "Nothing you type into the 'Help me evaluate' flow leaves your browser. It runs entirely client-side and is never transmitted, with or without analytics consent.",
];

export const metadata: Metadata = buildMetadata({
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  path: "/privacy",
  modifiedTime: LAST_REVIEWED,
});

function PolicySection({
  id,
  title,
  intro,
  points,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  points?: string[];
  children?: React.ReactNode;
}) {
  return (
    <section id={id} className="card-flat scroll-mt-24 p-6">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
      {intro ? <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">{intro}</p> : null}
      {points ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--color-text-secondary)]">
          {points.map((point) => (
            <li key={point.slice(0, 40)}>{point}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  const pageUrl = `${siteUrl}/privacy/`;
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: PAGE_TITLE, url: pageUrl },
    ]),
    buildWebPageJsonLd({ name: PAGE_TITLE, url: pageUrl, description: PAGE_DESCRIPTION, siteUrl }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/privacy">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <JsonLd data={jsonLd} />

        <section className="card-flat p-6 md:p-10">
          <h1 className="text-h1 text-[var(--color-text-primary)]">{PAGE_TITLE}</h1>
          <p className="mt-3 text-body text-[var(--color-text-secondary)]">{PAGE_DESCRIPTION}</p>
          <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
            Last reviewed <time dateTime={LAST_REVIEWED}>{LAST_REVIEWED}</time>
          </p>
        </section>

        <PolicySection
          id="default"
          title="What happens if you do nothing"
          intro="This is the state every visitor starts in, and the state you stay in unless you actively opt in."
          points={DEFAULT_POINTS}
        />

        <PolicySection
          id="analytics"
          title="If you accept analytics"
          intro="Accepting loads Google Analytics 4 (measurement ID managed by this project) and lets it record the following. This is aggregate audience measurement — which comparisons are worth writing more of — not individual tracking."
          points={ANALYTICS_POINTS}
        >
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Google acts as our analytics processor and may process this data outside your country. See{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              Google&apos;s privacy policy
            </a>{" "}
            and{" "}
            <a
              href="https://support.google.com/analytics/answer/11593727"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              how Analytics handles IP addresses
            </a>
            . Reports are retained for 14 months and then deleted.
          </p>
        </PolicySection>

        <PolicySection id="never" title="What never happens, either way" points={NEVER_POINTS} />

        <PolicySection
          id="controls"
          title="Changing your mind"
          intro="Consent is stored in your browser only, under a single local-storage entry. It is not a server-side record, so clearing your browser data resets it."
        >
          <div className="mt-3 flex flex-col gap-3">
            <ConsentSettingsButton
              label="Open analytics cookie settings"
              className="inline-flex w-fit rounded-xl border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            />
            <p className="text-sm leading-6 text-[var(--color-text-secondary)]">
              You can also block analytics at the browser level with any content blocker, or install{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[var(--color-primary)] hover:underline"
              >
                Google&apos;s opt-out add-on
              </a>
              . Both work regardless of what you chose here.
            </p>
          </div>
        </PolicySection>

        <PolicySection
          id="hosting"
          title="Hosting and server logs"
          intro="The site is a static export hosted on Azure Static Web Apps. Like every web server, the host processes the IP address and user agent of each request in order to deliver the page and to absorb abuse. That processing is Microsoft's, happens whether or not you accept analytics, and we do not receive, query, or retain those logs."
        />

        <PolicySection
          id="contact"
          title="Questions and corrections"
          intro="This policy lives in the same public repository as the site, so its full history is auditable."
        >
          <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            Raise a question or a correction as a public issue in the{" "}
            <a
              href={githubRepoUrl}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[var(--color-primary)] hover:underline"
            >
              project repository
            </a>
            . The no-paid-placement rules that govern the data itself are set out on the{" "}
            <a href={withBasePath("/impartiality")} className="font-medium text-[var(--color-primary)] hover:underline">
              impartiality page
            </a>
            .
          </p>
        </PolicySection>
      </main>
    </HomeShell>
  );
}
