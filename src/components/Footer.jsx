import { Mail } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from "../data/site.js";

export default function Footer() {
  return (
    <footer className="mt-auto shrink-0 border-t border-line bg-paper w-full max-w-full min-w-0 overflow-hidden">
      <div className="mx-auto flex max-w-6xl w-full min-w-0 flex-col gap-2.5 px-4 sm:px-6 lg:px-8 py-4 text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:py-3.5">
        <p className="text-center sm:text-left">
          <span className="text-muted">© 2026 CampusMart AI</span> · Verified
          Student Marketplace
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:justify-end text-center sm:text-right">
          <span>Need help? Contact Support:</span>
          <a
            href={SUPPORT_MAILTO}
            className="inline-flex items-center gap-1 font-medium text-accent transition-colors hover:text-accent-deep hover:underline"
          >
            <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
