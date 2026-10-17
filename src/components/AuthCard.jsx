import { useEffect, useState } from "react";
import {
  ArrowLeft,
  GraduationCap,
  KeyRound,
  Loader2,
  LogIn,
  MailCheck,
  Search,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { ApiError, searchColleges } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.js";
import { useWarmup } from "../hooks/useWarmup.js";
import WarmupBanner from "./WarmupBanner.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function friendlyError(error) {
  if (!error) return "";
  if (error instanceof ApiError) return error.message;
  return error.message || "Something went wrong. Please try again.";
}

function CollegePicker({ value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const list = await searchColleges(query);
        if (active) setResults(list);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 120);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (value) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-medium text-ink">
            College / Institute
          </label>
          <span className="text-[11px] font-medium text-accent">CET Cell Directory</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent-soft/40 p-3 shadow-xs">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-card text-accent">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">{value}</p>
              <p className="text-[11px] text-muted">Verified campus community</p>
            </div>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange("");
              setQuery("");
              setOpen(true);
            }}
            className="shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold text-accent transition hover:bg-card hover:underline"
          >
            Change
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <label htmlFor="auth-college-search" className="text-[13px] font-medium text-ink">
          College / Institute
        </label>
        <span className="text-[11px] text-faint">CET Cell Directory</span>
      </div>

      <div className="relative mt-2">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
          aria-hidden="true"
        />
        <input
          id="auth-college-search"
          type="text"
          value={query}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          placeholder="Search COEP, VJTI, PICT, or CET code…"
          className="input pl-10 pr-9"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-faint hover:bg-sunken hover:text-ink"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-line bg-card p-1.5 shadow-lg scroll-slim">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching CET Cell directory…
              </div>
            )}

            {!loading && results.length === 0 && (
              <div className="p-3 text-center">
                <p className="text-xs text-muted">No CET college found matching "{query}"</p>
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(query.trim());
                      setOpen(false);
                    }}
                    className="mt-2 text-xs font-semibold text-accent hover:underline"
                  >
                    Use "{query.trim()}" as my campus →
                  </button>
                )}
              </div>
            )}

            {!loading &&
              results.map((c) => (
                <button
                  key={c.code ? `${c.code}-${c.name}` : c.name}
                  type="button"
                  onClick={() => {
                    onChange(c.shortName || c.name);
                    setOpen(false);
                  }}
                  className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition hover:bg-sunken"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-ink">
                      {c.shortName || c.name}
                    </span>
                    {c.code && (
                      <span className="shrink-0 rounded bg-sunken px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted">
                        CET {c.code}
                      </span>
                    )}
                  </div>
                  <span className="line-clamp-1 text-[11px] text-faint">
                    {c.name} {c.city ? `· ${c.city}` : ""}
                  </span>
                </button>
              ))}

            {!loading &&
              query.trim() &&
              !results.some(
                (r) =>
                  (r.shortName || r.name).toLowerCase() ===
                  query.trim().toLowerCase()
              ) && (
                <div className="mt-1 border-t border-line/60 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(query.trim());
                      setOpen(false);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-xs text-muted hover:bg-sunken hover:text-ink"
                  >
                    Not listed? Use <span className="font-semibold text-ink">"{query.trim()}"</span>
                  </button>
                </div>
              )}
          </div>
        </>
      )}
    </div>
  );
}

