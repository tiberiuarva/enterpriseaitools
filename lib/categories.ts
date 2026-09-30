import type { ToolCategory } from "./types.ts";

export type CategoryIconName =
  | "bot"
  | "git-branch"
  | "shield-check"
  | "briefcase-business"
  | "radio"
  | "layout-dashboard"
  | "fingerprint"
  | "activity"
  | "network";

export type CategoryMeta = {
  slug: ToolCategory;
  // Short label for navigation, filters and search sections.
  navLabel: string;
  // Hub page H1 and the name used in feeds, llms.txt and the tools index.
  title: string;
  // Page <meta> description; 90–170 chars keeps the SEO readiness gate happy.
  metaDescription: string;
  // One-line summary reused on cards and hub intros.
  summary: string;
  intro: string;
  iconName: CategoryIconName;
  evaluateLabel: string;
};

// Display order is the reading order of the stack: build, run, govern, use.
export const CATEGORY_ORDER: ToolCategory[] = [
  "agents",
  "orchestration",
  "gateways",
  "observability",
  "control-planes",
  "agent-identity",
  "governance",
  "assistants",
  "always-on-agents",
];

export const CATEGORIES: Record<ToolCategory, CategoryMeta> = {
  agents: {
    slug: "agents",
    navLabel: "Agents",
    title: "AI Agent Frameworks",
    metaDescription:
      "Compare Microsoft Foundry Agent Service, Amazon Bedrock Agents, Google Agent Builder, and open source agent frameworks used in enterprise AI stacks.",
    summary: "Managed cloud agent platforms and open source agent frameworks.",
    intro:
      "Compare cloud-native agent platforms with open-source frameworks on governance posture, deployment surface, and license risk — full details on each tool's page.",
    iconName: "bot",
    evaluateLabel: "Agent frameworks",
  },
  orchestration: {
    slug: "orchestration",
    navLabel: "Orchestration",
    title: "AI Orchestration",
    metaDescription:
      "Compare Azure Logic Apps, AWS Step Functions, Google Cloud Workflows, and open source orchestration platforms for enterprise AI automation.",
    summary: "Workflow engines, automation platforms, and orchestration tooling.",
    intro:
      "Compare cloud workflow services with open-source orchestration platforms on deployment options, audit trails, and governance fit — full details on each tool's page.",
    iconName: "git-branch",
    evaluateLabel: "Orchestration / workflow",
  },
  gateways: {
    slug: "gateways",
    navLabel: "AI gateways",
    title: "AI & MCP Gateways",
    metaDescription:
      "Compare AI gateways and MCP gateways — LiteLLM, Portkey, Kong, Azure API Management, Cloudflare — on routing, cost control, guardrails, and tool governance.",
    summary: "Gateways that route and govern LLM calls and agent access to MCP tools.",
    intro:
      "An AI gateway sits between applications and model providers to centralise keys, quotas, cost tracking, caching, and guardrails; an MCP gateway does the same for the tools agents call. Compare them on deployment ownership and license terms.",
    iconName: "network",
    evaluateLabel: "AI / MCP gateways",
  },
  observability: {
    slug: "observability",
    navLabel: "Observability",
    title: "AI Observability & Evaluation",
    metaDescription:
      "Compare LLM and agent observability and evaluation tools — Langfuse, Arize Phoenix, MLflow, LangSmith, Braintrust, Datadog — on tracing, evals, and licensing.",
    summary: "Tracing, evaluation, prompt management, and cost monitoring for LLM apps and agents.",
    intro:
      "Observability tools record what models and agents actually did — traces, tool calls, cost, latency — and evaluation tools score it. Compare self-hosted and SaaS options on license terms and data residency.",
    iconName: "activity",
    evaluateLabel: "Observability / evaluation",
  },
  "control-planes": {
    slug: "control-planes",
    navLabel: "Control planes",
    title: "Agent Control Planes",
    metaDescription:
      "Compare agent control planes — Microsoft Agent 365, Amazon Bedrock AgentCore, MuleSoft Agent Fabric, ServiceNow AI Control Tower — for governing agent fleets.",
    summary: "Registry, lifecycle, policy, and observability across a fleet of agents from many vendors.",
    intro:
      "An agent control plane answers: which agents exist, who owns them, what are they allowed to do, and are they healthy? Compare hyperscaler, SaaS-platform, and independent options on the scope of agents they can govern.",
    iconName: "layout-dashboard",
    evaluateLabel: "Agent control planes",
  },
  "agent-identity": {
    slug: "agent-identity",
    navLabel: "Agent identity",
    title: "Agent Identity & Access",
    metaDescription:
      "Compare identity and access management for AI agents — Microsoft Entra Agent ID, Okta, Auth0, Ping, SailPoint, Idira — on agent identities, scoped access, and reviews.",
    summary: "Identities, scoped access, and access reviews for AI agents as non-human principals.",
    intro:
      "Agents need their own identities, least-privilege access, owners, and access reviews — the same controls people get. Compare identity-provider, governance, and privileged-access vendors on how they register, authorise, and audit agents.",
    iconName: "fingerprint",
    evaluateLabel: "Agent identity & access",
  },
  governance: {
    slug: "governance",
    navLabel: "Guardrails & security",
    title: "AI Guardrails & Agent Security",
    metaDescription:
      "Compare AI guardrails and agent security — Azure AI Content Safety, Amazon Bedrock Guardrails, Google Model Armor, and third-party runtime safety and posture tools.",
    summary: "Runtime guardrails, content safety, and agent security posture controls.",
    intro:
      "Compare cloud guardrails with independent safety and agent-security vendors on certifications, data residency, and deployment ownership — full details on each tool's page.",
    iconName: "shield-check",
    evaluateLabel: "Guardrails / agent security",
  },
  assistants: {
    slug: "assistants",
    navLabel: "Assistants",
    title: "AI Assistants",
    metaDescription:
      "Compare coding assistants, productivity copilots, and build-your-own assistant platforms across Microsoft, AWS, Google, and independent vendors.",
    summary: "Coding copilots, productivity assistants, and build-your-own assistant platforms.",
    intro:
      "Compare coding, productivity, and build-your-own assistants on deployment surface, admin controls, and certification posture — full details on each tool's page.",
    iconName: "briefcase-business",
    evaluateLabel: "Assistants / copilots",
  },
  "always-on-agents": {
    slug: "always-on-agents",
    navLabel: "Always-on agents",
    title: "Always-on AI Agents",
    metaDescription:
      "Compare always-on AI agents — OpenClaw, Microsoft Autopilot, Grok Bot, Meta Muse, Manus — with their security record and enterprise controls.",
    summary: "Persistent personal and team agents that act on a user's behalf across apps, chat, and their own computer.",
    intro:
      "Always-on agents keep running after you close the chat: they hold their own identity, memory, and compute, and act across apps and messaging without a prompt each time. That autonomy is the risk — check each tool's approval gates, sandboxing, audit trail, and security record before allowing it on corporate data.",
    iconName: "radio",
    evaluateLabel: "Always-on agents",
  },
};

export function categoryHref(category: ToolCategory) {
  return `/${category}`;
}
