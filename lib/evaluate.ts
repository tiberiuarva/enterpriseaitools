import type { Tool, ToolCategory } from "./types.ts";

// Pure, client-safe scoring for the guided "help me evaluate" flow.
// No data import here — callers pass the tool set in, so this stays testable.

export type IntakeAnswers = {
  category: ToolCategory;
  sector: "regulated" | "general";
  dataSensitivity: "high" | "medium" | "low";
  deployment: "self-hosted-required" | "on-prem-required" | "self-hosted-preferred" | "saas-ok";
  jurisdiction: "eu" | "us" | "global";
  euAiAct: "high-risk" | "limited" | "unsure";
  ossTolerance: "permissive-required" | "oss-ok" | "proprietary-ok";
  certifications: "soc2-required" | "iso27001-required" | "nice-to-have" | "not-needed";
  auditLogging: "required" | "nice-to-have" | "not-needed";
};

export type EvaluateQuestion = {
  id: keyof IntakeAnswers;
  label: string;
  help: string;
  options: { value: string; label: string }[];
};

export const EVALUATE_QUESTIONS: EvaluateQuestion[] = [
  {
    id: "category",
    label: "What are you evaluating?",
    help: "We only compare tools within the layer you pick.",
    options: [
      { value: "agents", label: "Agent frameworks" },
      { value: "orchestration", label: "Orchestration / workflow" },
      { value: "governance", label: "Governance / guardrails" },
      { value: "assistants", label: "Assistants / copilots" },
    ],
  },
  {
    id: "sector",
    label: "What is your environment?",
    help: "Regulated environments weight certifications and data controls more heavily.",
    options: [
      { value: "regulated", label: "Regulated (finance, health, public sector)" },
      { value: "general", label: "General enterprise" },
    ],
  },
  {
    id: "dataSensitivity",
    label: "How sensitive is the data involved?",
    help: "Drives weight on data residency, audit logging, and attestations.",
    options: [
      { value: "high", label: "High — confidential / regulated data" },
      { value: "medium", label: "Medium — internal business data" },
      { value: "low", label: "Low — public or low-impact data" },
    ],
  },
  {
    id: "deployment",
    label: "What deployment model do you need?",
    help: "A hard requirement filters the list; a preference only ranks.",
    options: [
      { value: "self-hosted-required", label: "Must be self-hostable" },
      { value: "on-prem-required", label: "Must support on-prem / sovereign" },
      { value: "self-hosted-preferred", label: "Prefer self-hostable" },
      { value: "saas-ok", label: "Managed SaaS is fine" },
    ],
  },
  {
    id: "jurisdiction",
    label: "Where must data stay?",
    help: "EU/region constraints weight data residency and ISO certification.",
    options: [
      { value: "eu", label: "EU data residency needed" },
      { value: "us", label: "US" },
      { value: "global", label: "No strict residency constraint" },
    ],
  },
  {
    id: "euAiAct",
    label: "EU AI Act exposure of your system?",
    help: "High-risk systems weight ISO 42001 and a documented compliance posture.",
    options: [
      { value: "high-risk", label: "Likely high-risk" },
      { value: "limited", label: "Limited / minimal risk" },
      { value: "unsure", label: "Not sure yet" },
    ],
  },
  {
    id: "ossTolerance",
    label: "Open-source / licensing tolerance?",
    help: "Controls how license risk affects ranking and filtering.",
    options: [
      { value: "permissive-required", label: "Need permissive open source" },
      { value: "oss-ok", label: "Open source or source-available is fine" },
      { value: "proprietary-ok", label: "Proprietary is fine" },
    ],
  },
  {
    id: "certifications",
    label: "Certification requirement?",
    help: "Required certs strongly rank tools that hold them.",
    options: [
      { value: "soc2-required", label: "SOC 2 required" },
      { value: "iso27001-required", label: "ISO 27001 required" },
      { value: "nice-to-have", label: "Nice to have" },
      { value: "not-needed", label: "Not needed" },
    ],
  },
  {
    id: "auditLogging",
    label: "Audit logging requirement?",
    help: "Required logging ranks tools with native audit logs first.",
    options: [
      { value: "required", label: "Required" },
      { value: "nice-to-have", label: "Nice to have" },
      { value: "not-needed", label: "Not needed" },
    ],
  },
];

