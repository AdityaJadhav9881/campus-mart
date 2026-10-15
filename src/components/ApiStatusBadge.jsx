import { RefreshCw } from "lucide-react";

export default function ApiStatusBadge({
  online,
  loading,
  onRefresh,
  className = "",
}) {
  const label = loading
    ? "Checking live feed…"
    : online
      ? "Connected to Live FastAPI Server"
      : "Offline Demo Mode";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span
        role="status"
        className={`inline-flex items-center gap-2 border px-2.5 py-1.5 transition-colors duration-300 ${
          online
            ? "border-accent/30 bg-accent/[0.06]"
            : "border-hairline-strong bg-surface"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            loading
              ? "agent-dot bg-faint"
              : online
                ? "agent-dot bg-accent"
                : "bg-faint/50"
          }`}
        />
        <span
          className={`whitespace-nowrap text-[0.6875rem] font-medium ${
            online && !loading ? "text-accent" : "text-faint"
          }`}
        >
          {label}
        </span>
      </span>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh live feed"
          title="Refresh live feed"
          className="flex h-8 w-8 shrink-0 items-center justify-center border border-hairline-strong bg-surface text-faint transition-colors duration-200 hover:border-accent/40 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
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
