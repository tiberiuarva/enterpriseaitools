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
          "Fully managed agent platform with deep Microsoft 365 integration",
          "Modular stack combining guided agents with framework-agnostic runtime services",
          "Open ADK paired with a managed agent runtime",
        ],
      },
      {
        attribute: "SDK Languages",
        values: [
          "Python, C#, JS/TS, Java",
          "Python-first via Bedrock plus broader AWS SDK coverage",
          "Python, Java, Go, TypeScript",
        ],
      },
      {
        attribute: "Model access",
        values: [
          "Broad Microsoft-hosted and partner model catalog",
          "Broad managed foundation model catalog inside Bedrock",
          "Vertex AI model access plus Model Garden coverage",
        ],
      },
      {
        attribute: "Pricing shape",
        values: [
          "Consumption pricing around model and tool usage",
          "Usage-based pricing across agent/runtime features",
          "Usage-based pricing across runtime and platform resources",
        ],
      },
      {
        attribute: "Entry credits",
        values: [
          "Azure trial credits available",
          "AWS trial credits available",
          "Google Cloud trial credits available",
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
          "Strong Microsoft ecosystem integration and deployment path into enterprise workflows",
          "Framework choice with runtime isolation and modular AWS building blocks",
          "Open ADK path with strong grounding/search tie-ins across Google tooling",
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
          "Broad connector ecosystem",
          "Deep AWS service integration",
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
          "Recent Bedrock/agent ecosystem expansion",
          "Incremental platform updates",
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
