export const LIMITS = {
  resumeMin: 50,
  resumeMax: 15000,
  jobDescriptionMin: 50,
  jobDescriptionMax: 8000,
  pdfMaxBytes: 5 * 1024 * 1024, // 5MB
} as const;

export type FieldErrors = {
  resumeText?: string;
  jobDescription?: string;
};

export function validateResumeText(value: string): string | undefined {
  const resume = value.trim();
  if (resume.length === 0) {
    return "Add your resume text or upload a PDF.";
  }
  if (resume.length < LIMITS.resumeMin) {
    return `Resume looks too short (min ${LIMITS.resumeMin} characters). Add more detail.`;
  }
  if (resume.length > LIMITS.resumeMax) {
    return `Resume is too long (max ${LIMITS.resumeMax.toLocaleString()} characters). Trim it down.`;
  }
  return undefined;
}

export function validateJobDescription(value: string): string | undefined {
  const jd = value.trim();
  if (jd.length === 0) {
    return "Paste the job description you're preparing for.";
  }
  if (jd.length < LIMITS.jobDescriptionMin) {
    return `Job description looks too short (min ${LIMITS.jobDescriptionMin} characters).`;
  }
  if (jd.length > LIMITS.jobDescriptionMax) {
    return `Job description is too long (max ${LIMITS.jobDescriptionMax.toLocaleString()} characters).`;
  }
  return undefined;
}

export function validateInterviewPrepInput(input: {
  resumeText: string;
  jobDescription: string;
}): FieldErrors {
  const errors: FieldErrors = {};
  const resumeError = validateResumeText(input.resumeText);
  const jdError = validateJobDescription(input.jobDescription);
  if (resumeError) errors.resumeText = resumeError;
  if (jdError) errors.jobDescription = jdError;
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function validatePdfFile(file: { size: number; type: string; name: string }): string | null {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files are supported.";
  }
  if (file.size > LIMITS.pdfMaxBytes) {
    return `PDF is too large (max ${LIMITS.pdfMaxBytes / (1024 * 1024)}MB).`;
  }
  if (file.size === 0) {
    return "That PDF appears to be empty.";
  }
  return null;
}
