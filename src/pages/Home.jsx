import { useEffect, useState } from "react";
import { ArrowRight, Check, Smartphone, Store } from "lucide-react";
import { Link } from "../router/router.jsx";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { useStats } from "../hooks/useStats.js";
import { demoListings } from "../data/demoListings.js";
import { conditionLabel, productPrice, rupees, trustOutOf5 } from "../lib/format.js";
import ProductDetailModal from "../components/ProductDetailModal.jsx";
import WantedBoard from "../components/WantedBoard.jsx";
import HeroGraphic from "../components/HeroGraphic.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import CategoryShowcase from "../components/CategoryShowcase.jsx";

const MODE_LABEL = {
  loading: "Checking campus activity…",
  live: "Live Marketplace",
  estimate: "Updated in real time",
  demo: "Popular right now",
};

const PROMISES = [
  "Verified campus email",
  "Fair ₹ pricing from our AI",
  "No seller fees",
];

function Counter({ term, value }) {
  return (
    <div className="rounded-xl bg-sunken px-4 py-3">
      <dt className="text-xs font-medium text-muted">{term}</dt>
      <dd className="mt-1 text-3xl font-semibold tabular-nums leading-none text-ink">
        {value === null ? "—" : value.toLocaleString("en-IN")}
      </dd>
    </div>
  );
}

function PreviewRow({ product, onOpen }) {
  const [imgError, setImgError] = useState(false);
  const price = productPrice(product);
  const outOf5 = trustOutOf5(product.seller_trust_score);
  const hasValidImage = Boolean(product.image_url) && !imgError;

  return (
    <li
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.title}`}
      onClick={() => onOpen(product)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(product);
        }
      }}
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-sunken/80 focus:bg-sunken"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-sunken text-faint group-hover:border-line-strong transition">
        {hasValidImage ? (
          <img
            src={product.image_url}
            alt=""
            onError={() => setImgError(true)}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Store className="h-4 w-4" aria-hidden="true" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink group-hover:text-accent transition-colors">
          {product.title}
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          {conditionLabel(product.condition)}
          {outOf5 !== null ? (
            <span className="text-faint"> · ★ {outOf5.toFixed(1)} / 5</span>
          ) : null}
        </span>
      </span>

      <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">
        {rupees(price)}
      </span>
    </li>
  );
}

export default function Home() {
  const { products, online, loading, refresh } = useLiveFeed();
  const { listings, students, mode } = useStats({ products, online, loading });
  const [selected, setSelected] = useState(null);

  const preview =
    products.length > 0 ? products.slice(0, 4) : demoListings.slice(0, 4);

  // Deep-link query listener: ?item=<id-or-slug>
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const itemParam = params.get("item");
    const list = products.length > 0 ? products : demoListings;
    if (itemParam && list.length > 0) {
      const needle = decodeURIComponent(itemParam).trim().toLowerCase();
      const matched = list.find((p) => {
        if (p.id && String(p.id).toLowerCase() === needle) return true;
        const slug = (p.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
        if (slug === needle || slug.includes(needle) || needle.includes(slug)) return true;
        if (p.title && p.title.toLowerCase() === needle) return true;
        return false;
      });
      if (matched) {
        setSelected(matched);
      }
    }
  }, [products]);

  return (
    <div className="page-in w-full">
      {/* Hero Section with Interactive Graphic */}
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16 lg:py-16">
        {/* Ambient background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-[450px] w-full max-w-6xl bg-gradient-to-b from-accent/8 via-transparent to-transparent blur-3xl"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
          {/* Hero Typography & CTAs */}
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card/80 px-3.5 py-1 text-xs font-semibold text-accent backdrop-blur-xs shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
              <span>Verified Maharashtra Campus Marketplace</span>
            </div>

            <h1 className="mt-4 text-3xl font-medium leading-[1.12] sm:text-5xl lg:text-[54px]">
              Buy and sell with students on your own campus.
            </h1>

            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              List a textbook, lab kit or gadget in under a minute. Our vision AI
              reads four photos, suggests a fair resale price in ₹, and puts a
              trust score next to every seller — so you know who you are dealing
              with before you message them.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/marketplace" className="btn btn-primary w-full sm:w-auto shadow-sm">
                <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
                Browse Live Marketplace
              </Link>
              <Link to="/download" className="btn btn-secondary w-full sm:w-auto">
                <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
                Get the Android App
              </Link>
            </div>

            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
              {PROMISES.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[13px] text-muted font-medium"
                >
                  <Check className="h-3.5 w-3.5 shrink-0 text-positive" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hero Graphic: Apple/Stripe-tier 4-Angle AI Viewfinder */}
          <div className="min-w-0 flex justify-center lg:justify-end">
            <HeroGraphic />
          </div>
        </div>
      </section>

      {/* Trust & Safety Architecture Strip */}
      <TrustBadges />

      {/* Visual Category Showcase */}
      <CategoryShowcase />

      {/* Live Campus Activity & Fresh Listings Section */}
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] items-start">
          {/* Live Activity Counters */}
          <div className="card p-5 sm:p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="eyebrow">Real-Time Pulse</span>
                <h3 className="mt-1 text-lg font-medium text-ink">Campus Activity</h3>
              </div>
              <span
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                  mode === "live"
                    ? "border-positive/25 bg-positive-soft text-positive"
                    : "border-line bg-sunken text-muted"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${
                    mode === "loading"
                      ? "bg-faint"
                      : mode === "live"
                        ? "live-dot bg-positive"
                        : "bg-faint/60"
                  }`}
                />
                {MODE_LABEL[mode]}
              </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3">
              <Counter term="Active listings" value={listings} />
              <Counter term="Verified students" value={students} />
            </dl>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-3.5 text-xs text-muted">
              <span>Updated automatically every minute</span>
              <button
                type="button"
                onClick={refresh}
                className="font-medium text-accent hover:text-accent-deep transition-colors"
              >
                Refresh feed
              </button>
            </div>
          </div>

          {/* Fresh On Campus Preview Card */}
          <div className="card p-5 sm:p-6 shadow-xs">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <span className="eyebrow">Verified Inventory</span>
                <h3 className="mt-1 text-lg font-medium text-ink">Fresh on campus</h3>
              </div>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-deep transition-colors"
              >
                <span>View all listings</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <ul className="mt-3 divide-y divide-line">
              {preview.map((product) => (
                <PreviewRow
                  key={product.id}
                  product={product}
                  onOpen={setSelected}
                />
              ))}
            </ul>

            <p className="mt-3 text-[11px] text-faint">
              {products.length > 0
                ? "Recently listed and verified with 4-angle vision AI."
                : "Showing verified popular items while catalog reconnects."}
            </p>
          </div>
        </div>
      </section>

      {/* Wanted on Campus Preview Strip */}
      <section className="mx-auto max-w-6xl px-5 pt-4 pb-14 sm:px-8 sm:pb-20 border-t border-line">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between pt-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-accent" />
              <p className="eyebrow">Instant Cash For Seniors</p>
            </div>
            <h2 className="mt-1.5 text-2xl font-medium sm:text-3xl">
              Wanted on Campus
            </h2>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              Urgent items junior batchmates are looking for right now. Sell and get paid immediately.
            </p>
          </div>
          <Link
            to="/marketplace?tab=wanted"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-deep sm:text-sm transition-colors"
          >
            <span>View all campus requests</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <WantedBoard
          products={products.length > 0 ? products : demoListings}
          onSelectProduct={setSelected}
          previewOnly={true}
        />
      </section>

      {selected && (
        <ProductDetailModal
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
