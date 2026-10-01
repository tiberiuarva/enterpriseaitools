import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { withBasePath, withTrailingSlash } from "./site.ts";

describe("withTrailingSlash", () => {
  it("adds the canonical trailing slash to page routes", () => {
    assert.equal(withTrailingSlash("/platforms"), "/platforms/");
    assert.equal(withTrailingSlash("/tools/langgraph"), "/tools/langgraph/");
    assert.equal(withTrailingSlash("/tools/compare/langgraph-vs-semantic-kernel"), "/tools/compare/langgraph-vs-semantic-kernel/");
  });

  it("leaves an already-normalised route alone", () => {
    assert.equal(withTrailingSlash("/"), "/");
    assert.equal(withTrailingSlash("/platforms/"), "/platforms/");
  });

  it("never rewrites a file path", () => {
    assert.equal(withTrailingSlash("/updates.xml"), "/updates.xml");
    assert.equal(withTrailingSlash("/updates-licenses.xml"), "/updates-licenses.xml");
    assert.equal(withTrailingSlash("/eu-ai-act-deadlines.ics"), "/eu-ai-act-deadlines.ics");
    assert.equal(withTrailingSlash("/api/v1/index.json"), "/api/v1/index.json");
    assert.equal(withTrailingSlash("/logos/n8n.svg"), "/logos/n8n.svg");
    assert.equal(withTrailingSlash("/social-preview.png"), "/social-preview.png");
  });

  it("keeps the slash before a hash fragment", () => {
    assert.equal(withTrailingSlash("/updates#auto-detected"), "/updates/#auto-detected");
    assert.equal(withTrailingSlash("/platforms#microsoft-foundry"), "/platforms/#microsoft-foundry");
  });

  it("keeps the slash before a query string", () => {
    assert.equal(withTrailingSlash("/updates?category=agents"), "/updates/?category=agents");
  });

  it("does not touch a fragment already anchored on a slashed route", () => {
    assert.equal(withTrailingSlash("/updates/#auto-detected"), "/updates/#auto-detected");
  });

  it("passes through anything that is not a root-relative path", () => {
    assert.equal(withTrailingSlash("https://example.com/docs"), "https://example.com/docs");
    assert.equal(withTrailingSlash("#main-content"), "#main-content");
    assert.equal(withTrailingSlash("mailto:someone@example.com"), "mailto:someone@example.com");
  });
});

describe("withBasePath", () => {
  // These assertions run with NEXT_PUBLIC_BASE_PATH unset, matching production.
  it("normalises internal routes", () => {
    assert.equal(withBasePath("/"), "/");
    assert.equal(withBasePath("/agents"), "/agents/");
    assert.equal(withBasePath("/tools/crewai"), "/tools/crewai/");
  });

  it("leaves static assets and external links untouched", () => {
    assert.equal(withBasePath("/icon.svg"), "/icon.svg");
    assert.equal(withBasePath("/updates.xml"), "/updates.xml");
    assert.equal(withBasePath("https://github.com/tiberiuarva/enterpriseaitools"), "https://github.com/tiberiuarva/enterpriseaitools");
  });

  it("falls back to the site root for an empty path", () => {
    assert.equal(withBasePath(""), "/");
  });
});
