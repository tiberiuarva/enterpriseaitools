import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, test } from "node:test";
import type { VendorModel, VendorOverview, VendorTimelineEvent } from "./types.ts";
import {
  LENSES,
  monthlyPrice,
  planSteps,
  SECTION_FAQ_IDS,
  roadmapByYear,
  soonestRoadmap,
  splitFaqs,
  audienceLens,
  faqLead,
  firstSentences,
  flagshipName,
  planPriceRange,
  priceDelta,
  availabilityByChannel,
  governanceSummary,
  catalogFamily,
  entryFacets,
  monthsSince,
  isoPoint,
  lensStrength,
  isoPrism,
  modelMap,
  prismsViewBox,
  priceLadder,
  spreadLabels,
  stackLevels,
  stationLabel,
  timelineDensity,
  timelineFamily,
  toPercent,
  towerLayout,
} from "./vendor-viz.ts";

const src = { sourceUrl: "https://www.anthropic.com/x", verifiedAt: "2026-11-01" };

function model(partial: Partial<VendorModel> & Pick<VendorModel, "id" | "name" | "tier" | "releasedAt" | "status">): VendorModel {
  return { apiId: partial.id, generation: "G", ...src, ...partial } as VendorModel;
}

function event(id: string, date: string, type: VendorTimelineEvent["type"], impact?: "high"): VendorTimelineEvent {
  return { id, date, type, title: id, summary: id, impact, ...src } as VendorTimelineEvent;
}

describe("isometric projection", () => {
  test("origin projects to origin and z lifts straight up", () => {
    assert.deepEqual(isoPoint(0, 0, 0), [0, 0]);
    assert.deepEqual(isoPoint(0, 0, 10), [0, -10]);
  });
  test("x moves right-down and y moves left-down", () => {
    const [xRight, yRight] = isoPoint(10, 0, 0);
    const [xLeft, yLeft] = isoPoint(0, 10, 0);
    assert.ok(xRight > 0 && yRight > 0);
    assert.ok(xLeft < 0 && yLeft > 0);
  });
  test("prismsViewBox wraps every corner with padding", () => {
    const box = prismsViewBox([{ x: 0, y: 0, z: 0, w: 10, d: 10, h: 10 }], 2);
    assert.equal(box.y, -12);
    assert.ok(box.width > 17 && box.height > 21);
  });
  test("a prism has three four-point faces", () => {
    const prism = isoPrism({ x: 0, y: 0, z: 0, w: 10, d: 10, h: 5 });
    for (const face of [prism.top, prism.left, prism.right]) assert.equal(face.split(" ").length, 4);
  });
});

describe("spreadLabels", () => {
  test("keeps order and enforces the minimum gap", () => {
    assert.deepEqual(spreadLabels([10, 12, 100], 20), [10, 30, 100]);
  });
  test("handles unsorted input", () => {
    const placed = spreadLabels([50, 0, 45], 10);
    assert.equal(placed[1], 0);
    assert.ok(placed[0] - placed[2] >= 10 || placed[2] - placed[0] >= 10);
  });
});

describe("stackLevels", () => {
  test("pairs the middle families of a five-family stack", () => {
    assert.deepEqual(stackLevels(["a", "b", "c", "d", "e"]), [["a"], ["b"], ["c", "d"], ["e"]]);
  });
  test("small stacks get one level each", () => {
    assert.deepEqual(stackLevels(["a", "b"]), [["a"], ["b"]]);
  });
  test("odd middles leave a single", () => {
    assert.deepEqual(stackLevels(["a", "b", "c", "d"]), [["a"], ["b"], ["c"], ["d"]]);
  });
});

