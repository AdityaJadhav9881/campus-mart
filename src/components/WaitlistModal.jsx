import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Download, ShieldCheck, X } from "lucide-react";

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

  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [queueNumber] = useState(() => 42 + Math.floor(Math.random() * 18));
  const [campus, setCampus] = useState("");
  const [copied, setCopied] = useState(false);

  const emailInfo = classifyEmail(values.email);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Initial focus + restore focus to trigger on close
  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => {
      if (!submitted && nameRef.current) {
        nameRef.current.focus();
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
  }, [open, submitted, onClose]);

  // Reset transient state whenever the modal reopens
  useEffect(() => {
    if (open) {
      setValues(EMPTY);
      setErrors({});
      setSubmitted(false);
      setCopied(false);
    }
  }, [open]);

  // Track the invoking element so focus can return to it
  useEffect(() => {
    if (!open) return;
    if (document.activeElement instanceof HTMLElement) {
      triggerRef.current = document.activeElement;
    }
  }, [open]);

  // Restore focus to the trigger on close
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

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close waitlist"
        tabIndex={-1}
        className="absolute inset-0 bg-void/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-lg border border-hairline-strong bg-abyss shadow-[0_0_0_1px_rgba(4,6,10,0.6),0_24px_60px_rgba(0,0,0,0.5)] focus:outline-none"
      >
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        />

        <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5 sm:px-8">
          <div>
            <p className="label-caps text-accent">Student Early Access</p>
            <h2
              id={titleId}
              className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl"
            >
              {submitted ? "You're on the list" : "Join the campus waitlist"}
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

        {submitted ? (
          <div className="px-6 py-8 sm:px-8">
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
          <form onSubmit={handleSubmit} noValidate className="px-6 py-6 sm:px-8">
            <p className="text-sm leading-relaxed text-muted">
              The app is rolling out campus by campus. Join the waitlist for
              early access — verified students first.
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
              <Download className="h-4 w-4" aria-hidden="true" />
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
