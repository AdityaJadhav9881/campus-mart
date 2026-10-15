import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import QrCode from "./QrCode.jsx";

const CONSUMER_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "zoho.com",
  "yandex.com",
  "rediffmail.com",
];

const EMPTY = { name: "", college: "", email: "" };

const TABS = [
  { id: "apk", label: "Android APK", icon: Smartphone },
  { id: "waitlist", label: "iOS Waitlist", icon: ShieldCheck },
];

const APK_URL = import.meta.env.VITE_APK_DOWNLOAD_URL || "/campusmart-ai.apk";

const INSTALL_STEPS = [
  {
    n: "01",
    title: "Download the APK",
    body: "Tap the download button or scan the QR code with your phone camera.",
  },
  {
    n: "02",
    title: "Allow browser install permission",
    body: "When Android prompts you, allow your browser to install apps from unknown sources for this one-time install.",
  },
  {
    n: "03",
    title: "Sign in with your campus email",
    body: "Open the app and verify your institutional email to activate your verified student account.",
  },
];

const APP_METADATA = [
  "Flutter 3.x",
  "Android 5.0+ (API 21+)",
  "Verified by Infinity Crew",
];

function classifyEmail(rawEmail) {
  const email = rawEmail.trim().toLowerCase();
  const match = email.match(/^[^\s@]+@([^\s@]+\.[^\s@]+)$/);
  if (!match) return { state: "empty", domain: "" };
  const domain = match[1];
  return {
    state: CONSUMER_DOMAINS.includes(domain) ? "consumer" : "institutional",
    domain,
  };
}

