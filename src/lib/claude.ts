import Anthropic from "@anthropic-ai/sdk";
import {
  InterviewPrepResponseSchema,
  interviewPrepToolSchema,
  type InterviewPrepResponse,
} from "./schema";
import { buildUserPrompt, SYSTEM_PROMPT } from "./prompt";

export type AIErrorCode =
  | "missing_api_key"
  | "timeout"
  | "rate_limited"
  | "upstream_error"
  | "invalid_response";

export class AIServiceError extends Error {
  code: AIErrorCode;
  constructor(code: AIErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AIServiceError";
  }
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_ATTEMPTS = 2;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AIServiceError(
      "missing_api_key",
      "ANTHROPIC_API_KEY is not configured on the server."
    );
  }
  return new Anthropic({ apiKey });
}

function extractToolInput(message: Anthropic.Message): unknown {
  const toolUse = message.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );
  if (!toolUse) return null;
  return toolUse.input;
}

export async function generateInterviewPrep(
  resumeText: string,
  jobDescription: string
): Promise<InterviewPrepResponse> {
  const client = getClient();
  const userPrompt = buildUserPrompt(resumeText, jobDescription);

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const message = await client.messages.create(
        {
          model: MODEL,
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          tools: [interviewPrepToolSchema],
          tool_choice: { type: "tool", name: interviewPrepToolSchema.name },
          messages: [{ role: "user", content: userPrompt }],
        },
        { timeout: REQUEST_TIMEOUT_MS }
      );

      const rawInput = extractToolInput(message);
      const parsed = InterviewPrepResponseSchema.safeParse(rawInput);

      if (parsed.success) {
        return parsed.data;
      }

      lastError = new AIServiceError(
        "invalid_response",
        `Model response did not match the expected schema: ${parsed.error.message}`
      );
    } catch (err) {
      lastError = mapSdkError(err);
      // Don't burn a retry on errors that won't change on a second try.
      if (
        lastError instanceof AIServiceError &&
        lastError.code !== "invalid_response"
      ) {
        break;
      }
    }
  }

  if (lastError instanceof AIServiceError) throw lastError;
  throw new AIServiceError("upstream_error", "Failed to generate interview prep.");
}

function mapSdkError(err: unknown): AIServiceError {
  if (err instanceof Anthropic.APIError) {
    // Log full detail server-side; never forward raw provider error bodies to the client.
    console.error("Anthropic API error", err.status, err.message);
    if (err.status === 429) {
      return new AIServiceError(
        "rate_limited",
        "The AI service is rate-limited right now. Try again in a moment."
      );
    }
    return new AIServiceError(
      "upstream_error",
      "The AI service had a problem generating your prep. Please try again."
    );
  }
  if (err instanceof Error && err.name === "APIConnectionTimeoutError") {
    return new AIServiceError("timeout", "The AI service took too long to respond.");
  }
  return new AIServiceError(
    "upstream_error",
    err instanceof Error ? err.message : "Unknown AI service error."
  );
}
