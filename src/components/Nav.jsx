import { useEffect, useRef, useState } from "react";
import { LogIn, LogOut, Menu, X } from "lucide-react";
import { Link, NavLink, useLocation } from "../router/router.jsx";
import { useAuth } from "../hooks/useAuth.js";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/how-it-works", label: "How it works" },
  { to: "/sandbox", label: "Price Estimator" },
  { to: "/download", label: "Download" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const closeRef = useRef(null);
  const { signedIn, user, signOut } = useAuth();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const firstName = user?.name ? user.name.split(" ")[0] : "Student";

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-line bg-paper/90 backdrop-blur w-full max-w-full min-w-0 overflow-hidden">
      <div className="mx-auto flex h-16 max-w-6xl w-full min-w-0 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-2.5"
          aria-label="CampusMart AI — home"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#141413] shadow-sm transition"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4.5 w-4.5 text-[#FAF9F6]"
            >
              <path
                d="M16 8.5a5.5 5.5 0 1 0 0 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
              />
              <circle cx="17.5" cy="7.5" r="1.5" fill="#2563eb" />
            </svg>
          </span>
          <span className="font-display text-lg leading-none tracking-tight text-ink">
            CampusMart
            <span className="ml-1 text-accent">AI</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm transition-colors duration-150 ${
                  isActive
                    ? "bg-sunken font-medium text-ink"
                    : "text-muted hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {signedIn ? (
          <div className="ml-auto hidden items-center gap-2 md:flex md:ml-4">
            <span
              title={`Signed in as ${user.name} (${user.email})`}
              className="flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-medium text-ink-soft"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-positive live-dot"
              />
              <span className="max-w-36 truncate">
                {firstName}
                <span className="hidden text-muted lg:inline"> · signed in</span>
              </span>
            </span>
            <button
              type="button"
              onClick={signOut}
              className="btn btn-ghost h-9 text-[13px]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/download"
            className="btn btn-secondary ml-auto hidden h-9 px-4 text-[13px] sm:inline-flex md:ml-3"
          >
            <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
            Sign in
          </Link>
        )}

        <Link
          to="/download"
          className={`btn btn-primary hidden h-9 px-4 text-[13px] sm:inline-flex ${
            signedIn ? "ml-0" : "ml-0 md:ml-3"
          }`}
        >
          Get the app
        </Link>

        <button
          ref={closeRef}
          type="button"
          className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors duration-150 hover:bg-sunken md:hidden sm:ml-0"
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
        className="absolute inset-x-0 top-full border-b border-line bg-paper shadow-[0_18px_30px_-24px_rgba(28,25,23,0.5)] md:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-6xl px-5 py-3 sm:px-8">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block border-b border-line py-3.5 text-[15px] transition-colors duration-150 ${
                  isActive ? "font-medium text-ink" : "text-muted hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {signedIn ? (
            <div className="flex items-center justify-between gap-3 border-t border-line py-3.5">
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">
                  Signed in as {user.name}
                </span>
                <span className="mt-0.5 block truncate text-xs text-faint">
                  {user.email}
                </span>
              </span>
              <button
                type="button"
                onClick={signOut}
                className="btn btn-ghost shrink-0 text-[13px]"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                Sign out
              </button>
            </div>
          ) : (
            <Link
              to="/download"
              className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-line bg-card py-3 text-sm font-medium text-ink"
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              Sign in with your campus email
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
