import type { Metadata } from "next";
import { JsonLd, buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/components/json-ld";
import { HomeShell } from "@/components/home-shell";
import { PlatformMark } from "@/components/platform-mark";
import { RelatedHubs } from "@/components/related-hubs";
import { VendorComparisonTable } from "@/components/vendor-comparison-table";
import { WarningBox } from "@/components/warning-box";
import { lastUpdated, platforms } from "@/lib/data";
import { buildMetadata, siteUrl } from "@/lib/metadata";
import { assertUniquePlatformFragmentIds, getPlatformFragmentId } from "@/lib/platform-fragments";
import { withBasePath } from "@/lib/site";
import type { PlatformMapping } from "@/lib/types";

export const metadata: Metadata = buildMetadata({
  title: "AI Platforms & Model Hubs",
  description:
    "Side-by-side comparison of Microsoft Foundry, AWS Bedrock, and Google Vertex AI as the foundation layer for enterprise AI tools.",
  path: "/platforms",
});

const comparisonRows = [
  { attribute: "Formerly known as", values: ["Azure AI Foundry / Azure AI Studio / Azure OpenAI Service", "Amazon Bedrock (unchanged)", "Vertex AI (unchanged); AI Studio is the free playground"] as [string, string, string] },
  { attribute: "What it is", values: ["Unified PaaS for enterprise AI: models, agents, tools, evaluations, governance", "Managed service for foundation models with agent building and guardrails", "Full ML + GenAI platform: model garden, agent engine, MLOps, evaluation"] as [string, string, string] },
  { attribute: "Model catalog", values: ["11,000+ models", "100+ foundation models", "200+ via Model Garden"] as [string, string, string] },
  { attribute: "Unique models", values: ["GPT-5.4, GPT-5.4 Pro, Phi-4, MAI-Image-2, Sora 2", "Amazon Nova, Amazon Titan", "Gemini 3.1 Pro, Nano Banana Pro, Veo 3.1, Imagen 4"] as [string, string, string] },
  { attribute: "Agent service", values: ["Foundry Agent Service (GA)", "Bedrock Agents + AgentCore (GA)", "Agent Builder + ADK + Agent Engine"] as [string, string, string] },
  { attribute: "Guardrails", values: ["AI Content Safety", "Bedrock Guardrails", "Model Armor + Vertex AI Safety"] as [string, string, string] },
  { attribute: "Protocol support", values: ["MCP, A2A, OpenAPI", "MCP, A2A", "MCP, A2A, OpenAPI"] as [string, string, string] },
  { attribute: "SDK languages", values: ["Python, C#, JS/TS, Java", "Python, JS, Java, Go, .NET", "Python, Java, Go, TypeScript"] as [string, string, string] },
  { attribute: "Unified SDK", values: ["azure-ai-projects v2", "boto3 + AWS SDK", "google-cloud-aiplatform"] as [string, string, string] },
  { attribute: "Connectors", values: ["1,400+ via Logic Apps + Tool Catalog", "220+ AWS services", "GCP services + Workspace"] as [string, string, string] },
  { attribute: "Free tier", values: ["$200 Azure credit", "$200 AWS credit", "$300 GCP credit + AI Studio free playground"] as [string, string, string] },
  { attribute: "Pricing model", values: ["Pay-per-token + per-tool", "Pay-per-token + per-feature", "Pay-per-token + per-compute"] as [string, string, string] },
  { attribute: "On-premises", values: ["Yes (Foundry Local)", "No", "No"] as [string, string, string] },
  { attribute: "MCP server", values: ["Yes (mcp.ai.azure.com)", "Preview", "Preview"] as [string, string, string] },
  { attribute: "EU data residency", values: ["Yes", "Yes", "Yes"] as [string, string, string] },
  { attribute: "SOC 2 / ISO 27001", values: ["Yes / Yes", "Yes / Yes", "Yes / Yes"] as [string, string, string] },
  { attribute: "HIPAA", values: ["Yes", "Yes", "Yes"] as [string, string, string] },
  { attribute: "Key updates", values: ["SDK 2.0 GA, Agent Service GA, GPT-5.4 GA, PromptFlow deprecated", "AgentCore GA, Automated Reasoning GA, 85% guardrails price cut", "ADK open-sourced, Gemini 3.1 Pro, Gemini Enterprise rename, Wiz acquisition"] as [string, string, string] },
];

const mappingRows: Array<{ label: string; cells: [PlatformMapping, PlatformMapping, PlatformMapping] }> = [
  {
    label: "Agent Frameworks",
    cells: [platforms[0].categoryMapping.agents, platforms[1].categoryMapping.agents, platforms[2].categoryMapping.agents],
  },
  {
    label: "Orchestration",
    cells: [platforms[0].categoryMapping.orchestration, platforms[1].categoryMapping.orchestration, platforms[2].categoryMapping.orchestration],
  },
  {
    label: "Governance",
    cells: [platforms[0].categoryMapping.governance, platforms[1].categoryMapping.governance, platforms[2].categoryMapping.governance],
  },
  {
    label: "Assistants (Coding)",
    cells: [platforms[0].categoryMapping.assistantsCoding, platforms[1].categoryMapping.assistantsCoding, platforms[2].categoryMapping.assistantsCoding],
  },
  {
    label: "Assistants (Productivity)",
    cells: [platforms[0].categoryMapping.assistantsProductivity, platforms[1].categoryMapping.assistantsProductivity, platforms[2].categoryMapping.assistantsProductivity],
  },
  {
    label: "Assistants (Build Your Own)",
    cells: [platforms[0].categoryMapping.assistantsBuildYourOwn, platforms[1].categoryMapping.assistantsBuildYourOwn, platforms[2].categoryMapping.assistantsBuildYourOwn],
  },
];

export default function PlatformsPage() {
  assertUniquePlatformFragmentIds(platforms.map((platform) => platform.id));

  const pageUrl = `${siteUrl}/platforms/`;
  const description = "Side-by-side comparison of Microsoft Foundry, AWS Bedrock, and Google Vertex AI as the foundation layer for enterprise AI tools.";
  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", url: `${siteUrl}/` },
      { name: "AI Platforms & Model Hubs", url: pageUrl },
    ]),
    buildCollectionPageJsonLd({
      name: "AI Platforms & Model Hubs",
      url: pageUrl,
      description,
    }),
  ];

  return (
    <HomeShell lastUpdated={lastUpdated} currentPath="/platforms">
      <main id="main-content" tabIndex={-1} className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <JsonLd data={jsonLd} />
        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8">
          <h1 className="text-[2rem] font-extrabold text-[var(--color-text-primary)]">AI Platforms &amp; Model Hubs</h1>
          <div className="mt-3 max-w-4xl space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            <p>
              Microsoft Foundry, AWS Bedrock, and Google Vertex AI are the foundation layer beneath the rest of the landscape.
              They package model access, agent services, safety controls, SDKs, and deployment infrastructure differently.
            </p>
            <p>
              Read this page top-down: compare the platforms first, use the category mapping section to see where each cloud lands in agents,
              orchestration, governance, and assistants, then use the detailed comparison table for deeper vendor-to-vendor evaluation.
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {platforms.map((platform) => {
            const platformFragmentId = getPlatformFragmentId(platform.id);
            const platformHeadingId = `${platformFragmentId}-heading`;

            return (
              <article
                id={platformFragmentId}
                key={platform.id}
                aria-labelledby={platformHeadingId}
                className="scroll-mt-[calc(var(--site-header-height)_+_1rem)] rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <PlatformMark vendor={platform.vendor} logoUrl={platform.logoUrl} logoKind={platform.logoKind} />
                  <div className="min-w-0">
                    <h2 id={platformHeadingId} className="truncate text-lg font-semibold">
                      {platform.name}
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)]">{platform.vendor}</p>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--color-text-secondary)]">{platform.description}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  <strong className="text-[var(--color-text-primary)]">Why teams pick it:</strong> {platform.tagline}
                </p>

                <dl className="mt-4 space-y-2 text-sm text-[var(--color-text-secondary)]">
                  <div>
                    <dt className="inline font-semibold text-[var(--color-text-primary)]">Model catalog:</dt>{" "}
                    <dd className="inline">{platform.modelCount}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-text-primary)]">Protocols:</dt>{" "}
                    <dd className="inline">{platform.protocols.join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-text-primary)]">SDKs:</dt>{" "}
                    <dd className="inline">{platform.sdkLanguages.join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-text-primary)]">Pricing:</dt>{" "}
                    <dd className="inline">{platform.pricing}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-text-primary)]">Free tier:</dt>{" "}
                    <dd className="inline">{platform.freeTier}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-text-primary)]">Regions:</dt>{" "}
                    <dd className="inline">{platform.regions}</dd>
                  </div>
                  <div>
                    <dt className="inline font-semibold text-[var(--color-text-primary)]">On-prem / sovereign fit:</dt>{" "}
                    <dd className="inline">{platform.onPremises}</dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--color-text-secondary)]">
                  {platform.formerNames.length > 0 ? (
                    <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1">
                      Former names: {platform.formerNames.join(" · ")}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={platform.docsUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">
                    Docs
                  </a>
                  <a href={platform.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline">
                    Product page
                  </a>
                </div>
              </article>
            );
          })}
        </section>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:720px]">
          <h2 className="text-lg font-semibold">How each platform maps into the tracked categories</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--color-text-secondary)]">
            This bridges the platform layer with the category hubs, so visitors can quickly see the native cloud product most relevant to each tracked category.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-primary)]">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Microsoft Foundry</th>
                  <th className="px-4 py-3">AWS Bedrock</th>
                  <th className="px-4 py-3">Google Vertex AI</th>
                </tr>
              </thead>
              <tbody>
                {mappingRows.map((row) => (
                  <tr key={row.label} className="border-b border-[var(--color-border)]">
                    <td className="px-4 py-3 font-medium text-[var(--color-text-primary)]">{row.label}</td>
                    {row.cells.map((item, index) => (
                      <td key={`${row.label}-${index}`} className="px-4 py-3 text-[var(--color-text-secondary)]">
                        <a href={withBasePath(item.href)} className="text-[var(--color-primary)] hover:underline">
                          {item.label}
                        </a>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 [content-visibility:auto] [contain-intrinsic-size:1200px]">
          <div className="max-w-4xl">
            <h2 className="text-lg font-semibold">Detailed vendor comparison</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
              Use the full table below after the platform summaries above. This is the detail layer for direct vendor-to-vendor comparison rather than the best entry point for first-time visitors.
            </p>
          </div>
          <div className="mt-5">
            <VendorComparisonTable
              vendors={["Microsoft Foundry", "AWS Bedrock", "Google Vertex AI"]}
              rows={comparisonRows}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 [content-visibility:auto] [contain-intrinsic-size:240px]">
          <WarningBox>
            Always use <strong>Microsoft Foundry</strong> as the current name. PromptFlow is being deprecated and Azure ML SDK v1 support ends June 30, 2026.
          </WarningBox>
          <WarningBox variant="warning" title="Google naming caution">
            Do not confuse Google AI Studio (free playground) with Vertex AI Studio (enterprise). Agentspace is now <strong>Gemini Enterprise</strong>.
          </WarningBox>
        </section>

        <RelatedHubs
          currentPath="/platforms"
          title="Explore category hubs"
          intro="Use the category hubs to drill from the cloud foundation layer into tracked agent, orchestration, governance, assistant, and update pages."
          hubs={[
            {
              href: "/agents",
              title: "AI Agent Frameworks",
              description: "Compare managed cloud agent stacks with open source agent frameworks used in enterprise deployments.",
            },
            {
              href: "/orchestration",
              title: "AI Orchestration",
              description: "Review workflow engines, pipeline builders, and automation layers connected to the platform layer.",
            },
            {
              href: "/governance",
              title: "AI Governance",
              description: "Check guardrails, safety controls, and policy tooling mapped across the major cloud vendors.",
            },
            {
              href: "/assistants",
              title: "AI Assistants",
              description: "Explore coding assistants, productivity copilots, and build-your-own assistant platforms.",
            },
            {
              href: "/updates",
              title: "Weekly updates",
              description: "Follow releases, deprecations, acquisitions, and other market changes across the tracked landscape.",
            },
            {
              href: "/about",
              title: "About and contribution rules",
              description: "Review sourcing standards, contribution rules, and project scope before editing tracked platform data.",
            },
          ]}
        />
      </main>
    </HomeShell>
  );
}
