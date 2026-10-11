// @vitest-environment node
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { matchFaq, SUGGESTED_QUESTIONS } from "@/lib/chatbot-faq";

describe("fixed FAQ answers", () => {
  it.each([
    ["Hi, how do I request data?", "data-request"],
    ["What is this website?", "about"],
    ["This is unrelated", "fallback"],
    ["NON-TECHNICAL survey", "survey-coverage"],
    ["nontechnical survey", "survey-coverage"],
    ["clearance progress", "land-release"],
    ["open the catalogue", "catalogue"],
    ["Help with mine action datasets", "data-request"],
    ["I found a suspicious object", "safety"],
    ["I found a landmine", "safety"],
    ["How do I report ammunition?", "safety"],
    ["Can I move a grenade?", "safety"],
    ["Is it safe to enter this land?", "safety"],
    ["contact and dashboards", "clarify"],
  ])("matches %s to %s", (question, id) => expect(matchFaq(question).id).toBe(id));
  it("every suggestion has a useful answer and real local link targets", () => {
    for (const question of [...SUGGESTED_QUESTIONS, "clearance progress", "nts", "victim", "qaqc", "mandate", "risk education", "demining", "contact"]) {
      const result = matchFaq(question);
      expect(result.id).not.toBe("fallback");
      expect(result.reply).not.toMatch(/\/(?:dashboards|data-request|contact)/);
      for (const action of result.actions) {
        if (action.href.startsWith("/en/")) expect(existsSync(`app/[locale]/${action.href.slice(4)}/page.tsx`)).toBe(true);
        else expect(existsSync(`public${action.href}`)).toBe(true);
      }
    }
  });
});
