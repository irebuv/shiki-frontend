type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex w-full h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>

      {description && (
        <p className="text-sm opacity-70">{description}</p>
      )}

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 rounded-md border px-4 py-2 hover:bg-muted"
        >
          Retry
        </button>
      )}
    </div>
  );
}