export default function WaitlistModal({ open, onClose }) {
  const titleId = useId();
  const panelRef = useRef(null);
  const triggerRef = useRef(null);
  const nameRef = useRef(null);
  const downloadRef = useRef(null);

  const [activeTab, setActiveTab] = useState("apk");
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [queueNumber] = useState(() => 42 + Math.floor(Math.random() * 18));
  const [campus, setCampus] = useState("");
  const [copied, setCopied] = useState(false);

  const emailInfo = classifyEmail(values.email);

  const absoluteApkUrl = useMemo(() => {
    if (typeof window === "undefined") return APK_URL;
    if (APK_URL.startsWith("/")) return window.location.origin + APK_URL;
    return APK_URL;
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      if (activeTab === "waitlist" && !submitted && nameRef.current) {
        nameRef.current.focus();
      } else if (activeTab === "apk" && downloadRef.current) {
        downloadRef.current.focus();
      } else {
        panelRef.current?.focus();
      }
    }, 30);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open, activeTab, submitted, onClose]);

  useEffect(() => {
    if (open) {
      setActiveTab("apk");
      setValues(EMPTY);
      setErrors({});
      setSubmitted(false);
      setCopied(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }
  }, [open]);

  useEffect(() => {
    if (open) return;
    const node = triggerRef.current;
    triggerRef.current = null;
    if (node && typeof node.focus === "function") node.focus();
  }, [open]);

  if (!open) return null;

  const update = (field) => (event) => {
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!values.college.trim()) next.college = "Enter your campus or college.";
    const email = values.email.trim();
    if (!email) {
      next.email = "Enter your college email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    setCampus(values.college.trim());
    setSubmitted(true);
  };

  const inviteLink = "https://campusmart.ai/invite/campus";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const emailHint =
    emailInfo.state === "consumer"
      ? "Consumer email detected — a campus/institutional email gets priority verification."
      : emailInfo.state === "institutional"
        ? "Campus email detected — priority verification."
        : "Use your campus/institutional email for priority verification.";

  const onTabKeyDown = (event) => {
    const index = TABS.findIndex((t) => t.id === activeTab);
    if (event.key === "ArrowRight") {
      setActiveTab(TABS[(index + 1) % TABS.length].id);
    } else if (event.key === "ArrowLeft") {
      setActiveTab(TABS[(index - 1 + TABS.length) % TABS.length].id);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close download dialog"
        tabIndex={-1}
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto border border-hairline-strong bg-abyss shadow-[0_0_0_1px_rgba(4,6,10,0.6),0_24px_60px_rgba(0,0,0,0.5)] focus:outline-none"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        />

        <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5 sm:px-8">
          <div>
            <p className="label-caps text-accent">Direct APK & Early Access</p>
            <h2
              id={titleId}
              className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl"
            >
              Get CampusMart AI
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-hairline-strong text-faint transition-colors duration-200 hover:border-accent/40 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-hairline px-6 sm:px-8">
          <div
            role="tablist"
            aria-label="Get the app"
            className="-mb-px flex gap-6"
          >
            {TABS.map((item) => {
              const Icon = item.icon;
              const active = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  role="tab"
                  type="button"
                  id={`${titleId}-tab-${item.id}`}
                  aria-selected={active}
                  aria-controls={`${titleId}-panel-${item.id}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => setActiveTab(item.id)}
                  onKeyDown={onTabKeyDown}
                  className={`inline-flex h-12 items-center gap-2 border-b-2 text-sm font-medium transition-colors duration-200 ${
                    active
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === "apk" ? (
          <div
            role="tabpanel"
            id={`${titleId}-panel-apk`}
            aria-labelledby={`${titleId}-tab-apk`}
            className="px-6 py-6 sm:px-8"
          >
            <a
              ref={downloadRef}
              href={APK_URL}
              download
              className="inline-flex h-14 w-full items-center justify-center gap-3 bg-accent text-sm font-semibold text-void transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              <Download className="h-5 w-5" aria-hidden="true" />
              Download Android APK (v1.0.0 Release)
            </a>

            <div className="mt-7 grid gap-7 sm:grid-cols-[auto_1fr] sm:items-start sm:gap-8">
              <div className="flex flex-col items-center gap-3 border border-hairline-strong bg-surface p-4">
                <QrCode value={absoluteApkUrl} size={148} />
                <p className="label-caps text-faint">Scan to install</p>
                <p
                  className="max-w-[148px] truncate text-center text-[0.625rem] text-faint"
                  title={absoluteApkUrl}
                >
                  {absoluteApkUrl}
                </p>
              </div>

              <div>
                <p className="label-caps text-faint">Install in 3 steps</p>
                <ol className="mt-3 border-t border-hairline">
                  {INSTALL_STEPS.map((step) => (
                    <li
                      key={step.n}
                      className="flex gap-4 border-b border-hairline py-3.5"
                    >
                      <span className="label-caps mt-0.5 shrink-0 text-accent">
                        {step.n}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink">
                          {step.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          {step.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {APP_METADATA.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 border border-hairline-strong bg-surface px-2.5 py-1.5 text-[0.6875rem] font-medium text-muted"
                >
                  {badge === "Verified by Infinity Crew" && (
                    <ShieldCheck
                      className="h-3 w-3 text-accent"
                      aria-hidden="true"
                    />
                  )}
                  {badge}
                </span>
              ))}
            </div>

            <p className="mt-5 text-[0.6875rem] leading-relaxed text-faint">
              Signed release build served directly from campusmart.ai. On iOS?
              Switch to the waitlist tab for campus rollout updates.
            </p>
          </div>
        ) : submitted ? (
          <div
            role="tabpanel"
            id={`${titleId}-panel-waitlist`}
            aria-labelledby={`${titleId}-tab-waitlist`}
            className="px-6 py-8 sm:px-8"
          >
            <div className="border border-hairline-strong bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center border border-accent/40 bg-accent/[0.07] text-accent">
                  <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
                </span>
                <p className="text-sm font-medium text-ink">
                  Spot reserved for{" "}
                  <span className="text-accent">{campus}</span>
                </p>
              </div>

              <p className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                You're #{queueNumber} on your campus waitlist
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                We'll email <span className="text-ink">{values.email}</span>{" "}
                when early access opens for your campus. No spam — just your
                invite.
              </p>

              <button
                type="button"
                onClick={handleCopy}
                className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 border border-hairline-strong bg-abyss text-sm font-medium text-ink transition-all duration-200 hover:border-accent/50 hover:text-accent active:scale-[0.99]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-accent" aria-hidden="true" />
                    Invite link copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    Copy Invite Link
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[0.6875rem] text-faint">
                Share it with a classmate — campus priority applies to both.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-11 w-full text-sm font-medium text-muted transition-colors duration-200 hover:text-ink"
            >
              Back to site
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            role="tabpanel"
            id={`${titleId}-panel-waitlist`}
            aria-labelledby={`${titleId}-tab-waitlist`}
            className="px-6 py-6 sm:px-8"
          >
            <p className="text-sm leading-relaxed text-muted">
              iOS and expanded campus access are rolling out gradually. Join the
              waitlist — verified students first.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor={`${titleId}-name`}
                  className="label-caps text-faint"
                >
                  Student Name
                </label>
                <input
                  id={`${titleId}-name`}
                  ref={nameRef}
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={update("name")}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? `${titleId}-name-error` : undefined
                  }
                  className={`mt-2 h-12 w-full border bg-surface px-4 text-sm text-ink placeholder:text-faint focus:outline-none ${
                    errors.name
                      ? "border-red-400/70"
                      : "border-hairline-strong focus:border-accent/60"
                  }`}
                  placeholder="Aditya Jadhav"
                />
                {errors.name && (
                  <p
                    id={`${titleId}-name-error`}
                    className="mt-2 text-xs text-red-300"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${titleId}-college`}
                  className="label-caps text-faint"
                >
                  Campus / College
                </label>
                <input
                  id={`${titleId}-college`}
                  type="text"
                  autoComplete="organization"
                  value={values.college}
                  onChange={update("college")}
                  aria-invalid={Boolean(errors.college)}
                  aria-describedby={
                    errors.college ? `${titleId}-college-error` : undefined
                  }
                  className={`mt-2 h-12 w-full border bg-surface px-4 text-sm text-ink placeholder:text-faint focus:outline-none ${
                    errors.college
                      ? "border-red-400/70"
                      : "border-hairline-strong focus:border-accent/60"
                  }`}
                  placeholder="College of Engineering, Pune"
                />
                {errors.college && (
                  <p
                    id={`${titleId}-college-error`}
                    className="mt-2 text-xs text-red-300"
                  >
                    {errors.college}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor={`${titleId}-email`}
                  className="label-caps text-faint"
                >
                  College Email
                </label>
                <input
                  id={`${titleId}-email`}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  value={values.email}
                  onChange={update("email")}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={`${titleId}-email-hint${
                    errors.email ? ` ${titleId}-email-error` : ""
                  }`}
                  className={`mt-2 h-12 w-full border bg-surface px-4 text-sm text-ink placeholder:text-faint focus:outline-none ${
                    errors.email
                      ? "border-red-400/70"
                      : emailInfo.state === "consumer"
                        ? "border-amber-300/50 focus:border-amber-300/70"
                        : emailInfo.state === "institutional"
                          ? "border-accent/50 focus:border-accent/70"
                          : "border-hairline-strong focus:border-accent/60"
                  }`}
                  placeholder="you@college.edu"
                />
                <p
                  id={`${titleId}-email-hint`}
                  className={`mt-2 flex items-start gap-1.5 text-xs leading-relaxed ${
                    emailInfo.state === "consumer"
                      ? "text-amber-200/90"
                      : emailInfo.state === "institutional"
                        ? "text-accent/90"
                        : "text-faint"
                  }`}
                  role="status"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      emailInfo.state === "consumer"
                        ? "bg-amber-300"
                        : emailInfo.state === "institutional"
                          ? "bg-accent"
                          : "bg-faint"
                    }`}
                  />
                  {emailHint}
                </p>
                {errors.email && (
                  <p
                    id={`${titleId}-email-error`}
                    className="mt-2 text-xs text-red-300"
                  >
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2.5 bg-accent text-sm font-semibold text-void transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Request Early Access
            </button>

            <p className="mt-4 text-center text-[0.6875rem] leading-relaxed text-faint">
              Simulated waitlist for this preview. Submissions are not stored or
              sent anywhere.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
