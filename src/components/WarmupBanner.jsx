import { Cloud } from "lucide-react";

/* Render free-tier cold start can take 45-90s. This banner appears after
   ~2s of waiting and stays until the request settles. */
export default function WarmupBanner({ show, elapsed = 0, className = "" }) {
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`card overflow-hidden border-accent/25 bg-accent-soft/60 p-4 sm:p-5 ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-card text-accent">
          <Cloud className="h-4 w-4" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-snug text-ink">
            Connecting to CampusMart Marketplace — Hang tight!
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">
            Waking up our cloud AI server. First connection can take up to 60
            seconds…
          </p>

          <div
            className="warmup-track mt-3 h-1.5 w-full overflow-hidden rounded-full bg-accent/15"
            aria-hidden="true"
          >
            <div className="warmup-bar h-1.5 w-1/3 rounded-full bg-accent" />
          </div>

          <p className="mt-2 text-xs tabular-nums text-faint">
            {elapsed}s elapsed · subsequent visits load instantly
          </p>
        </div>
      </div>
    </div>
  );
}
