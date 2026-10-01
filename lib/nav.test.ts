import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { navItems, updateSubjectHref } from "./nav.ts";

describe("updateSubjectHref", () => {
  it("sends platform updates to the platforms page anchor", () => {
    assert.equal(updateSubjectHref({ category: "platforms", toolId: "aws-bedrock" }), "/platforms#aws-bedrock");
  });

  it("sends tool updates to the tool page", () => {
    assert.equal(updateSubjectHref({ category: "agents", toolId: "crewai" }), "/tools/crewai");
  });
});

describe("navItems", () => {
  it("has unique hrefs and includes every category hub and layer page", () => {
    const hrefs = navItems.map((item) => item.href);
    assert.equal(new Set(hrefs).size, hrefs.length);
    for (const href of ["/agents", "/control-planes", "/always-on-agents", "/build", "/control-plane", "/use", "/stacks/aws"]) {
      assert.ok(hrefs.includes(href), `navItems is missing ${href}`);
    }
  });
});
