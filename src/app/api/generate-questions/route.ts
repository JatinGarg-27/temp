import { NextRequest, NextResponse } from "next/server";
import { AIServiceError, generateInterviewPrep } from "@/lib/claude";
import { extractTextFromPdf, PdfExtractionError } from "@/lib/pdf";
import { isRateLimited } from "@/lib/rateLimit";
import { hasErrors, validateInterviewPrepInput, validatePdfFile } from "@/lib/validation";

export const runtime = "nodejs";

function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for") ?? "anonymous";
}

export async function POST(req: NextRequest) {
  if (isRateLimited(clientKey(req))) {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Too many requests. Wait a minute and try again." } },
      { status: 429 }
    );
  }

  let resumeText: string;
  let jobDescription: string;

  try {
    const form = await req.formData();
    jobDescription = String(form.get("jobDescription") ?? "");
    const resumeFile = form.get("resumeFile");
    const resumeTextField = form.get("resumeText");

    if (resumeFile instanceof File && resumeFile.size > 0) {
      const fileError = validatePdfFile(resumeFile);
      if (fileError) {
        return NextResponse.json(
          { error: { code: "invalid_input", message: fileError, field: "resumeText" } },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await resumeFile.arrayBuffer());
      resumeText = await extractTextFromPdf(buffer);
    } else {
      resumeText = String(resumeTextField ?? "");
    }
  } catch (err) {
    if (err instanceof PdfExtractionError) {
      return NextResponse.json(
        { error: { code: "invalid_input", message: err.message, field: "resumeText" } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: { code: "invalid_input", message: "Couldn't read the submitted form data." } },
      { status: 400 }
    );
  }

  const fieldErrors = validateInterviewPrepInput({ resumeText, jobDescription });
  if (hasErrors(fieldErrors)) {
    return NextResponse.json(
      { error: { code: "invalid_input", message: "Fix the highlighted fields.", fieldErrors } },
      { status: 400 }
    );
  }

  try {
    const result = await generateInterviewPrep(resumeText, jobDescription);
    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof AIServiceError) {
      const status = err.code === "rate_limited" ? 429 : err.code === "timeout" ? 504 : 502;
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status }
      );
    }
    return NextResponse.json(
      { error: { code: "upstream_error", message: "Something went wrong generating your prep." } },
      { status: 500 }
    );
  }
}
