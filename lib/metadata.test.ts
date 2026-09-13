import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Metadata } from "next";
import { atomFeedTitle, buildAtomFeedLinks, buildMetadata, siteUrl } from "./metadata.ts";

/**
 * Next's resolved `OpenGraph` union only exposes `type` on some members, so
 * read it through a guard rather than widening with a cast.
 */
function openGraphType(metadata: Metadata): string | undefined {
  const openGraph: unknown = metadata.openGraph;

  if (openGraph && typeof openGraph === "object" && "type" in openGraph) {
    const { type } = openGraph as { type?: unknown };
    return typeof type === "string" ? type : undefined;
  }

  return undefined;
}

describe("atomFeedTitle", () => {
  it("labels the site-wide feed", () => {
    assert.equal(atomFeedTitle("/updates.xml"), "enterpriseai.tools weekly updates feed");
  });

  it("labels a category feed by its slug", () => {
    assert.equal(atomFeedTitle("/updates-agents.xml"), "enterpriseai.tools agents updates feed");
    assert.equal(atomFeedTitle("/updates-licenses.xml"), "enterpriseai.tools licenses updates feed");
  });
});

describe("buildAtomFeedLinks", () => {
  it("advertises the site-wide feed even when no category feed is given", () => {
    assert.deepEqual(buildAtomFeedLinks(), [
      { title: "enterpriseai.tools weekly updates feed", url: `${siteUrl}/updates.xml` },
    ]);
  });

  it("advertises both feeds on a hub that has a category feed", () => {
    assert.deepEqual(buildAtomFeedLinks("/updates-agents.xml"), [
      { title: "enterpriseai.tools weekly updates feed", url: `${siteUrl}/updates.xml` },
      { title: "enterpriseai.tools agents updates feed", url: `${siteUrl}/updates-agents.xml` },
    ]);
  });

  it("does not emit the site-wide feed twice", () => {
    assert.equal(buildAtomFeedLinks("/updates.xml").length, 1);
  });
});

describe("buildMetadata", () => {
  it("builds a trailing-slash canonical for a nested route", () => {
    const metadata = buildMetadata({ path: "/tools/langgraph" });
    assert.equal(metadata.alternates?.canonical, `${siteUrl}/tools/langgraph/`);
  });

  it("keeps the site root canonical as a bare slash", () => {
    const metadata = buildMetadata({ path: "/" });
    assert.equal(metadata.alternates?.canonical, `${siteUrl}/`);
  });

  it("marks pages with a modified time as articles so recency is exposed", () => {
    const metadata = buildMetadata({ path: "/tools/crewai", modifiedTime: "2026-05-26" });
    assert.equal(openGraphType(metadata), "article");
  });

  it("defaults to a website OpenGraph type without a modified time", () => {
    assert.equal(openGraphType(buildMetadata({ path: "/about" })), "website");
  });
});
