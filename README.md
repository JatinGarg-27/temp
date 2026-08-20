# Interview Prep Copilot

Paste a resume and a job description, get back a tailored set of interview
questions — mixed across technical, behavioral, situational, and role-specific
categories — along with the reasoning behind each one and what a strong
answer should cover.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Anthropic SDK** (`@anthropic-ai/sdk`) for the AI call
- **Zod** for runtime schema validation
- **pdf-parse** for server-side PDF text extraction
- **Vitest** + **React Testing Library** for unit/component tests

## How it works

1. The client (`src/components/ResumeForm.tsx`) collects a resume (pasted
   text or a PDF upload) and a job description, running client-side
   validation (`src/lib/validation.ts`) before submitting.
2. `POST /api/generate-questions` (`src/app/api/generate-questions/route.ts`)
   re-validates the input server-side, extracts text from any uploaded PDF
   (`src/lib/pdf.ts`), and calls Claude.
3. The AI call (`src/lib/claude.ts`) forces a **tool call** rather than free
   text — Claude must invoke `submit_interview_prep` with arguments matching
   a fixed JSON schema (`src/lib/schema.ts`). The response is then validated
   again with the equivalent Zod schema. This avoids the usual "parse JSON
   out of a markdown code fence and hope it's well-formed" failure mode. If
   the model returns something that fails Zod validation, the request is
   retried once before surfacing an error.
4. The client renders results (`src/components/QuestionList.tsx`) or a
   friendly, retryable error state (`src/components/ErrorBanner.tsx`).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000.

### Scripts

| Command                 | Purpose                         |
| ------------------------ | -------------------------------- |
| `npm run dev`             | Start the dev server (Turbopack) |
| `npm run build`           | Production build                 |
| `npm start`               | Run the production build         |
| `npm run lint`             | ESLint                           |
| `npm test`                 | Run the test suite once          |
| `npm run test:watch`       | Run tests in watch mode          |
| `npm run test:coverage`    | Run tests with coverage report   |

## Environment variables

See `.env.example`.

- `ANTHROPIC_API_KEY` (required) — server-side only, never exposed to the client.
- `ANTHROPIC_MODEL` (optional) — defaults to `claude-sonnet-5`.

## Error handling & resilience

- **Input validation** happens client-side (fast feedback) and again
  server-side (source of truth) — see `src/lib/validation.ts`.
- **PDF extraction failures** (corrupt, password-protected, scanned/no text,
  wrong file type, oversized) return a specific, user-facing message rather
  than a generic 500.
- **AI failures** are typed (`AIServiceError` in `src/lib/claude.ts`) with a
  distinct code per failure mode — timeout, rate limit, malformed response,
  missing config, upstream error — each mapped to a plain-language message
  in the UI (`src/app/page.tsx`).
- **Malformed model output** triggers one automatic retry before failing.
- **Client-side requests** carry a 60s timeout via `AbortController` and
  surface a "Try again" action that resubmits the last payload.
- A minimal in-memory **rate limiter** (`src/lib/rateLimit.ts`) caps requests
  per client per minute.

## Accessibility

- Semantic landmarks (`header`, `main`), a skip-to-content link, and labeled
  form fields with `aria-describedby` hints/errors.
- A visually-hidden `aria-live="polite"` status region announces
  loading/success/error transitions for screen reader users
  (`src/components/StatusRegion.tsx`).
- Focus moves to the results or error region after each submission so
  keyboard/screen-reader users land where the new content is.
- Visible focus rings (`:focus-visible`) and a `prefers-reduced-motion`
  override in `globals.css`.

## Testing

```bash
npm test
```

Covers: input validation edge cases, the Zod response schema, and the two
core components (`ResumeForm`, `QuestionList`) including the empty-submit
validation path and the PDF-required-when-no-file-chosen path.

## Known limitations

- The rate limiter is in-memory and per-instance — it resets on redeploy and
  won't coordinate across multiple serverless instances. Fine for a small
  deployment; swap for a shared store (Redis, etc.) before scaling out.
- PDF extraction is text-only; scanned/image-only PDFs won't yield text and
  will surface a clear error asking the user to paste text instead.
- No persistence — nothing is stored; each request is stateless.
