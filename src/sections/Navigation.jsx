import { useEffect, useRef, useState } from "react";
import { Menu, X, Download } from "lucide-react";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#estimator", label: "Estimate" },
  { href: "#demo", label: "Try Demo" },
  { href: "#architecture", label: "Architecture" },
  { href: "#preview", label: "App" },
  { href: "#faq", label: "FAQ" },
  { href: "#download", label: "Download", action: "waitlist" },
];

/* Compact set shown between lg and xl, where the full bar would crowd. */
const COMPACT_LINKS = ["#demo", "#architecture", "#faq"];
const FULL_LINKS = ["#features", "#estimator", "#demo", "#architecture", "#preview", "#faq"];

export default function Navigation({ onDownload }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  const openWaitlist = () => {
    setOpen(false);
    onDownload?.();
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-hairline bg-void/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a
          href="#top"
          className="label-caps text-ink transition-colors duration-200 hover:text-accent"
          onClick={() => setOpen(false)}
        >
          Campusmart
          <span className="ml-1 align-super text-[0.55rem] font-semibold text-accent">
            AI
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex xl:hidden">
          {NAV_LINKS.filter((link) => COMPACT_LINKS.includes(link.href)).map(
            (link) => (
              <a
                key={link.href}
                href={link.href}
                className="label-caps text-muted transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex">
          {NAV_LINKS.filter((link) => FULL_LINKS.includes(link.href)).map(
            (link) => (
              <a
                key={link.href}
                href={link.href}
                className="label-caps text-muted transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </a>
            )
          )}
        </nav>

        <button
          type="button"
          onClick={openWaitlist}
          className="inline-flex h-9 items-center gap-2 border border-hairline-strong bg-surface px-4 text-[0.8125rem] font-medium text-ink transition-colors duration-200 hover:border-accent/50 hover:text-accent lg:ml-6"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Download App
        </button>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors duration-200 hover:text-accent lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-hairline bg-void/97 lg:hidden"
      >
        <nav
          aria-label="Mobile"
          className="mx-auto flex max-w-6xl flex-col px-6 pb-8 pt-4"
        >
          {NAV_LINKS.map((link) =>
            link.action === "waitlist" ? (
              <button
                key={link.href}
                type="button"
                onClick={openWaitlist}
                className="border-b border-hairline py-4 text-left text-lg font-medium text-ink transition-colors duration-200 hover:text-accent"
              >
                {link.label}
              </button>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="border-b border-hairline py-4 text-lg font-medium text-ink transition-colors duration-200 hover:text-accent"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          <button
            ref={closeRef}
            type="button"
            onClick={openWaitlist}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 bg-accent px-6 text-sm font-semibold text-void transition-transform duration-150 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download App
          </button>
        </nav>
      </div>
    </header>
  );
}
