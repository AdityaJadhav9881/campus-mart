import { ArrowLeft, Compass } from "lucide-react";
import { Link } from "../router/router.jsx";

const SUGGESTIONS = [
  { to: "/marketplace", label: "Live marketplace" },
  { to: "/how-it-works", label: "How verification works" },
  { to: "/sandbox", label: "AI sandbox" },
  { to: "/download", label: "Download the app" },
];

export default function NotFound() {
  return (
    <div className="page-in flex h-full items-center justify-center overflow-y-auto scroll-slim px-5 py-10">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-line bg-card text-faint">
          <Compass className="h-5 w-5" aria-hidden="true" />
        </span>

        <h1 className="mt-5 text-3xl">This page isn't on campus</h1>

        <p className="mt-3 text-sm leading-relaxed text-muted">
          The link may be old, or the address was typed by hand. Here is where
          students actually go.
        </p>

        <div className="mt-6 grid gap-2 text-left">
          {SUGGESTIONS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center justify-between rounded-xl border border-line bg-card px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-line-strong"
            >
              {item.label}
              <ArrowLeft className="h-4 w-4 rotate-180 text-faint" aria-hidden="true" />
            </Link>
          ))}
        </div>

        <Link to="/" className="btn btn-secondary mt-6">
          Back to home
        </Link>
      </div>
    </div>
  );
}
