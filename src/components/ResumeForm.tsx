"use client";

import { useId, useState, type FormEvent } from "react";
import {
  LIMITS,
  hasErrors,
  validateJobDescription,
  validatePdfFile,
  validateResumeText,
  type FieldErrors,
} from "@/lib/validation";

type ResumeMode = "paste" | "upload";

export type ResumeFormSubmission = {
  formData: FormData;
};

type Props = {
  onSubmit: (submission: ResumeFormSubmission) => void;
  isSubmitting: boolean;
  serverFieldErrors?: FieldErrors;
};

export function ResumeForm({ onSubmit, isSubmitting, serverFieldErrors }: Props) {
  const [mode, setMode] = useState<ResumeMode>("paste");
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});

  const resumeErrorId = useId();
  const jdErrorId = useId();
  const resumeHintId = useId();
  const jdHintId = useId();

  const errors: FieldErrors = { ...clientErrors, ...serverFieldErrors };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const fileError = validatePdfFile(file);
      setClientErrors((prev) => ({ ...prev, resumeText: fileError ?? undefined }));
      setResumeFile(fileError ? null : file);
    } else {
      setResumeFile(null);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: FieldErrors = {};

    if (mode === "upload") {
      if (!resumeFile) {
        nextErrors.resumeText = "Choose a PDF resume to upload.";
      }
    } else {
      const resumeError = validateResumeText(resumeText);
      if (resumeError) nextErrors.resumeText = resumeError;
    }

    const jdError = validateJobDescription(jobDescription);
    if (jdError) nextErrors.jobDescription = jdError;

    setClientErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const formData = new FormData();
    formData.set("jobDescription", jobDescription);
    if (mode === "upload" && resumeFile) {
      formData.set("resumeFile", resumeFile);
    } else {
      formData.set("resumeText", resumeText);
    }

    onSubmit({ formData });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-foreground">Resume</legend>
        <div className="flex gap-2" role="radiogroup" aria-label="Resume input method">
          <button
            type="button"
            role="radio"
            aria-checked={mode === "paste"}
            onClick={() => setMode("paste")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
              mode === "paste"
                ? "bg-foreground text-background border-foreground"
                : "border-black/15 dark:border-white/20 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
            }`}
          >
            Paste text
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={mode === "upload"}
            onClick={() => setMode("upload")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${
              mode === "upload"
                ? "bg-foreground text-background border-foreground"
                : "border-black/15 dark:border-white/20 hover:bg-black/[.04] dark:hover:bg-white/[.06]"
            }`}
          >
            Upload PDF
          </button>
        </div>

        {mode === "paste" ? (
          <>
            <label htmlFor="resumeText" className="sr-only">
              Resume text
            </label>
            <textarea
              id="resumeText"
              name="resumeText"
              rows={10}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              aria-describedby={`${resumeHintId} ${errors.resumeText ? resumeErrorId : ""}`.trim()}
              aria-invalid={Boolean(errors.resumeText)}
              className="w-full rounded-lg border border-black/15 dark:border-white/20 bg-transparent p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste the full text of your resume here..."
            />
            <p id={resumeHintId} className="text-xs text-zinc-500">
              {resumeText.trim().length.toLocaleString()} / {LIMITS.resumeMax.toLocaleString()} characters
            </p>
          </>
        ) : (
          <>
            <label htmlFor="resumeFile" className="text-xs text-zinc-500">
              PDF resume, up to {LIMITS.pdfMaxBytes / (1024 * 1024)}MB
            </label>
            <input
              id="resumeFile"
              name="resumeFile"
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              aria-describedby={errors.resumeText ? resumeErrorId : undefined}
              aria-invalid={Boolean(errors.resumeText)}
              className="text-sm file:mr-3 file:rounded-full file:border-0 file:bg-foreground file:text-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
            />
            {resumeFile && !errors.resumeText && (
              <p className="text-xs text-zinc-500">Selected: {resumeFile.name}</p>
            )}
          </>
        )}
        {errors.resumeText && (
          <p id={resumeErrorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.resumeText}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="jobDescription" className="text-sm font-medium text-foreground">
          Job description
        </label>
        <textarea
          id="jobDescription"
          name="jobDescription"
          rows={10}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          aria-describedby={`${jdHintId} ${errors.jobDescription ? jdErrorId : ""}`.trim()}
          aria-invalid={Boolean(errors.jobDescription)}
          className="w-full rounded-lg border border-black/15 dark:border-white/20 bg-transparent p-3 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste the job description you're preparing for..."
        />
        <p id={jdHintId} className="text-xs text-zinc-500">
          {jobDescription.trim().length.toLocaleString()} / {LIMITS.jobDescriptionMax.toLocaleString()} characters
        </p>
        {errors.jobDescription && (
          <p id={jdErrorId} role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.jobDescription}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Generating…" : "Generate interview prep"}
      </button>
    </form>
  );
}
