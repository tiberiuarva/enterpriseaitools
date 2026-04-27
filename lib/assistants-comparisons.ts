export type AssistantsSubcategory = "coding" | "productivity" | "build-your-own";

export type AssistantsComparison = {
  title: string;
  vendors: [string, string, string];
  rows: {
    attribute: string;
    values: [string, string, string];
  }[];
};

export const assistantsComparisons: Record<AssistantsSubcategory, AssistantsComparison> = {
  coding: {
    title: "Coding assistants",
    vendors: ["GitHub Copilot", "Amazon Q Developer", "Gemini Code Assist"],
    rows: [
      {
        attribute: "Free tier",
        values: ["2K completions, 50 premium", "50 agentic req/mo", "180K completions/mo"],
      },
      {
        attribute: "Individual pricing",
        values: ["$10/mo Pro, $39 Pro+", "$19/user/mo Pro", "~$19/mo Standard"],
      },
      {
        attribute: "Enterprise pricing",
        values: ["$39/user/mo", "Custom", "~$45/user/mo"],
      },
      {
        attribute: "IP indemnity",
        values: ["Business+", "Pro only", "Unclear"],
      },
      {
        attribute: "SOC 2",
        values: ["Yes", "Yes", "Yes"],
      },
    ],
  },
  productivity: {
    title: "Productivity assistants",
    vendors: ["Microsoft 365 Copilot", "Gemini for Workspace", "Amazon Q Business"],
    rows: [
      {
        attribute: "Entry price",
        values: ["Free (Chat) / $21/user/mo Biz", "$7/user/mo Starter", "$3/user/mo Lite"],
      },
      {
        attribute: "Full AI price",
        values: ["$30/user/mo Enterprise", "$14/user/mo Standard", "$20/user/mo Pro"],
      },
      {
        attribute: "Prerequisite",
        values: ["M365 subscription", "Workspace subscription", "Standalone (none)"],
      },
      {
        attribute: "Key differentiator",
        values: ["Deepest M365 integration", "AI bundled in base plan", "40+ data connectors; low entry"],
      },
      {
        attribute: "Data policy",
        values: ["Biz/Enterprise: NOT used", "Standard+: NOT used", "Never used for training"],
      },
    ],
  },
  "build-your-own": {
    title: "Build-your-own assistant platforms",
    vendors: ["Copilot Studio", "Amazon Q Apps", "Gemini Enterprise"],
    rows: [
      {
        attribute: "Description",
        values: ["Low-code agent/copilot builder", "No-code AI apps from natural language", "Enterprise agentic AI platform"],
      },
      {
        attribute: "Pricing",
        values: ["Free with M365 Copilot; $200/mo standalone", "Included in Q Business Pro", "$21/user/mo Business; contact for higher tiers"],
      },
      {
        attribute: "Code required",
        values: ["No (low-code)", "No (no-code)", "No (no-code)"],
      },
      {
        attribute: "External publish",
        values: ["Yes (web, apps, social)", "Limited", "Yes (multiple channels)"],
      },
      {
        attribute: "Key integration",
        values: ["M365, Teams, Power Automate", "Q Business connectors", "Workspace, M365, ServiceNow, Jira, Salesforce"],
      },
    ],
  },
};
