type Props = {
  message: string;
};

// Visually hidden live region so screen reader users hear loading/error/success
// transitions without the whole page needing to be an aria-live region.
export function StatusRegion({ message }: Props) {
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {message}
    </div>
  );
}
