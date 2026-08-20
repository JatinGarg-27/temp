type Props = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 text-sm text-red-800 dark:text-red-200"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start rounded-full border border-red-400 dark:border-red-800 px-3 py-1.5 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/40"
        >
          Try again
        </button>
      )}
    </div>
  );
}