describe("towerLayout", () => {
  const overview = {
    domains: [
      { id: "m", cluster: "products" },
      { id: "p", cluster: "products" },
      { id: "c", cluster: "products" },
      { id: "a", cluster: "products" },
      { id: "i", cluster: "products" },
      { id: "e1", cluster: "ecosystem" },
      { id: "e2", cluster: "ecosystem" },
      { id: "co", cluster: "company" },
    ],
    availability: [{ channel: "direct" }, { channel: "cloud" }, { channel: "partner" }],
  } as unknown as Pick<VendorOverview, "domains" | "availability">;
  const layout = towerLayout(overview);

  test("one slab per product family, bottom first", () => {
    assert.deepEqual(layout.slabs.map((slab) => slab.domainId), ["m", "p", "c", "a", "i"]);
    assert.deepEqual(layout.slabs.map((slab) => slab.level), [0, 1, 2, 2, 3]);
  });
  test("paired families split front and back so both corners face the labels", () => {
    const [back, front] = layout.slabs.filter((slab) => slab.level === 2);
    assert.ok(back.anchor[1] < front.anchor[1], "back half sits higher on screen");
    assert.ok(back.anchor[0] > front.anchor[0], "back half's corner is further right");
  });
  test("the ecosystem label anchors on the right-most ring dot", () => {
    const rightMost = Math.max(...layout.dots.map((dot) => dot.at[0]));
    assert.equal(layout.ecoAnchor[0], rightMost);
  });
  test("studs count direct and cloud channels only", () => {
    assert.equal(layout.studs.length, 2);
  });
  test("one ring dot per ecosystem family", () => {
    assert.deepEqual(layout.dots.map((dot) => dot.domainId), ["e1", "e2"]);
  });
  test("labels sit right of the drawing and never overlap", () => {
    const ys = [...layout.slabs.map((slab) => slab.label[1]), layout.baseLabel[1], layout.ecoLabel[1]].sort((a, b) => a - b);
    for (let index = 1; index < ys.length; index += 1) assert.ok(ys[index] - ys[index - 1] >= 53.9);
    for (const slab of layout.slabs) assert.ok(slab.label[0] > slab.anchor[0]);
  });
  test("the drawing takes most of the width, leaving a label gutter", () => {
    assert.ok(layout.drawingShare > 0.4 && layout.drawingShare < 0.9, String(layout.drawingShare));
  });
  test("every label lands inside the viewBox", () => {
    for (const slab of layout.slabs) {
      const { left, top } = toPercent(slab.label, layout.viewBox);
      assert.ok(left > 0 && left < 100 && top > 0 && top < 100, `${slab.domainId} ${left},${top}`);
    }
  });
});

describe("audienceLens", () => {
  test("counts each entry once per lens it matches", () => {
    const { domains, totals } = audienceLens([
      { domainId: "a", audience: ["developers", "enterprise"] },
      { domainId: "a", audience: ["admins", "enterprise"] },
      { domainId: "b", audience: ["education"] },
    ] as never);
    assert.equal(domains.get("a")?.total, 2);
    assert.equal(domains.get("a")?.byLens.enterprise, 2);
    assert.equal(domains.get("a")?.byLens.developers, 1);
    assert.equal(domains.get("b")?.byLens.public, 1);
    assert.equal(totals.enterprise, 2);
  });
});

describe("LENSES", () => {
  test("ids match the static lens rules in app/globals.css", () => {
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    assert.deepEqual(LENSES.map((lens) => lens.id), ["developers", "enterprise", "everyone", "researchers", "public"]);
    for (const lens of LENSES) {
      assert.ok(css.includes(`#lens-${lens.id}:checked) [data-lens-count="${lens.id}"]`), `missing count rule for ${lens.id}`);
      assert.ok(css.includes(`#lens-${lens.id}:checked) :is(.vo-slab, .vo-dot) { --lens: var(--s-${lens.id}`), `missing dim rule for ${lens.id}`);
    }
  });
});

describe("flagshipName", () => {
  test("derives the product line from the models family", () => {
    assert.equal(flagshipName({ name: "Anthropic", domains: [{ cluster: "products", label: "Claude models" }] } as never), "Claude");
  });
  test("falls back to the vendor name", () => {
    assert.equal(flagshipName({ name: "Acme", domains: [{ cluster: "products", label: "Tools" }] } as never), "Acme");
  });
});

describe("lensStrength", () => {
  test("rises with share, stays visible, caps at one", () => {
    assert.equal(lensStrength(0, 10), 0.1);
    assert.equal(lensStrength(10, 10), 1);
    assert.ok(lensStrength(8, 10) > lensStrength(2, 10));
    assert.equal(lensStrength(3, 0), 0.1);
  });
});

