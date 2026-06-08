import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  agentsFaqs,
  assistantsFaqs,
  categoryFaqs,
  governanceFaqs,
  homeFaqs,
  orchestrationFaqs,
  platformsFaqs,
  type HubFaq,
} from "./hub-faqs.ts";

const allHubs: Record<string, HubFaq[]> = {
  home: homeFaqs,
  platforms: platformsFaqs,
  agents: agentsFaqs,
  orchestration: orchestrationFaqs,
  governance: governanceFaqs,
  assistants: assistantsFaqs,
};

describe("hub-faqs", () => {
  for (const [hub, faqs] of Object.entries(allHubs)) {
    it(`${hub} has 3–5 well-formed FAQ entries`, () => {
      assert.ok(Array.isArray(faqs), `${hub} faqs should be an array`);
      assert.ok(faqs.length >= 3 && faqs.length <= 5, `${hub} should have 3–5 entries, got ${faqs.length}`);
      for (const faq of faqs) {
        assert.equal(typeof faq.question, "string");
        assert.ok(faq.question.trim().length > 0, `${hub} has an empty question`);
        assert.ok(faq.question.trim().endsWith("?"), `${hub} question should be phrased as a question: ${faq.question}`);
        assert.equal(typeof faq.answer, "string");
        assert.ok(faq.answer.trim().length > 0, `${hub} has an empty answer`);
      }
    });

    it(`${hub} has unique questions`, () => {
      const questions = faqs.map((faq) => faq.question);
      assert.equal(new Set(questions).size, questions.length, `${hub} has duplicate questions`);
    });
  }

  it("categoryFaqs maps each tracked category to its FAQ list", () => {
    assert.equal(categoryFaqs.agents, agentsFaqs);
    assert.equal(categoryFaqs.orchestration, orchestrationFaqs);
    assert.equal(categoryFaqs.governance, governanceFaqs);
    assert.equal(categoryFaqs.assistants, assistantsFaqs);
  });
});
