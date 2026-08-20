"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        An unexpected error occurred. Try again, and if it keeps happening, refresh the page.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
      >
        Try again
      </button>
    </div>
  );
}