describe("catalog directory", () => {
  test("monthsSince counts calendar months and ignores year-only dates", () => {
    assert.equal(monthsSince("2026-08-18", "2026-11-26"), 3);
    assert.equal(monthsSince("2025-12", "2026-01-05"), 1);
    assert.equal(monthsSince("2026", "2026-11-26"), undefined);
  });
  test("entryFacets marks recent launches and previews", () => {
    assert.deepEqual(entryFacets({ status: "beta", launchedAt: "2026-10-01" }, "2026-11-26"), ["new", "preview"]);
    assert.deepEqual(entryFacets({ status: "ga", launchedAt: "2026-07-31" }, "2026-11-26"), []);
    assert.deepEqual(entryFacets({ status: "ga", launchedAt: "2027-01" }, "2026-11-26"), []);
    assert.deepEqual(entryFacets({ status: "research-preview" }, "2026-11-26"), ["preview"]);
  });
  test("catalogFamily features headline entries and groups the rest in family order", () => {
    const entries = [
      { id: "a", prominence: "standard", groupId: "g2" },
      { id: "b", prominence: "headline", groupId: "g1" },
      { id: "c", prominence: "detail", groupId: "g1" },
      { id: "d", prominence: "standard" },
    ] as const;
    const family = catalogFamily({ groups: [{ id: "g1", label: "One" }, { id: "g2", label: "Two" }] }, entries);
    assert.deepEqual(family.featured.map((entry) => entry.id), ["b"]);
    assert.deepEqual(
      family.groups.map((group) => [group.id, group.items.map((entry) => entry.id)]),
      [
        ["g1", ["c"]],
        ["g2", ["a"]],
        ["", ["d"]],
      ],
    );
  });
  test("catalogFamily falls back to the first three when nothing is a headline", () => {
    const entries = [1, 2, 3, 4].map((n) => ({ id: String(n), prominence: "standard" as const }));
    assert.deepEqual(
      catalogFamily({ groups: [] }, entries).featured.map((entry) => entry.id),
      ["1", "2", "3"],
    );
  });
});

describe("modelMap", () => {
  const models = [
    model({ id: "o3", name: "Claude Opus 3", tier: "Opus", releasedAt: "2024-03-04", status: "retired", retiresAt: "2026-01-05" }),
    model({ id: "s3", name: "Claude Sonnet 3", tier: "Sonnet", releasedAt: "2024-03-04", status: "retired", retiresAt: "2025-07-21" }),
    model({ id: "o5", name: "Claude Opus 5", tier: "Opus", releasedAt: "2026-07-24", status: "current" }),
  ];
  const map = modelMap(models, "2026-11-26");

  test("lanes follow first appearance and stations are time-ordered", () => {
    assert.deepEqual(map.lanes.map((lane) => lane.tier), ["Opus", "Sonnet"]);
    const opus = map.lanes[0];
    assert.ok(opus.stations[0].x < opus.stations[1].x);
  });
  test("live lanes run to today, retired lanes stop at their last retirement", () => {
    const [opus, sonnet] = map.lanes;
    assert.ok(opus.live && !sonnet.live);
    assert.ok(opus.end > sonnet.end);
    assert.ok(opus.end < 100);
    assert.equal(opus.end, map.today);
  });
  test("same-day launches across tiers form an interchange", () => {
    assert.deepEqual(map.interchanges, [{ x: map.lanes[0].stations[0].x, tiers: ["Opus", "Sonnet"] }]);
  });
  test("year ticks start at the first release year", () => {
    assert.deepEqual(map.ticks.map((tick) => tick.year), ["2024", "2025", "2026"]);
    assert.equal(map.ticks[0].x, 0);
  });
  test("empty input yields an empty map", () => {
    assert.deepEqual(modelMap([], "2026-01-01"), { today: 0, lanes: [], ticks: [], interchanges: [] });
  });
});

describe("stationLabel", () => {
  test("strips the brand and tier", () => {
    assert.equal(stationLabel({ name: "Claude Opus 4.5", tier: "Opus" }), "4.5");
    assert.equal(stationLabel({ name: "Claude Mythos Preview", tier: "Mythos" }), "Preview");
  });
  test("compacts a dated revision", () => {
    assert.equal(stationLabel({ name: "Claude Sonnet 3.5 (Oct 2024)", tier: "Sonnet" }), "3.5 Oct");
  });
  test("keeps the name when nothing is left", () => {
    assert.equal(stationLabel({ name: "Claude 2.1", tier: "Claude" }), "2.1");
  });
});

