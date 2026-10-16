import { RefreshCw } from "lucide-react";

export default function ApiStatusBadge({
  online,
  loading,
  onRefresh,
  demo = false,
  className = "",
}) {
  const label = loading
    ? "Checking the backend…"
    : demo
      ? "Sample listings"
      : online
        ? "Connected to the live database"
        : "Backend unreachable";

  const tone = loading
    ? "text-faint"
    : online && !demo
      ? "text-positive"
      : "text-faint";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        role="status"
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${tone} ${
          online && !demo
            ? "border-positive/25 bg-positive-soft"
            : "border-line bg-card text-muted"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            loading
              ? "bg-faint"
              : online && !demo
                ? "live-dot bg-positive"
                : "bg-faint/60"
          }`}
        />
        {label}
      </span>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh listings"
          title="Refresh listings"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-card text-faint transition-colors duration-200 hover:border-line-strong hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
