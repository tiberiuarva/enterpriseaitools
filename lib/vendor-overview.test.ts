import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";
import { isCurrentTool, VENDOR_STACKS } from "./stacks.ts";
import type { Tool, UpdateEntry, VendorModel, VendorOverview } from "./types.ts";
import {
  childrenOf,
  currentModels,
  dateKey,
  domainCounts,
  entriesByDomain,
  entrySearchText,
  formatPartialDate,
  formatUsd,
  headlineEntries,
  hostMatches,
  modelLineage,
  overviewSources,
  parseVendorOverview,
  relatedUpdates,
  timelineByYear,
  validateVendorOverview,
  type ValidationContext,
} from "./vendor-overview.ts";

const SRC = { sourceUrl: "https://www.example.com/a", verifiedAt: "2026-11-20" };

function fixture(): VendorOverview {
  return {
    vendor: "example",
    name: "Example",
    title: "Example stack overview",
    description: "Everything Example offers.",
    reviewedAt: "2026-11-25",
    primarySourceHosts: ["example.com"],
    answer: "Example builds models.",
    modelStatusSource: { sourceUrl: "https://example.com/deprecations", verifiedAt: "2026-11-20" },
    answerSources: ["https://example.com/about"],
    domains: [
      { id: "models", label: "Models", tagline: "Model families", intro: "The models.", cluster: "products", groups: [{ id: "frontier", label: "Frontier" }] },
      { id: "research", label: "Research", tagline: "Papers", intro: "Research.", cluster: "ecosystem", groups: [] },
    ],
    entries: [
      { ...SRC, id: "big-model", name: "Big Model", kind: "model-family", domainId: "models", groupId: "frontier", prominence: "headline", status: "ga", audience: ["developers"], description: "The big one.", formerNames: ["Huge Model"], toolId: "tool-a" },
      { ...SRC, id: "big-model-fast", name: "Fast mode", kind: "feature", domainId: "models", parentId: "big-model", prominence: "detail", status: "beta", audience: ["developers"], description: "Faster output." },
      { ...SRC, id: "paper", name: "A paper", kind: "research", domainId: "research", prominence: "headline", status: "active", audience: ["researchers"], description: "Findings." },
    ],
    models: [
      { ...SRC, id: "m1", name: "Big 1", tier: "Big", generation: "1", releasedAt: "2024-01-10", status: "retired", retiresAt: "2025-01-10" },
      { ...SRC, id: "m2", name: "Big 2", tier: "Big", generation: "2", releasedAt: "2025-03-01", status: "current", pricing: { inputPerMTok: 3, outputPerMTok: 15, currency: "USD", asOf: "2026-11-20" } },
      { ...SRC, id: "s2", name: "Small 2", tier: "Small", generation: "2", releasedAt: "2025-02-01", status: "current" },
    ],
    timeline: [
      { ...SRC, id: "e3", date: "2026-05", type: "product", title: "Launch", summary: "Launched.", entryIds: ["big-model"], updateId: "u1" },
      { ...SRC, id: "e2", date: "2025-03-01", type: "model", title: "Big 2", summary: "Released.", modelIds: ["m2"] },
      { ...SRC, id: "e1", date: "2024-01-10", type: "model", title: "Big 1", summary: "Released." },
    ],
    plans: [{ ...SRC, id: "pro", name: "Pro", segment: "individual", price: "$20/mo", includes: ["More usage"] }],
    availability: [{ ...SRC, id: "direct", name: "Direct API", channel: "direct", offers: ["All models"], note: "First party." }],
    governance: [
      { id: "soc2", label: "SOC 2", claim: { status: "yes", detail: "Type II.", sourceUrl: "https://trust.example.com/" } },
      { id: "fedramp", label: "FedRAMP", claim: { status: "unknown", detail: "Not published." } },
    ],
    safetyLevels: [{ ...SRC, id: "l1", label: "Level 1", summary: "Baseline.", state: "in-force" }],
    roadmap: [{ ...SRC, id: "next", title: "Next thing", summary: "Coming.", announcedAt: "2026-10-01", stage: "announced" }],
    company: {
      facts: [{ ...SRC, id: "hq", label: "Headquarters", value: "Somewhere" }],
      partnerships: [{ ...SRC, id: "cloud", partner: "Cloud Co", type: "cloud", date: "2023-09", summary: "Primary cloud." }],
    },
    faqs: [{ id: "what", question: "What is Example?", answer: "A company.", sourceUrls: ["https://example.com/about"] }],
  };
}

const ctx: ValidationContext = {
  toolIds: new Set(["tool-a"]),
  platformIds: new Set(["cloud-platform"]),
  updateIds: new Set(["u1"]),
  vendorToolIds: ["tool-a"],
  today: "2026-11-26",
};

