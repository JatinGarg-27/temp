"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { QuestionList } from "@/components/QuestionList";
import { ResumeForm, type ResumeFormSubmission } from "@/components/ResumeForm";
import { StatusRegion } from "@/components/StatusRegion";
import { InterviewPrepResponseSchema, type InterviewPrepResponse } from "@/lib/schema";
import type { FieldErrors } from "@/lib/validation";

type Status = "idle" | "loading" | "success" | "error";

const REQUEST_TIMEOUT_MS = 60_000;

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "You've hit the request limit. Wait about a minute and try again.",
  timeout: "The AI service took too long to respond. Please try again.",
  upstream_error: "The AI service had a problem generating your prep. Please try again.",
  missing_api_key: "This deployment is missing its AI service configuration.",
  invalid_input: "Fix the highlighted fields and try again.",
  network_error: "Couldn't reach the server. Check your connection and try again.",
};

export default function Home() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<InterviewPrepResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [lastSubmission, setLastSubmission] = useState<FormData | null>(null);

  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") resultsContainerRef.current?.focus();
    if (status === "error") errorRef.current?.focus();
  }, [status]);

  async function submit(formData: FormData) {
    setStatus("loading");
    setErrorMessage(null);
    setFieldErrors({});

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      const body = await res.json();

      if (!res.ok) {
        const code: string = body?.error?.code ?? "upstream_error";
        if (body?.error?.fieldErrors) {
          setFieldErrors(body.error.fieldErrors);
          setErrorMessage(ERROR_MESSAGES.invalid_input);
        } else {
          setErrorMessage(body?.error?.message || ERROR_MESSAGES[code] || "Something went wrong.");
        }
        setStatus("error");
        return;
      }

      const parsed = InterviewPrepResponseSchema.safeParse(body.data);
      if (!parsed.success) {
        setErrorMessage("Received an unexpected response from the server. Please try again.");
        setStatus("error");
        return;
      }

      setResult(parsed.data);
      setStatus("success");
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      setErrorMessage(isAbort ? ERROR_MESSAGES.timeout : ERROR_MESSAGES.network_error);
      setStatus("error");
    } finally {
      clearTimeout(timer);
    }
  }

  function handleSubmit({ formData }: ResumeFormSubmission) {
    setLastSubmission(formData);
    void submit(formData);
  }

  function handleRetry() {
    if (lastSubmission) void submit(lastSubmission);
  }

  const statusMessage =
    status === "loading"
      ? "Generating your interview prep, please wait."
      : status === "success"
        ? "Interview prep ready."
        : status === "error"
          ? `Error: ${errorMessage}`
          : "";

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-black">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:m-3 focus:rounded focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
      >
        Skip to main content
      </a>

      <header className="border-b border-black/10 dark:border-white/10 px-6 py-5">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-xl font-semibold">Interview Prep Copilot</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Paste your resume and a job description to get tailored interview questions.
          </p>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <StatusRegion message={statusMessage} />

        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <ResumeForm
            onSubmit={handleSubmit}
            isSubmitting={status === "loading"}
            serverFieldErrors={fieldErrors}
          />

          <div className="flex flex-col gap-4">
            {status === "error" && errorMessage && (
              <div ref={errorRef} tabIndex={-1}>
                <ErrorBanner message={errorMessage} onRetry={lastSubmission ? handleRetry : undefined} />
              </div>
            )}

            {status === "loading" && (
              <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  aria-hidden="true"
                />
                Generating your interview prep…
              </div>
            )}

            {status === "success" && result && (
              <div ref={resultsContainerRef} tabIndex={-1} className="outline-none">
                <QuestionList data={result} />
              </div>
            )}

            {status === "idle" && (
              <p className="text-sm text-zinc-500">
                Your tailored questions will appear here once you submit the form.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
