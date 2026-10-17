import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Clock,
  Flame,
  GraduationCap,
  Mail,
  Plus,
  Search,
  Smartphone,
  Sparkles,
  Tag,
  X,
  Zap,
} from "lucide-react";
import { Link } from "../router/router.jsx";
import {
  aiDraftWantedRequest,
  createWantedRequest,
  fetchWantedRequests,
} from "../api/client.js";
import { SEED_WANTED_REQUESTS } from "../data/wantedSeed.js";
import { ACADEMIC_YEARS, BRANCHES } from "../data/site.js";
import {
  buildWantedWhatsAppShareUrl,
  relativeTime,
  rupees,
} from "../lib/format.js";

const LOCAL_STORAGE_KEY = "campusmart.wanted_posts.v1";

function WhatsAppIcon({ className = "h-3.5 w-3.5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.301-.15-1.781-.878-2.057-.978-.276-.1-.476-.15-.677.15-.2.301-.777.978-.952 1.178-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.498-1.784-1.674-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.2-.301.3-.501.101-.2.051-.376-.025-.527-.075-.15-.677-1.63-.928-2.232-.245-.587-.494-.508-.677-.517-.175-.01-.376-.01-.577-.01-.2 0-.527.075-.802.376s-1.053 1.028-1.053 2.508 1.078 2.909 1.229 3.11c.15.2 2.122 3.24 5.141 4.544.718.31 1.279.495 1.716.634.721.23 1.378.197 1.897.12.578-.087 1.781-.728 2.032-1.431.251-.703.251-1.305.176-1.431-.076-.126-.276-.201-.577-.352zM12.04 2C6.51 2 2.02 6.49 2.02 12.02c0 1.99.58 3.86 1.63 5.46L2 22l4.67-1.61c1.55.98 3.37 1.55 5.37 1.55 5.53 0 10.02-4.49 10.02-10.02C22.06 6.49 17.57 2 12.04 2z" />
    </svg>
  );
}