describe("validateVendorOverview", () => {
  it("accepts a well-formed overview", () => {
    assert.deepEqual(validateVendorOverview(fixture(), ctx), []);
  });

  it("rejects sources off the primary host allowlist", () => {
    const data = fixture();
    data.entries[0].sourceUrl = "https://blog.someone-else.net/post";
    assert.ok(validateVendorOverview(data, ctx).some((error) => error.includes("not on a primary source host")));
  });

  it("rejects broken foreign keys", () => {
    const data = fixture();
    data.entries[0].toolId = "missing-tool";
    data.entries[0].domainId = "nope";
    data.timeline[0].updateId = "missing-update";
    data.timeline[1].modelIds = ["missing-model"];
    const errors = validateVendorOverview(data, ctx);
    for (const needle of ['"missing-tool" is not in data/tools.json', '"nope" is not a declared domain', '"missing-update"', '"missing-model" is not a model id']) {
      assert.ok(errors.some((error) => error.includes(needle)), `expected an error mentioning ${needle}`);
    }
  });

  it("requires every current vendor tool to be referenced", () => {
    const errors = validateVendorOverview(fixture(), { ...ctx, vendorToolIds: ["tool-a", "tool-b"] });
    assert.ok(errors.some((error) => error.includes('"tool-b" is not referenced')));
  });

  it("requires a githubUrl wherever a license is stated", () => {
    const data = fixture();
    data.entries[0].license = "Proprietary";
    assert.ok(validateVendorOverview(data, ctx).some((error) => error.includes("entries[0].githubUrl: is required")));
    data.entries[0].githubUrl = "https://www.example.com/repo";
    assert.deepEqual(validateVendorOverview(data, ctx), []);
    delete data.entries[0].license;
    data.entries[0].licenseWarning = "Careful";
    assert.ok(validateVendorOverview(data, ctx).some((error) => error.includes("licenseWarning: needs a license")));
  });

  it("requires license and githubUrl on open-source entries", () => {
    const data = fixture();
    data.entries[2].kind = "open-source";
    const errors = validateVendorOverview(data, ctx);
    assert.ok(errors.some((error) => error.includes("entries[2].license: is required")));
    assert.ok(errors.some((error) => error.includes("entries[2].githubUrl: is required")));
  });

  it("enforces newest-first, non-future timeline dates", () => {
    const data = fixture();
    data.timeline.reverse();
    assert.ok(validateVendorOverview(data, ctx).some((error) => error.includes("newest first")));
    const future = fixture();
    future.timeline[0].date = "2027-01";
    assert.ok(validateVendorOverview(future, ctx).some((error) => error.includes("in the future")));
  });

  it("rejects verifiedAt after reviewedAt and bad dates", () => {
    const data = fixture();
    data.plans[0].verifiedAt = "2026-11-30";
    data.models[0].releasedAt = "2024-02-30";
    const errors = validateVendorOverview(data, ctx);
    assert.ok(errors.some((error) => error.includes("plans[0].verifiedAt")));
    assert.ok(errors.some((error) => error.includes("models[0].releasedAt")));
  });

  it("requires a source for asserted governance claims only", () => {
    const data = fixture();
    delete data.governance[0].claim.sourceUrl;
    const errors = validateVendorOverview(data, ctx);
    assert.ok(errors.some((error) => error.includes("governance[0].claim.sourceUrl: is required")));
    assert.ok(!errors.some((error) => error.includes("governance[1].claim.sourceUrl")));
  });

  it("limits parent depth and keeps children in the parent's domain", () => {
    const data = fixture();
    data.entries.push({ ...SRC, id: "grandchild", name: "Deep", kind: "feature", domainId: "models", parentId: "big-model-fast", prominence: "detail", status: "ga", audience: ["developers"], description: "Too deep." });
    data.entries[1].domainId = "research";
    const errors = validateVendorOverview(data, ctx);
    assert.ok(errors.some((error) => error.includes("max depth 2")));
    assert.ok(errors.some((error) => error.includes("in another domain")));
  });

  it("flags duplicate ids, empty domains and retired models without a date", () => {
    const data = fixture();
    data.entries[2].id = "big-model";
    data.entries[2].domainId = "models";
    delete data.models[0].retiresAt;
    const errors = validateVendorOverview(data, ctx);
    assert.ok(errors.some((error) => error.includes('duplicate id "big-model"')));
    assert.ok(errors.some((error) => error.includes("domains.research: has no entries")));
    assert.ok(errors.some((error) => error.includes("retiresAt: is required")));
  });

  it("parseVendorOverview throws with every finding", () => {
    const data = fixture();
    data.name = "";
    assert.throws(() => parseVendorOverview(data, ctx), /root\.name/);
    assert.equal(parseVendorOverview(fixture(), ctx).vendor, "example");
  });
});

