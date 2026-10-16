import { Mail } from "lucide-react";
import { Link } from "../router/router.jsx";

const SUPPORT_EMAIL = "martaicampus@gmail.com";

export default function Footer() {
  return (
    <footer className="mt-auto shrink-0 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-2.5 px-5 py-4 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-3.5">
        <p className="text-center sm:text-left">
          <span className="text-muted">© 2026 CampusMart AI</span> · Verified
          Student Marketplace
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-end text-center sm:text-right">
          <span>Need help? Contact Support:</span>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-1 font-medium text-accent transition-colors hover:text-accent-deep"
          >
            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
            {SUPPORT_EMAIL}
          </a>
          <span className="text-line-strong">·</span>
          <Link to="/how-it-works" className="hover:text-ink">
            How verification works
          </Link>
        </div>
      </div>
    </footer>
  );
}
