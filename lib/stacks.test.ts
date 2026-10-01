import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { STACK_LAYERS, getStackLayer } from "./categories.ts";
import {
  buildVendorStack,
  countCoveredCategories,
  countUpdatesByTool,
  isCurrentTool,
  suitesSpanningLayer,
  toolsAlsoCovering,
  vendorStackGaps,
  vendorStackTools, getVendorStack, pairsWith, previewTools, vendorStackForTool } from "./stacks.ts";
import type { Tool, ToolCategory } from "./types.ts";

function tool(spec: Partial<Tool> & { id: string; category: ToolCategory }): Tool {
  return {
    name: spec.id,
    type: "vendor",
    status: "active",
    ...spec,
  } as Tool;
}

const microsoft = getVendorStack("microsoft");
assert.ok(microsoft);

const fixtures: Tool[] = [
  tool({ id: "ms-agents", category: "agents", vendor: "Microsoft" }),
  tool({ id: "ms-suite", category: "control-planes", vendor: "Microsoft", alsoCovers: ["agent-identity", "observability"] }),
  tool({ id: "gh-copilot", category: "assistants", vendor: "GitHub/Microsoft" }),
  tool({ id: "ms-retired", category: "gateways", vendor: "Microsoft", status: "deprecated" }),
  tool({ id: "aws-agents", category: "agents", vendor: "AWS" }),
  tool({ id: "oss-a", category: "agents", type: "opensource", vendor: "Someone", githubStars: 10 }),
  tool({ id: "oss-b", category: "agents", type: "opensource", vendor: "Someone else", githubStars: 50 }),
];

describe("vendor stacks", () => {
  it("places own and alsoCovers tools per category, skipping retired products", () => {
    const rows = buildVendorStack(microsoft, fixtures);
    assert.deepEqual(rows.map((row) => row.layer.id), STACK_LAYERS.map((layer) => layer.id));
    const cell = (category: ToolCategory) =>
      rows.flatMap((row) => row.cells).find((candidate) => candidate.category === category)?.tools.map((t) => t.id);
    assert.deepEqual(cell("agents"), ["ms-agents"]);
    assert.deepEqual(cell("agent-identity"), ["ms-suite"]);
    assert.deepEqual(cell("assistants"), ["gh-copilot"]);
    assert.deepEqual(cell("gateways"), []);
    assert.equal(countCoveredCategories(rows), 5);
  });

  it("matches vendor aliases and rejects unknown slugs", () => {
    assert.equal(vendorStackForTool({ vendor: "GitHub/Microsoft" })?.slug, "microsoft");
    assert.equal(vendorStackForTool({ vendor: "Someone" }), undefined);
    assert.equal(getVendorStack("ibm"), undefined);
  });

  it("pairsWith lists the same vendor's active products in other categories", () => {
    const suite = fixtures.find((t) => t.id === "ms-suite");
    assert.ok(suite);
    assert.deepEqual(pairsWith(suite, fixtures).map((t) => t.id), ["ms-agents", "gh-copilot"]);
    assert.deepEqual(pairsWith(tool({ id: "no-vendor", category: "agents" }), fixtures), []);
  });

  it("previewTools ranks vendor products, then open source by stars", () => {
    assert.deepEqual(previewTools(fixtures, "agents", 4).map((t) => t.id), ["aws-agents", "ms-agents", "oss-b", "oss-a"]);
  });

  it("previewTools puts the most active tools in the update feed first", () => {
    const activity = countUpdatesByTool([{ toolId: "oss-a" }, { toolId: "oss-a" }, { toolId: "ms-agents" }]);
    assert.deepEqual(previewTools(fixtures, "agents", 3, activity).map((t) => t.id), ["oss-a", "ms-agents", "aws-agents"]);
  });

  it("isCurrentTool keeps active and maintenance tools only", () => {
    assert.equal(isCurrentTool({ status: "active" }), true);
    assert.equal(isCurrentTool({ status: "maintenance" }), true);
    assert.equal(isCurrentTool({ status: "deprecated" }), false);
    assert.equal(isCurrentTool({ status: "archived" }), false);
  });

  it("lists gaps and de-duplicated vendor tools", () => {
    const rows = buildVendorStack(microsoft, fixtures);
    assert.deepEqual(vendorStackGaps(rows), ["orchestration", "governance", "gateways", "always-on-agents"]);
    assert.deepEqual(vendorStackTools(rows).map((t) => t.id), ["ms-agents", "ms-suite", "gh-copilot"]);
  });

  it("toolsAlsoCovering and suitesSpanningLayer skip retired suites", () => {
    const extra = [
      ...fixtures,
      tool({ id: "old-suite", category: "governance", status: "archived", alsoCovers: ["agent-identity", "observability"] }),
    ];
    assert.deepEqual(toolsAlsoCovering("agent-identity", extra).map((t) => t.id), ["ms-suite"]);
    assert.deepEqual(suitesSpanningLayer(getStackLayer("control"), extra).map((t) => t.id), ["ms-suite"]);
    assert.deepEqual(suitesSpanningLayer(getStackLayer("build"), extra), []);
  });

  it("pairsWith matches plain vendor names outside the stacks and honours the limit", () => {
    const others = [
      tool({ id: "x-agents", category: "agents", vendor: "Acme" }),
      tool({ id: "x-gateway", category: "gateways", vendor: "Acme" }),
      tool({ id: "x-guard", category: "governance", vendor: "Acme" }),
      tool({ id: "y-guard", category: "governance", vendor: "Other" }),
    ];
    const agents = others[0];
    assert.ok(agents);
    assert.deepEqual(pairsWith(agents, others).map((t) => t.id), ["x-guard", "x-gateway"]);
    assert.deepEqual(pairsWith(agents, others, 1).map((t) => t.id), ["x-guard"]);
  });
});