export type EvaluateResult = {
  tool: Tool;
  score: number;
  matches: string[];
  cautions: string[];
};

// Hard filters remove tools that cannot satisfy a stated requirement.
function passesHardFilters(tool: Tool, answers: IntakeAnswers): boolean {
  if (tool.category !== answers.category) return false;

  const models = tool.governance.deployment.models;
  if (answers.deployment === "self-hosted-required" && !models.includes("self-hosted")) return false;
  if (answers.deployment === "on-prem-required" && !models.includes("on-prem") && !models.includes("sovereign")) {
    return false;
  }
  if (answers.ossTolerance === "permissive-required" && tool.type === "vendor") return false;

  return true;
}

export function scoreTool(tool: Tool, answers: IntakeAnswers): EvaluateResult {
  const g = tool.governance;
  const matches: string[] = [];
  const cautions: string[] = [];
  let score = 0;

  const regulatedWeight = answers.sector === "regulated" ? 2 : 1;

  const award = (points: number, reason: string) => {
    score += points;
    matches.push(reason);
  };
  const caution = (reason: string) => cautions.push(reason);

  if (answers.deployment === "self-hosted-preferred" && g.deployment.models.includes("self-hosted")) {
    award(2, "Self-hostable");
  }

  if (answers.dataSensitivity === "high") {
    if (g.dataResidency.status === "yes") award(2, "Customer-controlled data residency");
    else caution("Data residency is not fully customer-controlled");
    if (g.auditLogging.status === "yes") award(2 * regulatedWeight, "Native audit logging");
  } else if (answers.dataSensitivity === "medium" && g.dataResidency.status === "yes") {
    award(1, "Customer-controlled data residency");
  }

  if (answers.jurisdiction === "eu") {
    if (g.dataResidency.status === "yes") award(2, "Supports regional data residency");
    if (g.iso27001.status === "yes") award(1, "ISO 27001 certified");
  }

  if (answers.euAiAct === "high-risk") {
    if (g.iso42001.status === "yes") award(3, "ISO 42001 (AI management) certified");
    else caution("No ISO 42001 certification");
    if (g.soc2.status === "yes" && g.iso27001.status === "yes") award(1, "SOC 2 + ISO 27001");
  }

  if (answers.ossTolerance === "permissive-required") {
    if (g.licenseRisk.level === "low") award(3, "Permissive low-risk license");
    else caution("License is not low-risk permissive");
  } else if (answers.ossTolerance === "oss-ok") {
    if (g.licenseRisk.level === "low") award(2, "Low license risk");
    else if (g.licenseRisk.level === "medium") award(1, "Moderate license risk");
    else if (g.licenseRisk.level === "high") caution("High license risk");
  }

  if (answers.certifications === "soc2-required") {
    if (g.soc2.status === "yes") award(3 * regulatedWeight, "SOC 2 attested");
    else caution("No SOC 2 attestation");
  } else if (answers.certifications === "iso27001-required") {
    if (g.iso27001.status === "yes") award(3 * regulatedWeight, "ISO 27001 certified");
    else caution("No ISO 27001 certification");
  } else if (answers.certifications === "nice-to-have") {
    if (g.soc2.status === "yes") award(1, "SOC 2 attested");
    if (g.iso27001.status === "yes") award(1, "ISO 27001 certified");
  }

  if (answers.auditLogging === "required") {
    if (g.auditLogging.status === "yes") award(3, "Native audit logging");
    else caution("No native audit logging");
  } else if (answers.auditLogging === "nice-to-have" && g.auditLogging.status === "yes") {
    award(1, "Native audit logging");
  }

  if (tool.status !== "active") caution(`Project status: ${tool.status}`);

  return { tool, score, matches, cautions };
}

export function evaluateTools(tools: Tool[], answers: IntakeAnswers, limit = 8): EvaluateResult[] {
  return tools
    .filter((tool) => passesHardFilters(tool, answers))
    .map((tool) => scoreTool(tool, answers))
    .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name))
    .slice(0, limit);
}
