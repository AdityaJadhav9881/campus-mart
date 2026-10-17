import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  GraduationCap,
  ImageOff,
  Maximize2,
  Package,
  PackageSearch,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Store,
  X,
} from "lucide-react";
import { Link, useNavigate, useParams } from "../router/router.jsx";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { demoListings } from "../data/demoListings.js";
import {
  buildWhatsAppShareUrl,
  cleanAiNotes,
  conditionLabel,
  inferAcademicMeta,
  productPrice,
  relativeTime,
  rupees,
  trustOutOf5,
} from "../lib/format.js";
import ProductCard from "../components/ProductCard.jsx";

function WhatsAppIcon({ className = "h-4 w-4" }) {
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

function TrustStars({ outOf5 }) {
  const filled = Math.round(outOf5);
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= filled ? "fill-warn text-warn" : "text-line-strong"
          }`}
        />
      ))}
    </span>
  );
}

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useLiveFeed();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [failedImages, setFailedImages] = useState({});

  const allItems = products.length > 0 ? products : demoListings;

  const product = useMemo(() => {
    if (!id) return null;
    const needle = decodeURIComponent(id).trim().toLowerCase();

    // 1. Direct ID match in live products or demo
    const byId = allItems.find(
      (p) => p.id && String(p.id).toLowerCase() === needle
    );
    if (byId) return byId;

    // 2. Slug match
    const bySlug = allItems.find((p) => {
      const slug = (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      return slug === needle || slug.includes(needle) || needle.includes(slug);
    });
    if (bySlug) return bySlug;

    // 3. Fallback demo listings check
    return demoListings.find(
      (p) =>
        String(p.id).toLowerCase() === needle ||
        p.title?.toLowerCase() === needle
    );
  }, [id, allItems]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setActiveImageIndex(0);
  }, [id]);

  useEffect(() => {
    if (product?.title) {
      document.title = `${product.title} — CampusMart AI`;
    }
  }, [product]);

  if (!product && !loading) {
    return (
      <div className="page-in mx-auto w-full max-w-4xl px-5 py-16 sm:px-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-line bg-card text-faint">
          <PackageSearch className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-medium sm:text-3xl text-ink">
          Listing not found on campus
        </h1>
        <p className="mt-2 text-sm text-muted max-w-md mx-auto">
          This item may have already been sold to a fellow student, or the link has expired.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link to="/marketplace" className="btn btn-primary gap-2">
            <Store className="h-4 w-4" />
            Browse Live Marketplace
          </Link>
          <Link to="/marketplace?tab=wanted" className="btn btn-secondary gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Post on Want to Buy Board
          </Link>
        </div>
      </div>
    );
  }

  if (loading && !product) {
    return (
      <div className="page-in mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
        <div className="h-6 w-48 animate-pulse rounded bg-sunken mb-6" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-sunken" />
          </div>
          <div className="space-y-4 lg:col-span-5">
            <div className="h-8 w-3/4 animate-pulse rounded bg-sunken" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-sunken" />
            <div className="h-12 w-full animate-pulse rounded-xl bg-sunken" />
          </div>
        </div>
      </div>
    );
  }

  const title = product.title || "Campus Item";
  const rawImages = Array.isArray(product.image_urls) && product.image_urls.length > 0
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];

  const images = rawImages.length > 0 ? rawImages : [];
  const safeIndex = images.length > 0 ? Math.min(activeImageIndex, images.length - 1) : 0;
  const activeImage = images[safeIndex];
  const activeFailed = !activeImage || failedImages[activeImage];

  const listed = productPrice(product);
  const suggestedRaw = product?.suggested_price;
  const suggested =
    suggestedRaw === null || suggestedRaw === undefined || suggestedRaw === ""
      ? null
      : Number(suggestedRaw);

  const hasSuggested =
    suggested !== null &&
    listed !== null &&
    Number.isFinite(suggested) &&
    Number.isFinite(listed) &&
    suggested > 0 &&
    listed > 0 &&
    suggested !== 80 &&
    suggested >= listed * 0.5 &&
    suggested <= listed * 2;

  const savings =
    hasSuggested && listed < suggested
      ? Math.round(((suggested - listed) / suggested) * 100)
      : null;

  const outOf5 = trustOutOf5(product?.seller_trust_score);
  const academic = inferAcademicMeta(product);
  const sellerName = product.seller_name || "Verified Student Seller";
  const posted = relativeTime(product.created_at);
  const notes = cleanAiNotes(product.ai_condition_notes);
  const tags = Array.isArray(product.ai_tags) ? product.ai_tags : [];

  const relatedProducts = allItems
    .filter((p) => p.id !== product.id)
    .slice(0, 3);

  const ANGLE_LABELS = ["Front View", "Back Housing", "Side / Edges", "Condition Detail"];

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/product/${encodeURIComponent(product.id || id)}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore clipboard error */
    }
  };

  const handleStep = (delta) => {
    if (images.length === 0) return;
    setActiveImageIndex((prev) => (prev + delta + images.length) % images.length);
  };

  return (
    <div className="page-in w-full pb-16">
      <div className="mx-auto max-w-6xl px-5 pt-4 pb-12 sm:px-8 sm:pt-6">
        {/* Top Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-muted"
        >
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-accent hover:text-accent-deep transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Marketplace</span>
          </Link>
          <span className="text-faint">/</span>
          {product.category && (
            <>
              <Link
                to={`/marketplace?category=${encodeURIComponent(product.category)}`}
                className="hover:text-ink transition-colors"
              >
                {product.category}
              </Link>
              <span className="text-faint">/</span>
            </>
          )}
          <span className="truncate max-w-[220px] sm:max-w-xs text-ink font-semibold">
            {title}
          </span>
        </nav>

        {/* Flagship 2-Column Product Layout */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column: 4-Angle Interactive Visual Showcase (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main High-Res Image Stage */}
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-line bg-sunken shadow-xs">
              {!activeFailed ? (
                <img
                  src={activeImage}
                  alt={`${title} — ${ANGLE_LABELS[safeIndex] || "Photo"}`}
                  onError={() => setFailedImages((prev) => ({ ...prev, [activeImage]: true }))}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-faint">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-xs font-medium">Photo preview</span>
                </div>
              )}

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleStep(-1)}
                    aria-label="Previous angle"
                    className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card/95 text-ink shadow-md backdrop-blur transition hover:scale-110 hover:border-line-strong"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStep(1)}
                    aria-label="Next angle"
                    className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card/95 text-ink shadow-md backdrop-blur transition hover:scale-110 hover:border-line-strong"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Fullscreen Zoom Trigger */}
              {!activeFailed && (
                <button
                  type="button"
                  onClick={() => setZoomOpen(true)}
                  aria-label="Zoom image"
                  title="Click to zoom image"
                  className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card/90 text-ink shadow-xs backdrop-blur transition hover:scale-110"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}

              {/* Angle Tag Badge */}
              <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-card/95 px-3 py-1 text-xs font-medium text-ink backdrop-blur shadow-xs">
                <Sparkles className="h-3 w-3 text-accent" />
                <span>{ANGLE_LABELS[safeIndex] || `Photo ${safeIndex + 1}`}</span>
              </span>

              {images.length > 1 && (
                <span className="absolute bottom-3 left-3 rounded-full bg-ink/75 px-2.5 py-0.5 text-xs font-mono font-medium text-paper backdrop-blur">
                  {safeIndex + 1} / {images.length}
                </span>
              )}
            </div>

            {/* 4 Clickable Angle Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {images.slice(0, 4).map((url, i) => {
                  const isSelected = i === safeIndex;
                  return (
                    <button
                      key={url + i}
                      type="button"
                      onClick={() => setActiveImageIndex(i)}
                      className={`group relative flex flex-col items-center overflow-hidden rounded-xl border p-1 text-left transition-all ${
                        isSelected
                          ? "border-accent ring-2 ring-accent/30 shadow-xs"
                          : "border-line bg-card hover:border-line-strong hover:bg-sunken"
                      }`}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-sunken">
                        {failedImages[url] ? (
                          <div className="flex h-full w-full items-center justify-center text-faint">
                            <ImageOff className="h-4 w-4" />
                          </div>
                        ) : (
                          <img
                            src={url}
                            alt=""
                            onError={() => setFailedImages((prev) => ({ ...prev, [url]: true }))}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                      </div>
                      <span className="mt-1 block truncate w-full text-center text-[10.5px] font-medium text-ink">
                        {ANGLE_LABELS[i] || `Angle ${i + 1}`}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Description Text */}
            {product.description && (
              <div className="rounded-2xl border border-line bg-card p-5 sm:p-6 shadow-xs">
                <h2 className="text-base font-semibold text-ink">Seller Description</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted whitespace-pre-line">
                  {product.description}
                </p>
                {posted && (
                  <p className="mt-3 text-xs text-faint border-t border-line/60 pt-3">
                    Listed on campus {posted}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Clean Action Dock (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Title & Badges Box */}
            <div className="rounded-2xl border border-line bg-card p-5 sm:p-6 shadow-xs">
              {/* Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="rounded-md border border-line bg-sunken px-2.5 py-1 text-xs font-medium text-ink-soft">
                  {product.category || "Campus Item"}
                </span>
                <span className="rounded-md border border-positive/30 bg-positive-soft px-2.5 py-1 text-xs font-semibold text-positive">
                  {conditionLabel(product.condition)}
                </span>
                <span className="rounded-md border border-line bg-sunken px-2.5 py-1 text-xs font-medium text-ink-soft">
                  {academic.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="mt-3.5 font-display text-2xl font-medium sm:text-3xl text-ink leading-snug">
                {title}
              </h1>

              {/* Campus pill */}
              {product.college_name && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-ink-soft">
                  <GraduationCap className="h-4 w-4 shrink-0 text-accent" />
                  <span>{product.college_name}</span>
                </div>
              )}

              {/* Price Block */}
              <div className="mt-5 rounded-xl border border-line bg-sunken/60 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <span className="text-xs font-medium text-muted block">Student Listed Price</span>
                    <span className="text-3xl font-bold tabular-nums text-ink leading-tight">
                      {rupees(listed)}
                    </span>
                  </div>

                  {hasSuggested && (
                    <div className="text-right">
                      <span className="text-xs font-medium text-muted block">AI Fair Valuation</span>
                      <span className="text-lg font-semibold tabular-nums text-ink-soft">
                        {rupees(suggested)}
                      </span>
                    </div>
                  )}
                </div>

                {savings !== null && (
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive-soft px-2.5 py-0.5 text-xs font-semibold text-positive">
                      <Sparkles className="h-3 w-3" />
                      <span>{savings}% below AI estimated retail market</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons Dock (Generous, Non-Squished) */}
              <div className="mt-5 space-y-3">
                {/* 1. Primary Ink Black CTA */}
                <Link
                  to="/download"
                  className="btn btn-primary h-12 w-full gap-2.5 text-sm font-semibold rounded-xl shadow-sm justify-center"
                >
                  <Smartphone className="h-4.5 w-4.5 shrink-0" />
                  <span>Get the App to Buy / Chat with Seller</span>
                </Link>

                {/* 2. Secondary Royal Blue Outline CTA */}
                <Link
                  to={`/sandbox?item=${encodeURIComponent(title)}&price=${listed ?? ""}&category=${encodeURIComponent(product.category || "")}`}
                  className="btn btn-secondary h-12 w-full gap-2.5 text-sm font-medium rounded-xl border-accent/40 text-accent hover:border-accent hover:bg-accent-soft/40 justify-center"
                >
                  <Sparkles className="h-4 w-4 shrink-0 text-accent" />
                  <span>Ask CampusMart AI About This Item</span>
                </Link>

                {/* 3. Side-by-Side 2-Button Grid */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <a
                    href={buildWhatsAppShareUrl(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn h-11 gap-2 bg-[#25D366] text-white hover:bg-[#20ba59] border-transparent font-medium text-xs sm:text-[13px] rounded-xl shadow-xs justify-center"
                  >
                    <WhatsAppIcon className="h-4 w-4 fill-white" />
                    <span>Share on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="btn btn-secondary h-11 gap-2 text-xs sm:text-[13px] rounded-xl justify-center font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-positive shrink-0" />
                        <span className="text-positive font-semibold">Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-muted shrink-0" />
                        <span>Copy Product Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="mt-3 text-center text-[11.5px] text-faint">
                ⚡ Handover occurs safely in college canteen, library or hostel gates.
              </p>
            </div>

            {/* AI Inspection Summary Card */}
            <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-positive-soft text-positive">
                  <BadgeCheck className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-ink">4-Angle Vision AI Inspection</h3>
                  <p className="text-[11px] text-muted">Cleared &amp; verified by Google Gemini Vision</p>
                </div>
              </div>

              <div className="mt-3.5 rounded-xl border border-line/70 bg-sunken/50 p-3.5">
                <p className="text-xs leading-relaxed text-ink-soft">
                  {notes}
                </p>
              </div>

              {tags.length > 0 && (
                <div className="mt-3.5">
                  <span className="text-[11px] font-medium text-muted block mb-1.5">
                    Visual Search Tags:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-line bg-card px-2.5 py-0.5 text-[11px] font-medium text-ink-soft"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Seller Verification Card */}
            <div className="rounded-2xl border border-line bg-card p-5 shadow-xs">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-sunken text-ink">
                    <Package className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{sellerName}</p>
                    <span className="flex items-center gap-1 text-[11.5px] font-medium text-positive">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified Campus Student</span>
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <TrustStars outOf5={outOf5 ?? 5.0} />
                  <span className="mt-0.5 block text-xs font-semibold tabular-nums text-ink">
                    ★ {outOf5 !== null ? outOf5.toFixed(1) : "5.0"} / 5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: More items from campus */}
        {relatedProducts.length > 0 && (
          <section className="mt-14 border-t border-line pt-10">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="eyebrow">Campus Exchange</p>
                <h2 className="mt-1 text-2xl font-medium text-ink">More items from campus</h2>
              </div>
              <Link
                to="/marketplace"
                className="text-xs font-semibold text-accent hover:underline sm:text-sm"
              >
                View full marketplace →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fullscreen Zoom Lightbox Modal */}
      {zoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setZoomOpen(false)}
            aria-label="Close zoom"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={activeImage}
            alt={title}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
