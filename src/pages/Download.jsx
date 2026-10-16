import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Download as DownloadIcon,
  Info,
  Lock,
  LogOut,
  QrCode as QrCodeIcon,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Link } from "../router/router.jsx";
import AuthCard from "../components/AuthCard.jsx";
import QrCode from "../components/QrCode.jsx";
import { useAuth } from "../hooks/useAuth.js";
import { appSpecs, installSteps } from "../data/site.js";

const APK_URL = import.meta.env.VITE_APK_DOWNLOAD_URL || "/campusmart-ai.apk";
const SUPPORT_EMAIL = "martaicampus@gmail.com";

const CHROME_TIP =
  "Tip: Open this page in Google Chrome (not an in-app browser like WhatsApp) and uninstall any older version of CampusMart from your phone before installing.";

function SupportNote() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-card px-4 py-3.5">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <p className="text-[13px] leading-relaxed text-muted">
        <span className="font-medium text-ink">Need Help or Campus Support?</span>{" "}
        Our team is one email away — write to{" "}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-medium text-accent transition-colors hover:text-accent-deep"
        >
          {SUPPORT_EMAIL}
        </a>{" "}
        and we'll help with installs, sign-in or listing questions.
      </p>
    </div>
  );
}

function useApkSize(url) {
  const [size, setSize] = useState(null);

  useEffect(() => {
    if (!url) return undefined;
    let cancelled = false;

    const read = async () => {
      try {
        const response = await fetch(url, { method: "HEAD" });
        if (!response.ok) return;
        const length = Number(response.headers.get("content-length"));
        if (Number.isFinite(length) && length > 0 && !cancelled) {
          setSize(length);
        }
      } catch {
        /* size is a nice-to-have */
      }
    };

    read();
    return () => {
      cancelled = true;
    };
  }, [url]);

  return useMemo(() => {
    if (!size) return null;
    const mb = size / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(size / 1024)} KB`;
  }, [size]);
}

function SignedInBar({ user, onSignOut }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-positive/25 bg-positive-soft px-4 py-3">
      <p className="min-w-0 text-[13px] leading-relaxed text-ink">
        <span className="font-medium">Signed in as {user.name}</span>{" "}
        <span className="text-muted">({user.email})</span>
      </p>
      <button
        type="button"
        onClick={onSignOut}
        className="btn btn-ghost shrink-0 text-[13px]"
      >
        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

export default function Download() {
  const { signedIn, user, signOut } = useAuth();
  const absoluteApkUrl = useMemo(() => {
    if (typeof window === "undefined") return APK_URL;
    if (APK_URL.startsWith("/")) return window.location.origin + APK_URL;
    return APK_URL;
  }, []);

  const apkSize = useApkSize(signedIn ? APK_URL : null);

  return (
    <div className="page-in h-full overflow-y-auto scroll-slim">
      <div className="mx-auto grid min-h-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-14 lg:py-12">
        {/* Download */}
        <section>
          <p className="eyebrow">Android app</p>

          <h1 className="mt-4 text-[2.25rem] leading-[1.06] sm:text-4xl">
            Get CampusMart AI on your phone.
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
            The app is where you shoot the four photos, get the ₹ price and
            message verified students. Download the signed APK directly — no
            Play Store, no waitlist.
          </p>

          {signedIn ? (
            <>
              <div className="mt-6 space-y-4">
                <SignedInBar user={user} onSignOut={signOut} />

                <div className="flex flex-wrap gap-3">
                  <a href={APK_URL} download className="btn btn-primary h-12 px-6">
                    <DownloadIcon className="h-4.5 w-4.5" aria-hidden="true" />
                    Download Android APK
                  </a>
                  <Link to="/marketplace" className="btn btn-secondary">
                    Browse listings first
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <p className="text-[13px] text-faint">
                  {apkSize
                    ? `Signed release · ${apkSize} · installs over your existing copy.`
                    : "Signed release build served straight from campusmart.ai."}
                </p>

                <div className="flex items-start gap-2.5 rounded-xl border border-line bg-sunken px-4 py-3">
                  <Info
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <p className="text-[13px] leading-relaxed text-ink-soft">
                    {CHROME_TIP}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-2 sm:grid-cols-2">
                {appSpecs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3"
                  >
                    <span className="text-[13px] text-muted">{spec.label}</span>
                    <span className="text-right text-[13px] font-medium text-ink">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-sunken px-4 py-3.5">
                <ShieldCheck
                  className="mt-0.5 h-4 w-4 shrink-0 text-positive"
                  aria-hidden="true"
                />
                <p className="text-[13px] leading-relaxed text-muted">
                  Every account verifies with an institutional email before it can
                  list or chat. iOS is in development — the campus rollout starts
                  with Android.
                </p>
              </div>
            </>
          ) : (
            <div className="mt-7 space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-line bg-sunken px-4 py-3.5">
                <Lock
                  className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    Sign in to unlock the APK & QR code
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    The download button and QR code are reserved for verified
                    students — sign in or create an account with your campus
                    email (takes under a minute).
                  </p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {appSpecs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3"
                  >
                    <span className="text-[13px] text-muted">{spec.label}</span>
                    <span className="text-right text-[13px] font-medium text-ink">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SupportNote />
        </section>

        {/* Auth card (locked) or QR + install steps (unlocked) */}
        <section>
          {!signedIn ? (
            <AuthCard />
          ) : (
            <div className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-lg leading-none">Install in three steps</h2>
                <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                  <QrCodeIcon className="h-3.5 w-3.5" aria-hidden="true" />
                  Scan with your camera
                </span>
              </div>

              <div className="mt-4 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-line bg-sunken p-4">
                  <QrCode value={absoluteApkUrl} size={150} />
                  <p className="max-w-[150px] break-all text-center text-[10px] leading-tight text-faint">
                    {absoluteApkUrl}
                  </p>
                </div>

                <ol className="border-t border-line">
                  {installSteps.map((step) => (
                    <li key={step.n} className="flex gap-3.5 border-b border-line py-3.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-paper">
                        {step.n}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">{step.title}</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-muted">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <ul className="mt-4 space-y-2">
                {[
                  "Opens with your campus email already verified",
                  "Four-photo listing flow works offline, syncs later",
                  "Chat stays inside verified student accounts",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-[13px] leading-relaxed text-muted"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center gap-3 rounded-xl border border-line bg-sunken px-4 py-3">
                <Smartphone className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
                <p className="text-[13px] leading-relaxed text-muted">
                  On iOS? Browse the{" "}
                  <Link to="/marketplace" className="font-medium text-accent hover:underline">
                    web marketplace
                  </Link>{" "}
                  until the iPhone build ships.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
