import type { ToolCategory } from "./types.ts";

export type JourneyStep = {
  category: ToolCategory;
  // What to settle at this step, phrased as the decision a team has to make.
  decide: string;
};

export type Journey = {
  id: string;
  question: string;
  summary: string;
  steps: readonly JourneyStep[];
};

// Curated paths across the stack for the most common starting questions. Each
// step links to a category hub; the copy states decisions, not vendor claims,
// so every factual statement stays on the source-backed tool records.
export const JOURNEYS: readonly Journey[] = [
  {
    id: "roll-out-assistants",
    question: "Roll out Copilot, ChatGPT or Claude to staff safely",
    summary: "Pick the assistant, then put data protection, ownership and access rules around it before the first wave of users.",
    steps: [
      {
        category: "assistants",
        decide: "Which suite fits where people already work, and which plan gives the admin controls, audit logs and data residency you need.",
      },
      {
        category: "governance",
        decide: "How sensitive data is labelled and kept out of prompts and answers, and who reviews blocked or flagged activity.",
      },
      {
        category: "control-planes",
        decide: "Where agents that users build inside the assistant get registered, who owns each one, and how they are retired.",
      },
      {
        category: "agent-identity",
        decide: "Whether those agents act as the user or under their own identity, and how their access is reviewed.",
      },
    ],
  },
  {
    id: "first-agent-in-production",
    question: "Put our first agent into production",
    summary: "Build it with a framework your team can support, wire it into the process, then route, watch and guard it before go-live.",
    steps: [
      {
        category: "agents",
        decide: "A managed cloud agent service or an open source framework, judged on deployment surface, license risk and the skills you have.",
      },
      {
        category: "orchestration",
        decide: "Which steps stay deterministic, where humans approve, and which workflow engine runs them.",
      },
      {
        category: "gateways",
        decide: "One route for model and tool calls, with keys, budgets and rate limits per team or agent.",
      },
      {
        category: "observability",
        decide: "How you trace each run, test quality before release, and catch cost or quality drift after it.",
      },
      {
        category: "governance",
        decide: "Which prompts, outputs and actions are blocked at runtime, and how incidents are escalated.",
      },
    ],
  },
  {
    id: "govern-existing-agents",
    question: "Get control of the agents we already have",
    summary: "Find every agent first, give each one an owner and identity, then apply policy and monitoring across the fleet.",
    steps: [
      {
        category: "control-planes",
        decide: "How agents from every platform are discovered, registered and assigned an accountable owner.",
      },
      {
        category: "agent-identity",
        decide: "Least-privilege access per agent, with access reviews and a way to switch one off quickly.",
      },
      {
        category: "governance",
        decide: "Runtime guardrails and posture checks that apply no matter which tool built the agent.",
      },
      {
        category: "observability",
        decide: "Fleet-wide visibility into what agents did, what it cost and whether outcomes are improving.",
      },
    ],
  },
  {
    id: "decide-always-on-agents",
    question: "Decide whether to allow always-on agents",
    summary: "These agents act without a prompt each time, so treat the decision like granting a new employee access, not like installing an app.",
    steps: [
      {
        category: "always-on-agents",
        decide: "Where the agent runs, what it can reach, which actions need approval, and its security record.",
      },
      {
        category: "agent-identity",
        decide: "Whether it gets its own identity with scoped, revocable access instead of a person's credentials.",
      },
      {
        category: "governance",
        decide: "How it is sandboxed and how third-party skills or plugins are vetted before use.",
      },
      {
        category: "control-planes",
        decide: "How these agents are inventoried alongside the rest of the fleet, with an owner for each.",
      },
    ],
  },
];
