import type { ToolCategory } from "@/lib/types";

export type ComparisonRow = {
  attribute: string;
  values: [string, string, string];
};

export type CategoryComparison = {
  vendors: [string, string, string];
  rows: ComparisonRow[];
};

export const categoryComparisons: Partial<Record<ToolCategory, CategoryComparison>> = {
  agents: {
    vendors: ["Microsoft Foundry Agent Service", "AWS Bedrock Agents + AgentCore", "Google Agent Builder + ADK"],
    rows: [
      {
        attribute: "Description",
        values: [
          "Fully managed agent platform with deep M365 integration",
          "Modular: Agents (guided) + AgentCore (framework-agnostic)",
          "Open ADK + managed Agent Engine",
        ],
      },
      {
        attribute: "SDK Languages",
        values: [
          "Python, C#, JS/TS, Java",
          "Python (primary), all AWS SDKs",
          "Python, Java, Go, TypeScript",
        ],
      },
      {
        attribute: "Model Catalog",
        values: [
          "11,000+ models",
          "100+ foundation models",
          "200+ via Model Garden",
        ],
      },
      {
        attribute: "Pricing",
        values: [
          "Free platform; pay for tokens + tools",
          "Pay-per-use (vCPU/sec, Gateway, Memory)",
          "Pay-per-use (vCPU-hr, GiB-hr)",
        ],
      },
      {
        attribute: "Free Credits",
        values: [
          "$200 Azure",
          "$200 AWS",
          "$300 GCP + Express Mode",
        ],
      },
      {
        attribute: "Protocols",
        values: [
          "MCP, A2A, OpenAPI",
          "MCP, A2A",
          "MCP, A2A, OpenAPI",
        ],
      },
      {
        attribute: "Differentiator",
        values: [
          "One-click M365/Teams deploy; 1,400+ connectors",
          "Max framework agnosticism; microVM isolation",
          "Open-source ADK (7M+ downloads); Search grounding",
        ],
      },
      {
        attribute: "Best for",
        values: [
          "Microsoft-heavy enterprises",
          "AWS-heavy enterprises wanting framework choice",
          "Google-heavy or open-source-first teams",
        ],
      },
    ],
  },
  orchestration: {
    vendors: ["Azure Logic Apps", "AWS Step Functions", "Google Cloud Workflows"],
    rows: [
      {
        attribute: "Description",
        values: [
          "iPaaS workflow automation with AI capabilities",
          "Serverless state machine for AWS service orchestration",
          "Serverless workflow orchestration for GCP services",
        ],
      },
      {
        attribute: "Pricing",
        values: [
          "Pay-per-action or Standard hosting",
          "$0.025/1K transitions (Standard)",
          "$0.01/1K internal; $0.025/1K external",
        ],
      },
      {
        attribute: "Free tier",
        values: [
          "Azure free trial",
          "4,000 transitions/mo",
          "5K internal + 2K external/mo",
        ],
      },
      {
        attribute: "Connectors / integrations",
        values: [
          "1,400+ (broadest)",
          "220+ AWS services",
          "GCP services + HTTP APIs",
        ],
      },
      {
        attribute: "Self-hostable",
        values: ["Partial (Standard plan)", "No", "No"],
      },
      {
        attribute: "Latest update",
        values: [
          "GenAI Copilot automation",
          "28 new integrations + AgentCore (Mar 2026)",
          "Incremental updates",
        ],
      },
    ],
  },
  governance: {
    vendors: ["Azure AI Content Safety", "AWS Bedrock Guardrails", "Google Model Armor"],
    rows: [
      {
        attribute: "Description",
        values: [
          "Content moderation with configurable severity scoring",
          "Configurable safeguards for filtering, PII, hallucinations",
          "Model-agnostic safety screening for prompts and responses",
        ],
      },
      {
        attribute: "Risks covered",
        values: [
          "Toxicity, prompt injection, hallucination, copyright",
          "Content, prompt attacks, PII, hallucination, malicious code",
          "Prompt injection, PII, toxicity, malicious URLs",
        ],
      },
      {
        attribute: "Pricing",
        values: [
          "Pay-per-text-unit; free tier",
          "$0.15/1K text units (85% price cut)",
          "Pay-as-you-go",
        ],
      },
      {
        attribute: "Unique capability",
        values: [
          "On-premises containers + on-device deployment",
          "Automated Reasoning (formal logic, provable)",
          "Apigee + GKE + Security Command Center",
        ],
      },
      {
        attribute: "Integration",
        values: [
          "REST API, Python/C#/Java SDKs",
          "AWS SDK, Bedrock API, AgentCore",
          "REST API, Vertex AI, Apigee, GKE",
        ],
      },
    ],
  },
};
