export type HubFaq = {
  question: string;
  answer: string;
};

export const homeFaqs: HubFaq[] = [
  {
    question: "What does enterpriseai.tools track?",
    answer:
      "Microsoft Foundry, Amazon Bedrock, and the Gemini Enterprise Agent Platform as the cloud foundation layer, plus the leading agent, orchestration, governance, and assistant tools that enterprises pair with them — each tracked record carries a verifiable source URL.",
  },
  {
    question: "How often is the data updated?",
    answer:
      "A weekly source-backed scan refreshes every tracked record. Each per-tool page shows a 'last reviewed' date alongside its governance posture, and the /updates feed surfaces newly verified releases, license changes, certifications, and acquisitions.",
  },
  {
    question: "Is there a signup, paywall, or data capture?",
    answer:
      "No. The whole site runs as a static export with no accounts, no analytics, no third-party trackers, and no email capture. The 'Help me evaluate' flow runs entirely in your browser.",
  },
  {
    question: "Where do the underlying facts come from?",
    answer:
      "Vendor trust centers, compliance documentation, repository LICENSE files, and primary product docs. Every governance claim on a per-tool page links its source URL directly so claims can be audited.",
  },
];

export const platformsFaqs: HubFaq[] = [
  {
    question: "Why are Microsoft Foundry, Amazon Bedrock, and the Gemini Enterprise Agent Platform tracked together?",
    answer:
      "They are the three control-plane platforms that shape identity, model access, governance defaults, and deployment options for enterprise AI workloads. Picking a platform constrains every layer above it, so they are compared side-by-side as the foundation layer.",
  },
  {
    question: "What is the current canonical name for each platform?",
    answer:
      "Microsoft Foundry (formerly Azure AI Foundry / Azure AI Studio / Azure OpenAI Service), Amazon Bedrock, and the Gemini Enterprise Agent Platform (formerly Vertex AI). The 'Gemini Enterprise' assistant product is a separate offering and not the same as the agent platform.",
  },
  {
    question: "Which platforms support on-premises or sovereign deployment?",
    answer:
      "Microsoft Foundry Local provides an on-premises option. Amazon Bedrock and the Gemini Enterprise Agent Platform run as managed cloud services without an on-prem deployment surface today.",
  },
  {
    question: "Do all three platforms support MCP and A2A protocols?",
    answer:
      "Yes. Microsoft Foundry, Amazon Bedrock, and the Gemini Enterprise Agent Platform all expose MCP and A2A support; Microsoft and Google additionally publish OpenAPI tool catalogs. The platform comparison row tracks the current status per protocol.",
  },
];

export const agentsFaqs: HubFaq[] = [
  {
    question: "What counts as an AI agent framework in this tracker?",
    answer:
      "Toolkits and managed platforms that orchestrate LLM-driven agents — tool calling, planning, memory, and multi-step execution. The hub covers cloud-native agent services (Foundry Agent Service, Bedrock AgentCore, Agent Builder) and open-source frameworks (LangGraph, Semantic Kernel, AutoGen, CrewAI, ADK).",
  },
  {
    question: "Which agent frameworks support on-premises deployment?",
    answer:
      "Open-source frameworks (LangGraph, Semantic Kernel, AutoGen, CrewAI, Agno) can run anywhere the host runtime is supported. Cloud-native agent services are SaaS-only unless explicitly noted on the per-tool page.",
  },
  {
    question: "How is license risk evaluated for agent frameworks?",
    answer:
      "Every per-tool page records the exact license label and an explicit license-risk level (low / medium / high). Source-available or restrictive clauses (Commons Clause, BSL, SSPL, Elastic License) are flagged in plain language on the tool page.",
  },
];

export const orchestrationFaqs: HubFaq[] = [
  {
    question: "How does orchestration differ from agent frameworks in this tracker?",
    answer:
      "Orchestration covers workflow engines, pipeline builders, and automation layers that compose deterministic and probabilistic steps. Agent frameworks specifically orchestrate LLM-driven autonomous loops. Some tools (Prefect, Dagster, Temporal) sit in orchestration; LangGraph and Semantic Kernel sit in agents.",
  },
  {
    question: "Which orchestration tools support EU data residency?",
    answer:
      "Self-hostable orchestrators (Prefect, Dagster, Temporal, n8n, Flowise) inherit residency from where you deploy them. Managed SaaS tools list their data-residency options directly on the per-tool governance posture page.",
  },
  {
    question: "Are deprecated orchestration platforms still tracked?",
    answer:
      "Yes — deprecated and archived tools remain on the hub with a clear 'deprecated' status and a status note explaining the deprecation, so teams evaluating migration paths can see the full picture.",
  },
];

export const governanceFaqs: HubFaq[] = [
  {
    question: "What does 'governance' cover in this hub?",
    answer:
      "Guardrails, content safety filters, model policy controls, evaluation harnesses, and risk-tier tooling — the layer regulated enterprises use to approve AI workloads. Each per-tool page records data residency, audit logging, SOC 2 / ISO 27001 / ISO 42001, and EU AI Act role.",
  },
  {
    question: "Are EU AI Act risk-tier assignments tracked per tool?",
    answer:
      "Yes. Every tool carries an EU AI Act role (prohibited / high-risk / limited-risk / minimal-risk / not-applicable / unknown) on its governance posture, sourced from the vendor's published positioning or set to 'unknown' when no public statement exists.",
  },
  {
    question: "Which governance tools support on-prem or sovereign deployment?",
    answer:
      "Self-hostable governance frameworks (NeMo Guardrails, Guardrails AI, Llama Guard, Granite Guardian) run wherever the host runtime is supported. Cloud-native guardrails (Bedrock Guardrails, AI Content Safety, Model Armor) inherit the parent platform's residency surface.",
  },
];

export const assistantsFaqs: HubFaq[] = [
  {
    question: "What kinds of assistants are tracked here?",
    answer:
      "Coding copilots (GitHub Copilot, Cursor, Claude Code, Windsurf, JetBrains AI), productivity assistants (Microsoft 365 Copilot, Gemini Enterprise, Google AI Pro), and build-your-own assistant platforms — split by subcategory so teams can compare like-for-like.",
  },
  {
    question: "How is enterprise data handling captured for assistants?",
    answer:
      "Each per-tool page documents the data-residency posture, audit-logging capability, certifications (SOC 2 / ISO 27001 / ISO 42001), and EU AI Act role with source URLs. Assistants that lack public statements on a dimension are marked 'unknown' with a reason.",
  },
  {
    question: "Are coding assistants and productivity assistants comparable?",
    answer:
      "They are tracked separately because their evaluation criteria differ: coding assistants care about IDE coverage, language support, and repository context; productivity assistants care about Office/Workspace surface coverage, tenant isolation, and identity integration. Use the subcategory filter to compare within a class.",
  },
];

export const categoryFaqs = {
  agents: agentsFaqs,
  orchestration: orchestrationFaqs,
  governance: governanceFaqs,
  assistants: assistantsFaqs,
} as const;
