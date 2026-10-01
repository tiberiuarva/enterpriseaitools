import type { ToolCategory } from "./types.ts";

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
      "No. The whole site runs as a static export with no accounts, no email capture, and no advertising. Google Analytics is the only third-party script, it loads only if you accept the consent prompt, and declining means no request to Google at all. The 'Help me evaluate' flow runs entirely in your browser either way.",
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
    question: "What does the guardrails & agent security hub cover?",
    answer:
      "Runtime guardrails, content safety filters, model policy controls, and agent security posture tools — the layer that decides whether a prompt, output, or agent action is safe right now. Fleet-wide agent inventory lives under Agent Control Planes, and agent identities under Agent Identity & Access. Each per-tool page records data residency, audit logging, SOC 2 / ISO 27001 / ISO 42001, and EU AI Act role.",
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
      "Coding assistants and agents (GitHub Copilot, Cursor, Claude Code, OpenAI Codex, Kiro, Devin Desktop), productivity assistants (Microsoft 365 Copilot, Gemini Enterprise, ChatGPT Enterprise, Claude Enterprise), and build-your-own assistant platforms — split by subcategory so teams can compare like-for-like. Always-on agents that act without a prompt have their own hub.",
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

export const alwaysOnAgentsFaqs: HubFaq[] = [
  {
    question: "What is an always-on AI agent?",
    answer:
      "An agent that keeps working after the chat closes: it holds its own memory, credentials or identity, and usually its own cloud or local computer, and acts across email, chat, files, and web apps on a schedule or trigger rather than one prompt at a time. Microsoft, Meta, xAI, and Google all announced or shipped products in this class in 2026, alongside open-source projects such as OpenClaw.",
  },
  {
    question: "How is this different from an assistant or an agent framework?",
    answer:
      "Assistants answer when asked; agent frameworks are libraries developers use to build agents. Always-on agents are finished products that act on a person's or team's behalf without a prompt each time, which is why they need their own controls: approval gates for outbound actions, sandboxed compute, scoped identities, and an audit trail.",
  },
  {
    question: "What should a security team check before allowing one?",
    answer:
      "Where it runs (vendor VM, user device, or self-hosted), what identity and credentials it holds, which actions need human approval, whether every action is logged to a system you control, and where third-party skills or plugins come from. Each per-tool page records the product's documented controls and any source-backed security incidents.",
  },
];

export const controlPlanesFaqs: HubFaq[] = [
  {
    question: "What is an agent control plane?",
    answer:
      "The management layer for a fleet of agents: a registry of which agents exist and who owns them, lifecycle controls to publish, pause or retire them, policy that applies across vendors, and observability of health, usage, and cost. Analysts now evaluate it as a market of its own, and vendors such as Microsoft (Agent 365) and IBM use the same term.",
  },
  {
    question: "Do I need one if I only use one cloud platform?",
    answer:
      "Each hyperscaler ships control-plane features for its own agents. The case for a separate control plane grows once agents come from several places — SaaS apps, low-code builders, and custom code on more than one cloud — because inventory and policy then have to span all of them.",
  },
  {
    question: "How does this relate to agent identity and guardrails?",
    answer:
      "Control planes answer which agents exist and what policy applies across the fleet. Agent identity tools answer who an agent is and what it may access. Guardrails answer whether a specific prompt, output, or action is safe right now. Many products span two layers; each is listed once under its primary purpose.",
  },
];

export const agentIdentityFaqs: HubFaq[] = [
  {
    question: "Why do AI agents need their own identities?",
    answer:
      "An agent that reuses a person's credentials or a shared API key cannot be scoped, reviewed, or revoked on its own, and its actions cannot be told apart from the human's in audit logs. A dedicated agent identity with a named human owner makes least privilege, access reviews, and kill switches possible.",
  },
  {
    question: "What standards matter for agent authorization?",
    answer:
      "OAuth 2.x remains the base. The Model Context Protocol's authorization spec builds on OAuth 2.1 for agent-to-tool access, and its enterprise-managed authorization extension lets an identity provider decide which agents can reach which MCP servers. The OpenID Foundation's AuthZEN work covers fine-grained authorization decisions.",
  },
  {
    question: "Who usually owns this purchase?",
    answer:
      "The identity and access management team or the CISO, not the AI platform team — which is why it is tracked separately from agent control planes. Most vendors here extend an existing identity provider, governance, or privileged-access product to agents.",
  },
];

export const observabilityFaqs: HubFaq[] = [
  {
    question: "What is AI observability?",
    answer:
      "Recording what an LLM application or agent actually did — prompts, model calls, tool calls, retrieved context, latency, token cost, and errors — as traces you can search and replay. Most tools here use or accept OpenTelemetry so traces can flow into existing monitoring.",
  },
  {
    question: "How does evaluation differ from observability?",
    answer:
      "Observability shows what happened; evaluation scores whether it was good, using test datasets, automated judges, or human review, before and after release. Most tools here now do both, but they differ in whether evals or tracing is the core of the product.",
  },
  {
    question: "Should traces be kept in-house?",
    answer:
      "Traces often contain full prompts, retrieved documents, and outputs, so they carry the same sensitivity as the underlying data. Self-hostable options keep that data in your environment; check each per-tool page for the license (several are open-core or source-available) and SaaS data-residency options.",
  },
];

export const gatewaysFaqs: HubFaq[] = [
  {
    question: "What does an AI gateway do?",
    answer:
      "It is a proxy between applications and model providers that centralises API keys, routing and fallback across models, rate limits and budgets, caching, logging, and guardrail checks, so every team does not reimplement them. Many now also expose or govern MCP tool traffic.",
  },
  {
    question: "What is an MCP gateway?",
    answer:
      "A gateway for the Model Context Protocol: agents connect to one endpoint, and the gateway decides which MCP servers and tools each agent may use, injects credentials, and logs every tool call. It is the control point for agent tool access in the same way an API gateway is for APIs.",
  },
  {
    question: "Build on an API gateway or adopt a dedicated one?",
    answer:
      "If an API management platform is already the enterprise standard, its AI features keep one policy surface. Dedicated AI gateways usually move faster on model and provider support. Check licensing carefully: several open-source gateways keep enterprise features under a commercial license.",
  },
];

export const categoryFaqs: Record<ToolCategory, HubFaq[]> = {
  agents: agentsFaqs,
  orchestration: orchestrationFaqs,
  governance: governanceFaqs,
  assistants: assistantsFaqs,
  "always-on-agents": alwaysOnAgentsFaqs,
  "control-planes": controlPlanesFaqs,
  "agent-identity": agentIdentityFaqs,
  observability: observabilityFaqs,
  gateways: gatewaysFaqs,
};
