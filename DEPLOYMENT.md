# Deployment checklist

## Before deploying

- [ ] `npm run build` succeeds locally with no errors.
- [ ] `npm run lint` is clean.
- [ ] `npm test` passes.
- [ ] `ANTHROPIC_API_KEY` is set in the hosting platform's environment
      variables (never committed — `.env*` is git-ignored).
- [ ] Optionally set `ANTHROPIC_MODEL` if you want to pin a specific model
      instead of the default (`claude-sonnet-5`).

## Recommended platform

This app is a standard Next.js App Router project with one dynamic API route
(`/api/generate-questions`, `runtime = "nodejs"` because `pdf-parse` needs
Node APIs). It deploys as-is to **Vercel** or any Node-capable host
(Render, Railway, Fly.io, a Docker container running `next start`).

### Vercel

```bash
vercel
```

Add `ANTHROPIC_API_KEY` under Project Settings → Environment Variables for
Production/Preview/Development as needed.

### Self-hosted / Docker

```bash
npm ci
npm run build
npm start
```

Ensure the `ANTHROPIC_API_KEY` env var is present in the runtime environment,
not just at build time.

## After deploying

- [ ] Load the deployed URL and submit a real resume + job description to
      confirm the AI call succeeds end-to-end (not just that the page
      renders).
- [ ] Submit an empty form to confirm client-side validation still fires.
- [ ] Upload a non-PDF file to confirm the file-type error message appears.
- [ ] Trigger the rate limiter (6+ requests within a minute) to confirm the
      429 path returns a friendly message instead of a raw error.
- [ ] Check the browser console and server logs for unexpected errors during
      the above.

## Scaling beyond a single instance

The in-memory rate limiter (`src/lib/rateLimit.ts`) is per-process. If you
deploy multiple instances/regions behind a load balancer, requests won't
share rate-limit state. For real abuse protection at scale, move this to a
shared store (e.g. Redis with a sliding window) or use your platform's
built-in rate limiting / WAF instead.
