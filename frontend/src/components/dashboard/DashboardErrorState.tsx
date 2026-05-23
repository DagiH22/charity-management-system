type DashboardErrorStateProps = {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export default function DashboardErrorState({
  message,
  onRetry,
  retryLabel = "Retry",
}: DashboardErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
      <p className="font-semibold">{message}</p>
      {onRetry ? (
        <button
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={onRetry}
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