describe("priceLadder", () => {
  const pricing = (input: number, output: number) => ({ inputPerMTok: input, outputPerMTok: output, currency: "USD" as const, asOf: "2026-11-01" });
  const models = [
    model({ id: "f2", name: "Claude Fable 5.2", tier: "Fable", releasedAt: "2026-11-09", status: "current", pricing: pricing(8, 40), contextWindow: "1M", maxOutput: "128K" }),
    model({ id: "f1", name: "Claude Fable 5.1", tier: "Fable", releasedAt: "2026-09-01", status: "legacy", pricing: pricing(10, 50) }),
    model({ id: "h", name: "Claude Haiku 5.5", tier: "Haiku", releasedAt: "2026-10-07", status: "current", pricing: pricing(0.1, 0.5), contextWindow: "1M", maxOutput: "128K" }),
    model({ id: "m", name: "Claude Mythos 5.2", tier: "Mythos", releasedAt: "2026-11-09", status: "current" }),
  ];
  const ladder = priceLadder(models);

  test("only current priced models, most expensive first", () => {
    assert.deepEqual(ladder.rows.map((row) => row.model.id), ["f2", "h"]);
    assert.equal(ladder.max, 50);
    assert.equal(ladder.rows[0].outputPct, 80);
  });
  test("shows the previous priced model in the same tier", () => {
    assert.equal(ladder.rows[0].previous?.name, "Claude Fable 5.1");
    assert.equal(ladder.rows[0].previous?.outputPct, 100);
    assert.equal(ladder.rows[1].previous, undefined);
  });
  test("collapses a shared context window", () => {
    assert.equal(ladder.sharedContext, "1M");
    assert.equal(ladder.sharedOutput, "128K");
  });
});

describe("channels and governance", () => {
  test("groups channels in a fixed order and drops empty groups", () => {
    const groups = availabilityByChannel([{ id: "b", channel: "cloud" }, { id: "a", channel: "direct" }] as never);
    assert.deepEqual(groups.map((group) => group.id), ["direct", "cloud"]);
  });
  test("counts governance statuses and puts yes first", () => {
    const { counts, ordered } = governanceSummary([
      { id: "p", label: "P", claim: { status: "partial" } },
      { id: "y", label: "Y", claim: { status: "yes" } },
    ] as never);
    assert.equal(counts.yes, 1);
    assert.equal(counts.partial, 1);
    assert.deepEqual(ordered.map((row) => row.id), ["y", "p"]);
  });
});

describe("timeline", () => {
  const events = [
    event("a", "2023-03-14", "model", "high"),
    event("b", "2024-09", "safety-policy"),
    event("c", "2024-11-25", "open-source", "high"),
    event("d", "2024-02-01", "product"),
  ];

  test("maps every type to a family", () => {
    assert.equal(timelineFamily("deprecation"), "models");
    assert.equal(timelineFamily("enterprise"), "products");
    assert.equal(timelineFamily("research"), "safety");
    assert.equal(timelineFamily("partnership"), "company");
  });
  test("bins events by year and quarter, partial dates included", () => {
    const density = timelineDensity(events);
    assert.deepEqual(density.map((year) => [year.year, year.count]), [["2023", 1], ["2024", 3]]);
    const y2024 = density[1];
    assert.deepEqual(y2024.quarters.map((quarter) => quarter.events.map((item) => item.id)), [["d"], [], ["b"], ["c"]]);
    assert.equal(y2024.quarters[3].events[0].high, true);
  });
  test("fills empty years between events", () => {
    assert.deepEqual(timelineDensity([event("x", "2021-01-01", "company"), event("y", "2023-01-01", "company")]).map((year) => year.count), [1, 0, 1]);
  });
});

describe("summaries", () => {
  test("splitFaqs separates heading questions from the rest, keeping order", () => {
    const faqs = [{ id: "a" }, { id: "b" }, { id: "c" }];
    assert.deepEqual(splitFaqs(faqs, ["c", "a"]), { asked: [{ id: "a" }, { id: "c" }], more: [{ id: "b" }] });
  });
  test("soonestRoadmap takes dated items in date order and never undated ones", () => {
    const items = [{ id: "u" }, { id: "late", expectedAt: "2027-03" }, { id: "soon", expectedAt: "2026-12-15" }, { id: "mid", expectedAt: "2027-01" }];
    assert.deepEqual(
      soonestRoadmap(items, 2).map((item) => item.id),
      ["soon", "mid"],
    );
    assert.deepEqual(
      soonestRoadmap(items, 9).map((item) => item.id),
      ["soon", "mid", "late"],
    );
    assert.deepEqual(soonestRoadmap(items, -1), []);
  });
});

