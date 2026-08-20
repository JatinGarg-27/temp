import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        The page you&rsquo;re looking for doesn&rsquo;t exist.
      </p>
      <Link href="/" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">
        Back to home
      </Link>
    </div>
  );
}
