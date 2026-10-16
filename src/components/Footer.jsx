import { Mail } from "lucide-react";
import { Link } from "../router/router.jsx";

const SUPPORT_EMAIL = "martaicampus@gmail.com";

export default function Footer() {
  return (
    <footer className="shrink-0 border-t border-line bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-5 py-3.5 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          <span className="text-muted">© 2026 CampusMart AI</span> · Verified
          Student Marketplace
        </p>
        <p className="flex items-center gap-1.5">
          Need help? Contact Support:
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-1 font-medium text-accent transition-colors hover:text-accent-deep"
          >
            <Mail className="h-3 w-3" aria-hidden="true" />
            {SUPPORT_EMAIL}
          </a>
          <span className="text-line-strong">·</span>
          <Link to="/how-it-works" className="hover:text-ink">
            How verification works
          </Link>
        </p>
      </div>
    </footer>
  );
}
