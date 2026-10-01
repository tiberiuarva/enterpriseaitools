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
  // Page <meta> description; 90–160 chars so search snippets are not truncated.
  metaDescription: string;
  // One-line summary reused on cards and hub intros.
  summary: string;
  intro: string;
  iconName: CategoryIconName;
  // Goal-phrased option for the /evaluate flow, so visitors pick a job, not a taxonomy term.
  evaluateLabel: string;
  // schema.org applicationCategory for this category's SoftwareApplication JSON-LD.
  schemaApplicationCategory: "DeveloperApplication" | "BusinessApplication" | "SecurityApplication";
};

// Display order follows the stack layers below: build, control plane, use.
export const CATEGORY_ORDER: readonly ToolCategory[] = [
  "agents",
  "orchestration",
  "control-planes",
  "agent-identity",
  "governance",
  "observability",
  "gateways",
  "assistants",
  "always-on-agents",
];

export type CategoryHubLink = { href: string; title: string; description: string };

export const CATEGORIES: Record<ToolCategory, CategoryMeta> = {
  agents: {
    slug: "agents",
    navLabel: "Agent frameworks",
    title: "AI Agent Frameworks",
    metaDescription:
      "Compare Microsoft Foundry Agent Service, Amazon Bedrock Agents, Google Agent Builder, and open source agent frameworks used in enterprise AI stacks.",
    summary: "Managed cloud agent platforms and open source agent frameworks.",
    intro:
      "Compare cloud-native agent platforms with open-source frameworks on governance posture, deployment surface, and license risk — full details on each tool's page.",
    iconName: "bot",
    evaluateLabel: "Build our own AI agent",
    schemaApplicationCategory: "DeveloperApplication",
  },
  orchestration: {
    slug: "orchestration",
    navLabel: "Workflows & orchestration",
    title: "AI Orchestration",
    metaDescription:
      "Compare Azure Logic Apps, AWS Step Functions, Google Cloud Workflows, and open source orchestration platforms for enterprise AI automation.",
    summary: "Workflow engines, automation platforms, and orchestration tooling.",
    intro:
      "Compare cloud workflow services with open-source orchestration platforms on deployment options, audit trails, and governance fit — full details on each tool's page.",
    iconName: "git-branch",
    evaluateLabel: "Automate a multi-step workflow with AI",
    schemaApplicationCategory: "DeveloperApplication",
  },
  gateways: {
    slug: "gateways",
    navLabel: "AI & MCP gateways",
    title: "AI & MCP Gateways",
    metaDescription:
      "Compare AI gateways and MCP gateways — LiteLLM, Portkey, Kong, Azure API Management, Cloudflare — on routing, cost control, guardrails, and tool governance.",
    summary: "Gateways that route and govern LLM calls and agent access to MCP tools.",
    intro:
      "An AI gateway sits between applications and model providers to centralise keys, quotas, cost tracking, caching, and guardrails; an MCP gateway does the same for the tools agents call. Compare them on deployment ownership and license terms.",
    iconName: "network",
    evaluateLabel: "Route and control model and tool traffic",
    schemaApplicationCategory: "DeveloperApplication",
  },
  observability: {
    slug: "observability",
    navLabel: "Monitoring & evaluation",
    title: "AI Observability & Evaluation",
    metaDescription:
      "Compare LLM and agent observability and evaluation tools — Langfuse, Arize Phoenix, MLflow, LangSmith, Braintrust, Datadog — on tracing, evals, and licensing.",
    summary: "Tracing, evaluation, prompt management, and cost monitoring for LLM apps and agents.",
    intro:
      "Observability tools record what models and agents actually did — traces, tool calls, cost, latency — and evaluation tools score it. Compare self-hosted and SaaS options on license terms and data residency.",
    iconName: "activity",
    evaluateLabel: "Trace, test, and evaluate AI quality",
    schemaApplicationCategory: "DeveloperApplication",
  },
  "control-planes": {
    slug: "control-planes",
    navLabel: "Registry & management",
    title: "Agent Registry & Management",
    metaDescription:
      "Compare agent registry and control plane suites — Microsoft Agent 365, Amazon Bedrock AgentCore, MuleSoft Agent Fabric, ServiceNow AI Control Tower.",
    summary: "Agent inventory, ownership, lifecycle, and fleet-wide policy: the management core of the control plane.",
    intro:
      "These suites answer which agents exist, who owns them, and what policy applies across the fleet, often across several vendors. Most also bundle some identity, guardrail, and monitoring features; compare them on how many agent sources they can discover and govern. For the whole layer, including identity, guardrails, monitoring and gateways, see the control plane overview.",
    iconName: "layout-dashboard",
    evaluateLabel: "Inventory and manage the agents we have",
    schemaApplicationCategory: "BusinessApplication",
  },
  "agent-identity": {
    slug: "agent-identity",
    navLabel: "Identity & access",
    title: "Agent Identity & Access",
    metaDescription:
      "Compare identity and access management for AI agents — Microsoft Entra Agent ID, Okta, Auth0, Ping, SailPoint, Idira — on scoped access and reviews.",
    summary: "Identities, scoped access, and access reviews for AI agents as non-human principals.",
    intro:
      "Agents need their own identities, least-privilege access, owners, and access reviews — the same controls people get. Compare identity-provider, governance, and privileged-access vendors on how they register, authorise, and audit agents.",
    iconName: "fingerprint",
    evaluateLabel: "Give agents their own scoped access",
    schemaApplicationCategory: "SecurityApplication",
  },
  governance: {
    slug: "governance",
    navLabel: "Guardrails & security",
    title: "AI Guardrails & Agent Security",
    metaDescription:
      "Compare AI guardrails and agent security — Azure AI Content Safety, Amazon Bedrock Guardrails, Google Model Armor, and third-party runtime safety tools.",
    summary: "Runtime guardrails, content safety, and agent security posture controls.",
    intro:
      "Compare cloud guardrails with independent safety and agent-security vendors on certifications, data residency, and deployment ownership — full details on each tool's page.",
    iconName: "shield-check",
    evaluateLabel: "Block unsafe prompts, outputs, or actions",
    schemaApplicationCategory: "SecurityApplication",
  },
  assistants: {
    slug: "assistants",
    navLabel: "Assistants & copilots",
    title: "AI Assistants",
    metaDescription:
      "Compare coding assistants, productivity copilots, and build-your-own assistant platforms across Microsoft, AWS, Google, and independent vendors.",
    summary: "Coding copilots, productivity assistants, and build-your-own assistant platforms.",
    intro:
      "Compare coding, productivity, and build-your-own assistants on deployment surface, admin controls, and certification posture — full details on each tool's page.",
    iconName: "briefcase-business",
    evaluateLabel: "Equip staff or developers with an AI assistant",
    schemaApplicationCategory: "BusinessApplication",
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
    evaluateLabel: "Let an agent work for us unattended",
    schemaApplicationCategory: "BusinessApplication",
  },
};

