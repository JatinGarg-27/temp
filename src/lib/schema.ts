import { z } from "zod";

export const QuestionCategory = z.enum([
  "technical",
  "behavioral",
  "situational",
  "role-specific",
]);

export const InterviewQuestionSchema = z.object({
  question: z.string().min(1),
  category: QuestionCategory,
  rationale: z
    .string()
    .min(1)
    .describe("Why this question matters given the resume/job description"),
  whatAGoodAnswerCovers: z.array(z.string().min(1)).min(1).max(6),
});

export const InterviewPrepResponseSchema = z.object({
  candidateSummary: z.string().min(1),
  focusAreas: z.array(z.string().min(1)).min(1).max(6),
  questions: z.array(InterviewQuestionSchema).min(3).max(10),
});

export type InterviewQuestion = z.infer<typeof InterviewQuestionSchema>;
export type InterviewPrepResponse = z.infer<typeof InterviewPrepResponseSchema>;

// JSON Schema mirror of InterviewPrepResponseSchema, handed to Claude as a
// tool definition so the model returns structured input instead of prose
// we'd have to parse. Kept in sync with the zod schema by hand since the
// shape is small and stable.
export const interviewPrepToolSchema = {
  name: "submit_interview_prep",
  description:
    "Submit the tailored interview preparation results for the candidate.",
  input_schema: {
    type: "object" as const,
    properties: {
      candidateSummary: {
        type: "string",
        description:
          "2-3 sentence summary of how the candidate's background maps to the job description.",
      },
      focusAreas: {
        type: "array",
        items: { type: "string" },
        minItems: 1,
        maxItems: 6,
        description:
          "Short list of the areas the candidate should focus their prep on, based on gaps or emphasis in the job description.",
      },
      questions: {
        type: "array",
        minItems: 3,
        maxItems: 10,
        items: {
          type: "object",
          properties: {
            question: { type: "string" },
            category: {
              type: "string",
              enum: ["technical", "behavioral", "situational", "role-specific"],
            },
            rationale: {
              type: "string",
              description:
                "Why this question is relevant to this specific resume + job description pairing.",
            },
            whatAGoodAnswerCovers: {
              type: "array",
              items: { type: "string" },
              minItems: 1,
              maxItems: 6,
            },
          },
          required: ["question", "category", "rationale", "whatAGoodAnswerCovers"],
        },
      },
    },
    required: ["candidateSummary", "focusAreas", "questions"],
  },
};
