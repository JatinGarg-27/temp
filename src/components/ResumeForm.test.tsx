import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { LIMITS } from "@/lib/validation";
import { ResumeForm } from "./ResumeForm";

const validResume = "a".repeat(LIMITS.resumeMin);
const validJd = "b".repeat(LIMITS.jobDescriptionMin);

describe("ResumeForm", () => {
  it("renders resume and job description fields", () => {
    render(<ResumeForm onSubmit={vi.fn()} isSubmitting={false} />);
    expect(screen.getByPlaceholderText(/paste the full text of your resume/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate interview prep/i })).toBeInTheDocument();
  });

  it("shows validation errors instead of submitting when fields are empty", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ResumeForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getByRole("button", { name: /generate interview prep/i }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits form data when the pasted resume and job description are valid", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ResumeForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.type(screen.getByPlaceholderText(/paste the full text of your resume/i), validResume);
    await user.type(screen.getByLabelText(/job description/i), validJd);
    await user.click(screen.getByRole("button", { name: /generate interview prep/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const submission = onSubmit.mock.calls[0][0];
    expect(submission.formData.get("resumeText")).toBe(validResume);
    expect(submission.formData.get("jobDescription")).toBe(validJd);
  });

  it("disables the submit button while submitting", () => {
    render(<ResumeForm onSubmit={vi.fn()} isSubmitting={true} />);
    expect(screen.getByRole("button", { name: /generating/i })).toBeDisabled();
  });

  it("switches to upload mode and requires a file before submitting", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ResumeForm onSubmit={onSubmit} isSubmitting={false} />);

    await user.click(screen.getByRole("radio", { name: /upload pdf/i }));
    await user.type(screen.getByLabelText(/job description/i), validJd);
    await user.click(screen.getByRole("button", { name: /generate interview prep/i }));

    expect(await screen.findByText(/choose a pdf resume/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
