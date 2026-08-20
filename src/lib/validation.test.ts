import { describe, expect, it } from "vitest";
import {
  LIMITS,
  hasErrors,
  validateInterviewPrepInput,
  validateJobDescription,
  validatePdfFile,
  validateResumeText,
} from "./validation";

const validResume = "a".repeat(LIMITS.resumeMin);
const validJd = "b".repeat(LIMITS.jobDescriptionMin);

describe("validateResumeText", () => {
  it("rejects empty input", () => {
    expect(validateResumeText("")).toMatch(/add your resume/i);
    expect(validateResumeText("   ")).toMatch(/add your resume/i);
  });

  it("rejects input shorter than the minimum", () => {
    expect(validateResumeText("too short")).toMatch(/too short/i);
  });

  it("rejects input longer than the maximum", () => {
    expect(validateResumeText("a".repeat(LIMITS.resumeMax + 1))).toMatch(/too long/i);
  });

  it("accepts input within bounds", () => {
    expect(validateResumeText(validResume)).toBeUndefined();
  });
});

describe("validateJobDescription", () => {
  it("rejects empty input", () => {
    expect(validateJobDescription("")).toMatch(/paste the job description/i);
  });

  it("accepts input within bounds", () => {
    expect(validateJobDescription(validJd)).toBeUndefined();
  });
});

describe("validateInterviewPrepInput", () => {
  it("returns no errors for valid input", () => {
    const errors = validateInterviewPrepInput({ resumeText: validResume, jobDescription: validJd });
    expect(hasErrors(errors)).toBe(false);
  });

  it("returns both field errors when both are invalid", () => {
    const errors = validateInterviewPrepInput({ resumeText: "", jobDescription: "" });
    expect(errors.resumeText).toBeDefined();
    expect(errors.jobDescription).toBeDefined();
    expect(hasErrors(errors)).toBe(true);
  });
});

describe("validatePdfFile", () => {
  it("rejects non-PDF mime types and extensions", () => {
    expect(
      validatePdfFile({ size: 100, type: "image/png", name: "resume.png" })
    ).toMatch(/only pdf/i);
  });

  it("accepts a pdf by extension even with a generic mime type", () => {
    expect(
      validatePdfFile({ size: 100, type: "application/octet-stream", name: "resume.pdf" })
    ).toBeNull();
  });

  it("rejects files over the size limit", () => {
    expect(
      validatePdfFile({ size: LIMITS.pdfMaxBytes + 1, type: "application/pdf", name: "resume.pdf" })
    ).toMatch(/too large/i);
  });

  it("rejects empty files", () => {
    expect(validatePdfFile({ size: 0, type: "application/pdf", name: "resume.pdf" })).toMatch(
      /empty/i
    );
  });

  it("accepts a valid pdf", () => {
    expect(validatePdfFile({ size: 1024, type: "application/pdf", name: "resume.pdf" })).toBeNull();
  });
});