describe("view helpers", () => {
  it("groups top-level entries by domain and counts children", () => {
    const data = fixture();
    const byDomain = entriesByDomain(data);
    assert.deepEqual(byDomain.get("models")?.map((entry) => entry.id), ["big-model"]);
    assert.deepEqual(childrenOf(data.entries, "big-model").map((entry) => entry.id), ["big-model-fast"]);
    assert.deepEqual(domainCounts(data), { models: 2, research: 1 });
    assert.deepEqual(headlineEntries(data.entries, "models").map((entry) => entry.id), ["big-model"]);
  });

  it("builds a lowercase search haystack including former names", () => {
    const text = entrySearchText(fixture().entries[0]);
    assert.ok(text.includes("huge model"));
    assert.ok(text.includes("model family"));
    assert.equal(text, text.toLowerCase());
  });

  it("buckets the timeline by year, newest year first", () => {
    const years = timelineByYear(fixture().timeline);
    assert.deepEqual(years.map((bucket) => bucket.year), ["2026", "2025", "2024"]);
  });

  it("lays out the model lineage by tier and generation", () => {
    const lineage = modelLineage(fixture().models);
    assert.deepEqual(lineage.tiers, ["Big", "Small"]);
    assert.deepEqual(lineage.generations, ["1", "2"]);
    assert.deepEqual(lineage.cell("Big", "2").map((model: VendorModel) => model.id), ["m2"]);
    assert.deepEqual(lineage.cell("Small", "1"), []);
    assert.deepEqual(currentModels(fixture().models).map((model) => model.id), ["m2", "s2"]);
  });

  it("dedupes sources across sections", () => {
    const sources = overviewSources(fixture());
    const urls = sources.map((source) => source.url);
    assert.equal(new Set(urls).size, urls.length);
    assert.ok(urls.includes("https://trust.example.com/"));
    assert.ok(urls.includes("https://example.com/deprecations"));
  });

  it("finds related feed updates by tool id or explicit link", () => {
    const updates = [
      { id: "u1", date: "2026-01-01", toolId: "other", toolName: "Other", category: "agents", type: "release", summary: "x", sourceUrl: "https://a" },
      { id: "u2", date: "2026-02-01", toolId: "tool-a", toolName: "A", category: "agents", type: "release", summary: "y", sourceUrl: "https://b" },
      { id: "u3", date: "2026-03-01", toolId: "unrelated", toolName: "U", category: "agents", type: "release", summary: "z", sourceUrl: "https://c" },
    ] satisfies UpdateEntry[];
    assert.deepEqual(relatedUpdates(fixture(), updates).map((update) => update.id), ["u2", "u1"]);
  });

  it("formats dates, prices and hosts", () => {
    assert.equal(formatPartialDate("2023-03"), "Mar 2023");
    assert.equal(formatPartialDate("2026-11-09"), "9 Nov 2026");
    assert.equal(dateKey("2026-05"), "2026-05-01");
    assert.equal(formatUsd(8), "$8");
    assert.equal(formatUsd(0.1), "$0.10");
    assert.equal(formatUsd(0.25), "$0.25");
    assert.ok(hostMatches("https://www.anthropic.com/news", ["anthropic.com"]));
    assert.ok(!hostMatches("https://anthropic.com.evil.net/", ["anthropic.com"]));
  });
});

describe("published vendor overviews", () => {
  const dir = new URL("../data/stacks/", import.meta.url);
  const files = readdirSync(dir).filter((file) => file.endsWith(".json"));
  const tools = (JSON.parse(readFileSync(new URL("../data/tools.json", import.meta.url), "utf8")) as { tools: Tool[] }).tools;
  const platforms = (JSON.parse(readFileSync(new URL("../data/platforms.json", import.meta.url), "utf8")) as { platforms: { id: string }[] }).platforms;
  const updates = (JSON.parse(readFileSync(new URL("../data/updates.json", import.meta.url), "utf8")) as { updates: { id: string }[] }).updates;

  it("has at least one overview", () => {
    assert.ok(files.length > 0);
  });

  for (const file of files) {
    it(`${file} validates against the schema and the dataset`, () => {
      const raw: unknown = JSON.parse(readFileSync(new URL(file, dir), "utf8"));
      const slug = file.replace(/\.json$/, "");
      const stack = VENDOR_STACKS.find((candidate) => candidate.slug === slug);
      assert.ok(stack, `${slug} is not in VENDOR_STACKS`);
      const vendorToolIds = tools.filter((tool) => tool.vendor !== undefined && stack.vendorNames.includes(tool.vendor) && isCurrentTool(tool)).map((tool) => tool.id);
      const errors = validateVendorOverview(raw, {
        toolIds: new Set(tools.map((tool) => tool.id)),
        platformIds: new Set(platforms.map((platform) => platform.id)),
        updateIds: new Set(updates.map((update) => update.id)),
        vendorToolIds,
        today: new Date().toISOString().slice(0, 10),
      });
      assert.deepEqual(errors, []);
      assert.equal((raw as { vendor: string }).vendor, slug);
    });
  }
});
