import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { InterviewPrepResponse } from "@/lib/schema";
import { QuestionList } from "./QuestionList";

const sample: InterviewPrepResponse = {
  candidateSummary: "Frontend engineer with strong React experience, light on backend.",
  focusAreas: ["API design", "System design"],
  questions: [
    {
      question: "Walk me through how you'd design a rate limiter.",
      category: "technical",
      rationale: "JD calls out API reliability; resume has no backend examples.",
      whatAGoodAnswerCovers: ["Algorithm choice", "Trade-offs", "Failure modes"],
    },
    {
      question: "Tell me about a time you disagreed with a teammate.",
      category: "behavioral",
      rationale: "Role requires cross-team collaboration.",
      whatAGoodAnswerCovers: ["Situation", "Resolution", "Outcome"],
    },
  ],
};

describe("QuestionList", () => {
  it("renders the candidate summary and focus areas", () => {
    render(<QuestionList data={sample} />);
    expect(screen.getByText(sample.candidateSummary)).toBeInTheDocument();
    expect(screen.getByText("API design")).toBeInTheDocument();
    expect(screen.getByText("System design")).toBeInTheDocument();
  });

  it("renders every question with its category and answer guidance", () => {
    render(<QuestionList data={sample} />);
    for (const q of sample.questions) {
      expect(screen.getByText(q.question)).toBeInTheDocument();
      for (const point of q.whatAGoodAnswerCovers) {
        expect(screen.getByText(point)).toBeInTheDocument();
      }
    }
    expect(screen.getByText("Technical")).toBeInTheDocument();
    expect(screen.getByText("Behavioral")).toBeInTheDocument();
  });
});