function UrgencyPill({ urgency }) {
  const text = urgency || "Needed this week";
  const isHot = text.includes("🔥") || text.toLowerCase().includes("urgent");
  const isZap = text.includes("⚡") || text.toLowerCase().includes("week");

  let badgeStyle = "border-line bg-sunken text-muted";
  if (isHot) {
    badgeStyle = "border-warn/30 bg-warn-soft text-warn font-semibold";
  } else if (isZap) {
    badgeStyle = "border-accent/25 bg-accent-soft text-accent-deep font-medium";
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] ${badgeStyle}`}
    >
      {isHot ? (
        <Flame className="h-3 w-3 shrink-0" aria-hidden="true" />
      ) : isZap ? (
        <Zap className="h-3 w-3 shrink-0" aria-hidden="true" />
      ) : (
        <Clock className="h-3 w-3 shrink-0 text-faint" aria-hidden="true" />
      )}
      <span>{text}</span>
    </span>
  );
}

/* Helper to find if an active marketplace listing matches this wanted request */
function findMatchingListing(wanted, products = []) {
  if (!wanted || !products || products.length === 0) return null;
  const rawWords = (wanted.title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !["need", "want", "for", "with", "under", "exam", "item", "the", "and"].includes(w));

  if (rawWords.length === 0) return null;

  return (
    products.find((p) => {
      const pText = `${p.title || ""} ${p.description || ""} ${p.category || ""} ${(p.ai_tags || []).join(" ")}`.toLowerCase();
      // Must match at least 1 significant keyword (or 2 if multiple)
      const matches = rawWords.filter((word) => pText.includes(word));
      const hasWordMatch = matches.length >= (rawWords.length >= 2 ? 2 : 1);
      if (!hasWordMatch) return false;

      // Price sanity check: product price should be reasonable compared to buyer budget
      const price = Number(p.listed_price ?? p.suggested_price);
      if (wanted.budget && price > 0) {
        return price <= wanted.budget * 1.35;
      }
      return true;
    }) || null
  );
}

export default function WantedBoard({
  products = [],
  onSelectProduct,
  previewOnly = false,
}) {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge user-saved on top of seed items
          const savedIds = new Set(parsed.map((p) => p.id));
          const unaddedSeeds = SEED_WANTED_REQUESTS.filter((s) => !savedIds.has(s.id));
          return [...parsed, ...unaddedSeeds];
        }
      }
    } catch {
      /* ignore */
    }
    return SEED_WANTED_REQUESTS;
  });

  const [isPosting, setIsPosting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [handoffItem, setHandoffItem] = useState(null);

  // Sync with live backend
  useEffect(() => {
    let active = true;
    fetchWantedRequests().then((remoteItems) => {
      if (!active || !remoteItems || remoteItems.length === 0) return;
      setItems((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newOnes = remoteItems.filter((r) => !existingIds.has(r.id));
        if (newOnes.length === 0) return prev;
        const merged = [...newOnes, ...prev];
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged.slice(0, 50)));
        } catch {
          /* ignore */
        }
        return merged;
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const handlePostSuccess = (newItem) => {
    setItems((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
      } catch {
        /* ignore */
      }
      return updated;
    });
    setIsPosting(false);
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedBranch !== "All Branches" && item.branch !== selectedBranch) {
        return false;
      }
      if (!q) return true;
      const haystack = `${item.title} ${item.description || ""} ${item.college_name || ""} ${item.branch || ""} ${item.academic_year || ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, searchQuery, selectedBranch]);

  const displayList = previewOnly ? items.slice(0, 3) : filteredItems;

  return (
    <section className="w-full">
      {/* Header controls (if not preview mode) */}
      {!previewOnly && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-accent" />
              <h2 className="text-xl font-medium sm:text-2xl">
                Campus "Want to Buy" Board
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Urgent items needed by students right now. Have any lying in your hostel room? Sell and earn instant cash!
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPosting(true)}
            className="btn btn-primary h-10 shrink-0 gap-2 text-xs sm:text-sm"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            + Post What You Need
          </button>
        </div>
      )}

      {/* Filter Row (if not preview mode) */}
      {!previewOnly && (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search requested items…"
              aria-label="Search requests"
              className="input h-9 pl-9 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-faint hover:bg-sunken"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scroll-slim">
            {BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBranch(b)}
                className="pill shrink-0 text-xs py-1 px-3"
                data-active={selectedBranch === b}
                aria-pressed={selectedBranch === b}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayList.map((wanted) => {
          const matchedProduct = findMatchingListing(wanted, products);
          const postedTime = relativeTime(wanted.created_at);

          return (
            <article
              key={wanted.id}
              className="group flex flex-col justify-between rounded-2xl border border-line bg-card p-5 transition-all duration-200 hover:border-line-strong hover:shadow-[0_4px_20px_-10px_rgba(28,25,23,0.15)]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <UrgencyPill urgency={wanted.urgency} />
                  <span className="text-right text-xs text-faint tabular-nums">
                    {postedTime || "Recently"}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-medium leading-snug text-ink line-clamp-2">
                  {wanted.title}
                </h3>

                {wanted.description && (
                  <p className="mt-1.5 text-xs leading-relaxed text-muted line-clamp-2">
                    {wanted.description}
                  </p>
                )}

                {/* Badges: Dept + Campus */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  <span className="rounded-md border border-line/70 bg-sunken px-2 py-0.5 text-[10.5px] font-medium text-ink-soft">
                    {wanted.academic_year || "All Years"} · {wanted.branch || "General"}
                  </span>
                  {wanted.college_name && (
                    <span className="inline-flex max-w-[200px] items-center gap-1 truncate rounded-md border border-line/70 bg-sunken px-2 py-0.5 text-[10.5px] font-medium text-ink-soft">
                      <GraduationCap className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
                      <span className="truncate">{wanted.college_name}</span>
                    </span>
                  )}
                </div>

                {/* AI Instant Match Callout */}
                {matchedProduct && (
                  <button
                    type="button"
                    onClick={() => onSelectProduct?.(matchedProduct)}
                    className="mt-3.5 flex w-full items-center justify-between gap-2 rounded-xl border border-positive/30 bg-positive-soft px-3 py-2 text-left transition hover:border-positive/50"
                  >
                    <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-positive">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>✨ 1 Matching Listing Found — View Deal</span>
                    </span>
                    <span className="text-[11px] font-semibold tabular-nums text-positive">
                      {rupees(matchedProduct.listed_price ?? matchedProduct.suggested_price)}
                    </span>
                  </button>
                )}
              </div>

              {/* Bottom Row: Budget & Actions */}
              <div className="mt-5 border-t border-line/70 pt-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-medium text-muted">Max Budget</span>
                    <p className="text-xl font-semibold tabular-nums text-ink">
                      {wanted.budget ? rupees(wanted.budget) : "Open to Offers"}
                    </p>
                  </div>
                  <span className="text-[11px] text-faint">
                    By {wanted.student_name || "Student"}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHandoffItem(wanted)}
                    className="btn btn-primary h-9 flex-1 text-xs font-medium"
                  >
                    I Have This · Sell & Earn ₹
                  </button>

                  <a
                    href={buildWantedWhatsAppShareUrl(wanted)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ask in WhatsApp Group"
                    aria-label="Ask in WhatsApp Group"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-sunken text-[#25D366] transition hover:bg-[#25D366] hover:text-white"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {displayList.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line py-12 text-center">
          <AlertCircle className="h-8 w-8 text-faint" aria-hidden="true" />
          <h3 className="mt-3 text-base font-medium">No requested items found</h3>
          <p className="mt-1 text-xs text-muted">
            Be the first to post what you need on campus!
          </p>
          <button
            type="button"
            onClick={() => setIsPosting(true)}
            className="btn btn-primary mt-4 h-9 text-xs"
          >
            + Post What You Need
          </button>
        </div>
      )}

      {/* Seller Handoff Modal */}
      {handoffItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-xs"
            onClick={() => setHandoffItem(null)}
          />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive-soft px-2.5 py-0.5 text-[11px] font-semibold text-positive">
                  Quick Cash Opportunity
                </span>
                <h3 className="mt-2 text-lg font-medium leading-snug">
                  Sell your {handoffItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHandoffItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-muted hover:bg-sunken"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted">
              {handoffItem.student_name || "A verified student"} is offering up to{" "}
              <strong className="text-ink font-semibold">{rupees(handoffItem.budget)}</strong> for this item at{" "}
              <strong>{handoffItem.college_name || "your campus"}</strong>.
            </p>

            <div className="mt-5 space-y-2.5">
              <Link
                to="/download"
                onClick={() => setHandoffItem(null)}
                className="btn btn-primary h-11 w-full gap-2 text-xs font-medium sm:text-sm"
              >
                <Smartphone className="h-4 w-4 shrink-0" />
                Chat with Buyer in CampusMart App
              </Link>

              <a
                href={`mailto:martaicampus@gmail.com?subject=${encodeURIComponent(
                  `CampusMart Match: I have ${handoffItem.title} for ${handoffItem.student_name || "Buyer"}`
                )}&body=${encodeURIComponent(
                  `Hi CampusMart Team,\n\nI have the requested item (${handoffItem.title}) for max budget ${rupees(
                    handoffItem.budget
                  )}.\nPlease connect me with the student buyer on ${handoffItem.college_name || "campus"}.\n\nMy Contact Details:\nName:\nHostel/Room:\nPhone/WhatsApp:`
                )}`}
                className="btn btn-secondary h-11 w-full gap-2 text-xs font-medium sm:text-sm"
              >
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                Connect via Campus Support Email
              </a>
            </div>

            <p className="mt-4 text-center text-[11px] text-faint">
              Instant handoffs occur in common campus zones (hostel, library, canteen).
            </p>
          </div>
        </div>
      )}

      {/* Post a Wanted Item Modal with AI Auto-Fill */}
      {isPosting && (
        <PostWantedModal
          onClose={() => setIsPosting(false)}
          onSuccess={handlePostSuccess}
        />
      )}
    </section>
  );
}

function PostWantedModal({ onClose, onSuccess }) {
  const [prompt, setPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [urgency, setUrgency] = useState("⚡ Needed this week");
  const [branch, setBranch] = useState("First Year (Common)");
  const [academicYear, setAcademicYear] = useState("FE (1st Year)");
  const [collegeName, setCollegeName] = useState("Dr. Daulatrao Aher College of Engineering, Karad");
  const [description, setDescription] = useState("");
  const [studentName, setStudentName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAiAutoFill = async () => {
    if (!prompt.trim()) return;
    setAiLoading(true);
    try {
      const parsed = await aiDraftWantedRequest(prompt);
      if (parsed) {
        if (parsed.title) setTitle(parsed.title);
        if (parsed.budget) setBudget(String(parsed.budget));
        if (parsed.urgency) setUrgency(parsed.urgency);
        if (parsed.branch) setBranch(parsed.branch);
        if (parsed.academic_year) setAcademicYear(parsed.academic_year);
        if (parsed.description) setDescription(parsed.description);
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    const payload = {
      id: `wanted-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      budget: budget ? parseInt(budget, 10) : null,
      urgency,
      branch,
      academic_year: academicYear,
      college_name: collegeName,
      description: description.trim() || `Urgent student request for ${title.trim()}.`,
      student_name: studentName.trim() || "Verified Student",
      created_at: new Date().toISOString(),
    };

    try {
      const created = await createWantedRequest(payload);
      onSuccess(created || payload);
    } catch {
      onSuccess(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent-deep">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-base font-medium">Post a Wanted Item</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-sunken"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-h-[82vh] overflow-y-auto p-5 scroll-slim">
          {/* Quick AI Prompt Assistant */}
          <div className="mb-4 rounded-xl border border-accent/25 bg-accent-soft/40 p-3.5">
            <label
              htmlFor="ai-wanted-prompt"
              className="block text-xs font-medium text-accent-deep"
            >
              ✨ One-Sentence AI Auto-Fill
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="ai-wanted-prompt"
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Need Casio fx-991CW under ₹700 urgent for tomorrow exam"
                className="input h-9 text-xs flex-1 bg-card"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAiAutoFill();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAiAutoFill}
                disabled={aiLoading || !prompt.trim()}
                className="btn btn-secondary h-9 shrink-0 gap-1.5 px-3 text-xs font-medium"
              >
                {aiLoading ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                )}
                <span>Auto-Fill</span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Type naturally. Our AI extracts Title, Budget, Urgency & Department automatically.
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-ink">
                Item Title <span className="text-warn">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio fx-991CW Calculator"
                className="input mt-1 h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-ink">
                  Max Budget (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 700"
                  className="input mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-ink">Urgency</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="input mt-1 h-9 text-xs"
                >
                  <option value="🔥 Urgent for tomorrow's exam">🔥 Urgent for tomorrow's exam</option>
                  <option value="🔥 Urgent for Monday submission">🔥 Urgent for Monday submission</option>
                  <option value="⚡ Needed this week">⚡ Needed this week</option>
                  <option value="📚 Before Exams">📚 Before Exams</option>
                  <option value="🏖️ Casual / Looking for deals">🏖️ Casual / Looking for deals</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-ink">Department</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="input mt-1 h-9 text-xs"
                >
                  {BRANCHES.filter((b) => b !== "All Branches").map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-ink">Academic Year</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="input mt-1 h-9 text-xs"
                >
                  {ACADEMIC_YEARS.filter((y) => y !== "All Years").map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-ink">Campus / College</label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. Dr. Daulatrao Aher College of Engineering, Karad"
                className="input mt-1 h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-ink">Your First Name / Batch</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rohan (Mech '27)"
                  className="input mt-1 h-9 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-ink">Additional Note (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Working condition, with battery"
                  className="input mt-1 h-9 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary h-9 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="btn btn-primary h-9 gap-1.5 text-xs font-medium"
            >
              {submitting ? (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>Publish to Wanted Board</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
