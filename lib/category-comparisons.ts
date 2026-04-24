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
          "Fully managed agent platform inside Microsoft Foundry",
          "Managed Bedrock agents paired with the AgentCore runtime layer",
          "Vertex AI agent tooling paired with the open ADK",
        ],
      },
      {
        attribute: "SDK Languages",
        values: [
          "Python, C#, JS/TS, Java",
          "Python-first plus broader AWS SDK coverage",
          "Python, Java, Go, TypeScript",
        ],
      },
      {
        attribute: "Model access",
        values: [
          "11,000+ models through Microsoft Foundry",
          "100+ managed foundation models in Bedrock",
          "200+ models through Vertex AI and Model Garden",
        ],
      },
      {
        attribute: "Pricing shape",
        values: [
          "Platform is free to explore; usage is billed around model and tool consumption",
          "Pay-per-token plus usage-based agent/runtime features",
          "Pay-per-token plus usage-based runtime and platform resources",
        ],
      },
      {
        attribute: "Entry credits",
        values: [
          "$200 Azure credit",
          "$200 AWS credit",
          "$300 GCP credit + AI Studio free playground",
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
          "Strong Microsoft 365 and enterprise workflow integration",
          "Framework-agnostic runtime approach with strong AWS-native fit",
          "ADK + Vertex AI combination with strong grounding and search tie-ins",
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
          "iPaaS workflow automation with AI-adjacent integration depth",
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
          "Broad connector ecosystem across enterprise apps and Azure services",
          "Deep AWS service integration",
          "GCP services + HTTP APIs",
        ],
      },
      {
        attribute: "Self-hostable",
        values: ["Partial (Standard plan)", "No", "No"],
      },
      {
        attribute: "Current positioning",
        values: [
          "Best when broad connector coverage matters",
          "Best when orchestration stays mostly inside AWS",
          "Best when simple GCP-native workflow orchestration is enough",
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
          "$0.15/1K text units after the recent Bedrock Guardrails price cut",
          "Pay-as-you-go",
        ],
      },
      {
        attribute: "Unique capability",
        values: [
          "On-premises containers + on-device deployment path",
          "Automated Reasoning for formal-policy style checks",
          "Apigee + GKE + Security Command Center integration path",
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
