import { describe, expect, it } from "vitest";
import { InterviewPrepResponseSchema } from "./schema";

const validResponse = {
  candidateSummary: "Experienced frontend engineer moving toward platform work.",
  focusAreas: ["Distributed systems", "Leadership examples"],
  questions: [
    {
      question: "Tell me about a time you scaled a system under load.",
      category: "behavioral",
      rationale: "The JD emphasizes scale; resume lacks explicit examples.",
      whatAGoodAnswerCovers: ["Concrete metrics", "Trade-offs made", "Outcome"],
    },
    {
      question: "How would you design a rate limiter for a public API?",
      category: "technical",
      rationale: "JD lists API reliability as a core responsibility.",
      whatAGoodAnswerCovers: ["Algorithm choice", "Edge cases", "Trade-offs"],
    },
    {
      question: "Describe a situation where you had to push back on a deadline.",
      category: "situational",
      rationale: "Role requires managing stakeholder expectations.",
      whatAGoodAnswerCovers: ["Context", "Communication approach", "Resolution"],
    },
  ],
};

describe("InterviewPrepResponseSchema", () => {
  it("accepts a well-formed response", () => {
    const result = InterviewPrepResponseSchema.safeParse(validResponse);
    expect(result.success).toBe(true);
  });

  it("rejects a response missing required fields", () => {
    const withoutQuestions: Partial<typeof validResponse> = { ...validResponse };
    delete withoutQuestions.questions;
    const result = InterviewPrepResponseSchema.safeParse(withoutQuestions);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid category enum value", () => {
    const invalid = {
      ...validResponse,
      questions: [{ ...validResponse.questions[0], category: "made-up-category" }],
    };
    const result = InterviewPrepResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects fewer than the minimum number of questions", () => {
    const invalid = { ...validResponse, questions: [] };
    const result = InterviewPrepResponseSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