export default function AuthCard() {
  const { signIn, sendOtp, resendOtp, verifyOtp } = useAuth();

  const [tab, setTab] = useState("signin");
  const [mode, setMode] = useState("form"); /* form | otp */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [otp, setOtp] = useState("");
  const [fallbackOtp, setFallbackOtp] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const warmup = useWarmup(submitting);

  const resetTo = (nextTab) => {
    setTab(nextTab);
    setMode("form");
    setError("");
    setNotice("");
    setOtp("");
    setFallbackOtp("");
  };

  const run = async (action) => {
    setSubmitting(true);
    setError("");
    try {
      await action();
      return true;
    } catch (caught) {
      setError(friendlyError(caught));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!EMAIL_RE.test(email.trim()) || password.length < 4) {
      setError("Enter a valid campus email and your password.");
      return;
    }
    await run(() => signIn({ email: email.trim(), password }));
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!name.trim() || !EMAIL_RE.test(email.trim()) || password.length < 8) {
      setError("Add your name, a valid campus email, and an 8+ character password.");
      return;
    }
    await run(async () => {
      const res = await sendOtp({
        name: name.trim(),
        email: email.trim(),
        password,
        college_name: collegeName.trim() || undefined,
      });
      if (res?.fallback_otp_code) {
        setFallbackOtp(String(res.fallback_otp_code));
      }
      setMode("otp");
      setNotice(`We emailed a 6-digit verification code to ${email.trim()}.`);
    });
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setNotice("");
    try {
      const res = await resendOtp({ email: email.trim() });
      if (res?.fallback_otp_code) {
        setFallbackOtp(String(res.fallback_otp_code));
      }
      setNotice(`New verification code sent to ${email.trim()}.`);
    } catch (caught) {
      setError(friendlyError(caught));
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp.trim())) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    await run(() =>
      verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
        college_name: collegeName.trim() || undefined,
      })
    );
  };

  const inputDisabled = submitting;

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg leading-none">Student sign in</h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-faint">
          <ShieldCheck className="h-3.5 w-3.5 text-positive" aria-hidden="true" />
          Campus email only
        </span>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-muted">
        Sign in to unlock the Android APK and QR download. One account works on
        the web and in the app.
      </p>

      <div
        role="tablist"
        aria-label="Sign in or sign up"
        className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-line bg-sunken p-1"
      >
        {[
          { id: "signin", label: "Sign in", icon: LogIn },
          { id: "signup", label: "Sign up", icon: UserPlus },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => resetTo(item.id)}
              className={`flex h-9 items-center justify-center gap-2 rounded-lg text-[13px] font-medium transition-colors duration-150 ${
                active
                  ? "bg-card text-ink shadow-[0_1px_2px_rgba(28,25,23,0.06)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.label}
            </button>
          );
        })}
      </div>

      <WarmupBanner show={warmup.show} elapsed={warmup.elapsed} className="mt-4" />

      {notice && !error && (
        <p className="mt-4 rounded-xl border border-accent/20 bg-accent-soft px-3.5 py-2.5 text-[12.5px] leading-relaxed text-accent-deep">
          {notice}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-warn/25 bg-warn-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-warn"
        >
          {error}
        </p>
      )}

      {tab === "signin" && mode === "form" && (
        <form onSubmit={handleSignIn} className="mt-5 space-y-4">
          <div>
            <label htmlFor="auth-email" className="text-[13px] font-medium text-ink">
              Campus email
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              value={email}
              disabled={inputDisabled}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@campus.edu"
              className="input mt-2"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="text-[13px] font-medium text-ink">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              value={password}
              disabled={inputDisabled}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
              className="input mt-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Sign in & unlock download
              </>
            )}
          </button>
        </form>
      )}

      {tab === "signup" && mode === "form" && (
        <form onSubmit={handleSendOtp} className="mt-5 space-y-4">
          <div>
            <label htmlFor="auth-name" className="text-[13px] font-medium text-ink">
              Full name
            </label>
            <input
              id="auth-name"
              type="text"
              autoComplete="name"
              value={name}
              disabled={inputDisabled}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="input mt-2"
            />
          </div>

          <CollegePicker
            value={collegeName}
            onChange={setCollegeName}
            disabled={inputDisabled}
          />

          <div>
            <label htmlFor="auth-signup-email" className="text-[13px] font-medium text-ink">
              Campus email
            </label>
            <input
              id="auth-signup-email"
              type="email"
              autoComplete="email"
              value={email}
              disabled={inputDisabled}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@campus.edu"
              className="input mt-2"
            />
          </div>

          <div>
            <label htmlFor="auth-signup-password" className="text-[13px] font-medium text-ink">
              Password
            </label>
            <input
              id="auth-signup-password"
              type="password"
              autoComplete="new-password"
              value={password}
              disabled={inputDisabled}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="8+ characters"
              className="input mt-2"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Sending code…
              </>
            ) : (
              <>
                <MailCheck className="h-4 w-4" aria-hidden="true" />
                Send verification code
              </>
            )}
          </button>
        </form>
      )}

      {tab === "signup" && mode === "otp" && (
        <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4">
          {fallbackOtp && (
            <button
              type="button"
              onClick={() => {
                setOtp(fallbackOtp);
                run(() =>
                  verifyOtp({
                    email: email.trim(),
                    otp: fallbackOtp,
                    college_name: collegeName.trim() || undefined,
                  })
                );
              }}
              className="group flex w-full flex-col gap-1 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-left transition hover:border-amber-400 hover:bg-amber-100/70"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-900">
                  Instant Verification Code:{" "}
                  <span className="font-mono tracking-wider font-bold text-amber-950">
                    {fallbackOtp}
                  </span>
                </span>
                <span className="font-medium text-amber-700 underline group-hover:text-amber-950">
                  (Click to auto-fill)
                </span>
              </div>
              <span className="text-[11.5px] text-amber-800/80">
                Carrier email delivery delayed. Tap here to verify and unlock download immediately →
              </span>
            </button>
          )}

          <div>
            <label htmlFor="auth-otp" className="text-[13px] font-medium text-ink">
              6-digit code
            </label>
            <input
              id="auth-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              disabled={inputDisabled}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="123456"
              className="input mt-2 text-center text-lg tracking-[0.4em] tabular-nums"
            />
            <p className="mt-2 text-xs text-faint">
              Sent to <span className="font-medium text-ink-soft">{email}</span>
              {collegeName && (
                <span className="mt-0.5 block font-medium text-accent">
                  Campus: {collegeName}
                </span>
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Verifying…
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Verify & create account
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-muted">Didn't receive the email?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={submitting || resending}
              className="font-medium text-accent hover:underline disabled:opacity-50"
            >
              {resending ? "Sending code…" : "Resend code"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setMode("form");
              setOtp("");
              setError("");
            }}
            disabled={inputDisabled}
            className="btn btn-ghost w-full text-[13px]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back to sign up details
          </button>
        </form>
      )}

      <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-faint">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" aria-hidden="true" />
        Your session stays on this device only. We never store your password in
        the browser.
      </p>
    </div>
  );
}