// Hub links for "related hubs" blocks, so cross-links list every category.
export const CATEGORY_HUB_LINKS: readonly CategoryHubLink[] = CATEGORY_ORDER.map((category) => ({
  href: `/${category}`,
  title: CATEGORIES[category].title,
  description: CATEGORIES[category].summary,
}));

export type LayerId = "build" | "control" | "use";

export type StackLayer = {
  id: LayerId;
  label: string;
  // Short description shown under the label in navigation and on the stack map.
  tagline: string;
  href: string;
  title: string;
  metaDescription: string;
  intro: string;
  categories: readonly ToolCategory[];
};

// Three layers on top of the cloud platforms (the foundation, /platforms).
// The split follows the industry framing: Forrester separates the build and
// orchestration planes from the agent control plane, and places inventory,
// identity, guardrails and monitoring inside the control plane. This site also
// places gateways there, as the point where policy is enforced on every call.
export const STACK_LAYERS: readonly StackLayer[] = [
  {
    id: "build",
    label: "Build & orchestrate",
    tagline: "Write agents and chain them into workflows",
    href: "/build",
    title: "Build & Orchestrate AI Agents",
    metaDescription:
      "Agent frameworks and workflow orchestration for enterprise AI: compare cloud agent services, open source frameworks, and automation platforms in one place.",
    intro:
      "This is where teams write agents and connect them to business processes: agent frameworks for the reasoning loop, and workflow engines for the steps, approvals, and systems around it.",
    categories: ["agents", "orchestration"],
  },
  {
    id: "control",
    label: "Control plane",
    tagline: "Govern, secure, and observe every agent",
    href: "/control-plane",
    title: "The AI Agent Control Plane",
    metaDescription:
      "The agent control plane: registry and management, identity and access, guardrails, monitoring and evaluation, and AI gateways for enterprise AI agents.",
    intro:
      "The control plane sits outside the tools that build agents. It answers which agents exist, who they act as, what they may do, whether they are behaving, and which calls they are allowed to make.",
    categories: ["control-planes", "agent-identity", "governance", "observability", "gateways"],
  },
  {
    id: "use",
    label: "Use",
    tagline: "AI that employees and developers work with",
    href: "/use",
    title: "AI Assistants & Always-on Agents",
    metaDescription:
      "AI that people use at work: coding assistants, productivity copilots, build-your-own assistants, and always-on agents that act on a user's behalf.",
    intro:
      "The layer people actually see: assistants that answer when asked, and always-on agents that keep working on a user's behalf. Both inherit the controls set in the layers below.",
    categories: ["assistants", "always-on-agents"],
  },
];

export const FOUNDATION_LINK = {
  label: "Foundation",
  tagline: "Cloud AI platforms the stack runs on",
  href: "/platforms",
  title: "Cloud AI platforms",
} as const;

export function getStackLayer(id: LayerId): StackLayer {
  const layer = STACK_LAYERS.find((candidate) => candidate.id === id);
  if (!layer) throw new Error(`Unknown stack layer ${id}`);
  return layer;
}

// Published framings the control plane grouping follows, shown on /control-plane.
export const CONTROL_PLANE_FRAMING: readonly { name: string; summary: string; url: string }[] = [
  {
    name: "Forrester",
    summary:
      "Defines an agent control plane that inventories, governs, orchestrates and assures agents across vendors, separate from the planes that build agents and orchestrate processes.",
    url: "https://www.forrester.com/blogs/announcing-our-evaluation-of-the-agent-control-plane-market/",
  },
  {
    name: "Microsoft",
    summary: "Positions Agent 365 as the control plane for agents, organised as observe, govern and secure.",
    url: "https://learn.microsoft.com/en-us/microsoft-agent-365/overview",
  },
];

export function layerForCategory(category: ToolCategory): StackLayer {
  const layer = STACK_LAYERS.find((candidate) => candidate.categories.includes(category));
  if (!layer) throw new Error(`Category ${category} is not assigned to a stack layer`);
  return layer;
}