describe("published overview renders", () => {
  test("anthropic.json produces a full tower, map and ladder", () => {
    const overview = JSON.parse(readFileSync(new URL("../data/stacks/anthropic.json", import.meta.url), "utf8")) as VendorOverview;
    const tower = towerLayout(overview);
    assert.equal(tower.slabs.length, overview.domains.filter((domain) => domain.cluster === "products").length);
    const map = modelMap(overview.models, overview.reviewedAt);
    assert.equal(map.lanes.reduce((sum, lane) => sum + lane.stations.length, 0), overview.models.length);
    for (const lane of map.lanes) for (const station of lane.stations) assert.ok(station.x >= 0 && station.x <= 100);
    assert.ok(priceLadder(overview.models).rows.length > 0);
    // Every question the page asks as a heading has an answer in the data.
    for (const id of SECTION_FAQ_IDS) assert.ok(overview.faqs.some((faq) => faq.id === id), id);
    assert.equal(timelineDensity(overview.timeline).reduce((sum, year) => sum + year.count, 0), overview.timeline.length);
  });
});

describe("copy helpers", () => {
  test("priceDelta rounds the percent change", () => {
    assert.equal(priceDelta(40, 50), -20);
    assert.equal(priceDelta(10, 10), 0);
    assert.equal(priceDelta(0.5, 5), -90);
    assert.equal(priceDelta(5, 0), 0);
  });
  test("firstSentences keeps decimals and versions intact", () => {
    assert.equal(firstSentences("Costs $0.10 per token. Then more.", 1), "Costs $0.10 per token.");
    assert.equal(firstSentences("RSP v3.4 applies. Next. Last.", 2), "RSP v3.4 applies. Next.");
    assert.equal(firstSentences("No end", 1), "No end");
  });
  test("planPriceRange reads plain monthly prices only", () => {
    const range = planPriceRange(
      [
        { segment: "individual", price: "$0" },
        { segment: "individual", price: "$200/mo" },
        { segment: "individual", price: "$20/mo" },
        { segment: "team", price: "$25/seat/mo" },
        { segment: "individual", price: "Contact sales" },
      ],
      ["individual"],
    );
    assert.deepEqual(range, { min: 0, max: 200 });
    assert.equal(planPriceRange([{ segment: "team", price: "$25/seat/mo" }], ["team"]), undefined);
  });
  test("faqLead pulls the question, first sentence and first source", () => {
    const lead = faqLead([{ id: "a", question: "Q?", answer: "One. Two.", sourceUrls: ["https://x"] }], "a");
    assert.deepEqual(lead, { question: "Q?", lead: "One.", sourceUrl: "https://x" });
    assert.equal(faqLead([], "a"), undefined);
  });
});

describe("plans and roadmap helpers", () => {
  test("monthlyPrice reads plain monthly prices only", () => {
    assert.equal(monthlyPrice("$0"), 0);
    assert.equal(monthlyPrice("$20/mo"), 20);
    assert.equal(monthlyPrice("$25/seat/mo"), undefined);
    assert.equal(monthlyPrice("Pay per token"), undefined);
  });
  test("planSteps sorts cheapest first and keeps every step proportional above the floor", () => {
    const steps = planSteps(
      [
        { segment: "individual", price: "$200/mo" },
        { segment: "individual", price: "$0" },
        { segment: "individual", price: "$20/mo" },
        { segment: "team", price: "$25/seat/mo" },
      ],
      ["individual"],
    );
    assert.deepEqual(steps.map((step) => step.monthly), [0, 20, 200]);
    assert.deepEqual(steps.map((step) => step.heightPct), [10, 19, 100]);
  });
  test("roadmapByYear groups dated items by year and keeps undated last", () => {
    const grouped = roadmapByYear([
      { id: "b", expectedAt: "2027-01-15" },
      { id: "u" },
      { id: "a", expectedAt: "2026-12" },
      { id: "c", expectedAt: "2026-11-30" },
    ] as { id: string; expectedAt?: string }[]);
    assert.deepEqual(grouped.years.map((group) => [group.year, group.items.map((item) => item.id)]), [
      ["2026", ["c", "a"]],
      ["2027", ["b"]],
    ]);
    assert.deepEqual(grouped.undated.map((item) => item.id), ["u"]);
  });
});
