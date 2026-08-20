// Minimal in-memory sliding-window limiter. Good enough to stop accidental
// hammering of the AI endpoint from a single client in a small deployment;
// it is per-instance, so it resets on redeploy and doesn't coordinate across
// serverless instances. See README "Known limitations".
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > MAX_REQUESTS_PER_WINDOW;
}
