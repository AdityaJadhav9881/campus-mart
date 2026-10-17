import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ImageOff,
  Package,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { Link } from "../router/router.jsx";
import {
  conditionLabel,
  productPrice,
  rupees,
  trustOutOf5,
} from "../lib/format.js";

function TrustStars({ outOf5 }) {
  const filled = Math.round(outOf5);
  return (
    <span className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= filled ? "fill-warn text-warn" : "text-line-strong"
          }`}
        />
      ))}
    </span>
  );
}

function Gallery({ images, category, title }) {
  const [index, setIndex] = useState(0);
  const safeIndex = images.length > 0 ? Math.min(index, images.length - 1) : 0;
  const active = images[safeIndex];

  const step = (delta) => {
    if (images.length === 0) return;
    setIndex((prev) => (prev + delta + images.length) % images.length);
  };

  return (
    <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          role="tablist"
          aria-label="Product photos"
          className="order-2 flex gap-2 overflow-x-auto scroll-slim sm:order-1 sm:w-20 sm:flex-col"
        >
          {images.slice(0, 4).map((url, i) => (
            <button
              key={url + i}
              type="button"
              role="tab"
              aria-selected={i === safeIndex}
              aria-label={`Show photo ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors duration-150 sm:h-20 sm:w-20 ${
                i === safeIndex
                  ? "border-ink"
                  : "border-line hover:border-line-strong"
              }`}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main preview */}
      <div className="order-1 relative overflow-hidden rounded-xl border border-line bg-sunken sm:order-2">
        <div className="flex aspect-[4/3] items-center justify-center">
          {active ? (
            <img
              src={active}
              alt={`${title} — photo ${safeIndex + 1} of ${images.length}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex flex-col items-center gap-2 text-faint">
              <ImageOff className="h-6 w-6" aria-hidden="true" />
              <span className="text-[11px] font-medium">No photo yet</span>
            </span>
          )}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card/95 text-ink-soft backdrop-blur transition-colors hover:border-line-strong"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card/95 text-ink-soft backdrop-blur transition-colors hover:border-line-strong"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-medium tabular-nums text-paper">
              {safeIndex + 1} / {Math.min(images.length, 4)}
            </span>
          </>
        )}

        <span className="absolute left-3 top-3 rounded-full border border-line bg-card/95 px-2.5 py-1 text-[11px] font-medium text-ink-soft backdrop-blur">
          {category || "Campus item"}
        </span>
      </div>
    </div>
  );
}

export default function ProductDetailModal({ product, onClose }) {
  const panelRef = useRef(null);
  const lastFocusedRef = useRef(null);

  useEffect(() => {
    lastFocusedRef.current = document.activeElement;
    panelRef.current?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  if (!product) return null;

  const title = product.title || "Untitled listing";
  const images = Array.isArray(product.image_urls)
    ? product.image_urls
    : product.image_url
      ? [product.image_url]
      : [];
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
  const tags = Array.isArray(product.ai_tags) ? product.ai_tags : [];
  const notes =
    typeof product.ai_condition_notes === "string" && product.ai_condition_notes
      ? product.ai_condition_notes
      : null;
  const sellerName = product.seller_name || "Verified campus seller";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      aria-hidden="false"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close product details"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${title} — product details`}
        tabIndex={-1}
        className="page-in relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-line bg-card shadow-[0_24px_60px_-24px_rgba(28,25,23,0.45)] outline-none sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-xl leading-snug sm:text-2xl">{title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted">
              <span>{conditionLabel(product?.condition)}</span>
              <span className="text-faint">·</span>
              <span className="text-faint">inspected listing</span>
              {product?.college_name && (
                <>
                  <span className="text-faint">·</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-line bg-sunken px-2.5 py-0.5 text-xs font-medium text-ink-soft">
                    <GraduationCap className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                    {product.college_name}
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-card text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto scroll-slim px-5 py-5 sm:px-6">
          <Gallery images={images} category={product?.category} title={title} />

          {/* Price comparison */}
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-line bg-sunken px-4 py-4">
            <div>
              <p className="text-xs font-medium text-muted">Listed price</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums leading-none text-ink">
                {rupees(listed)}
              </p>
            </div>

            <div className="text-right">
              {hasSuggested && (
                <>
                  <p className="text-xs font-medium text-muted">
                    AI suggested fair price
                  </p>
                  <p className="mt-1 text-lg font-semibold tabular-nums leading-none text-ink-soft">
                    {rupees(suggested)}
                  </p>
                </>
              )}
              {savings !== null && (
                <span className="mt-2 inline-flex items-center rounded-full border border-positive/25 bg-positive-soft px-2.5 py-1 text-[11px] font-semibold text-positive">
                  {savings}% below AI estimate
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product?.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {product.description}
            </p>
          )}

          {/* AI condition notes */}
          {notes && (
            <div className="mt-4 rounded-xl border border-line bg-card p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium text-ink">
                <BadgeCheck className="h-4 w-4 text-positive" aria-hidden="true" />
                AI condition notes
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {notes}
              </p>
            </div>
          )}

          {/* Visual search tags */}
          {tags.length > 0 && (
            <div className="mt-4">
              <p className="text-[13px] font-medium text-ink">
                Visual search tags
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-line bg-sunken px-2.5 py-1 text-[12px] font-medium text-muted"
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Seller + trust */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3.5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-sunken text-ink-soft">
                <Package className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{sellerName}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-faint">
                  <span className="flex items-center gap-1 text-positive">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    Verified campus email
                  </span>
                  {product?.college_name && (
                    <span className="flex items-center gap-1 text-ink-soft font-medium">
                      <GraduationCap className="h-3 w-3 text-accent" aria-hidden="true" />
                      {product.college_name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              {outOf5 !== null ? (
                <>
                  <TrustStars outOf5={outOf5} />
                  <p className="mt-1 text-sm font-semibold tabular-nums text-ink">
                    {outOf5.toFixed(1)}
                    <span className="font-normal text-faint"> / 5</span>
                  </p>
                </>
              ) : (
                <p className="text-sm text-faint">Seller rating —</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="border-t border-line bg-paper px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Link
              to="/download"
              onClick={onClose}
              className="btn btn-primary h-11 flex-1 text-[13px] sm:text-[13.5px]"
            >
              <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
              Get the App to Chat with Seller
            </Link>
            <Link
              to={`/sandbox?item=${encodeURIComponent(title)}&price=${listed ?? ""}&category=${encodeURIComponent(product?.category || "")}`}
              onClick={onClose}
              className="btn btn-secondary h-11 flex-1 text-[13px] sm:text-[13.5px]"
            >
              <Sparkles className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              Ask CampusMart AI About This Item
            </Link>
          </div>
          <p className="mt-2 text-center text-[11.5px] text-faint">
            Verified campus exchange · Chat and instant payments live in the Android app.
          </p>
        </div>
      </div>
    </div>
  );
}
