import { useEffect, useState } from "react";
import { ArrowRight, Check, Smartphone, Store } from "lucide-react";
import { Link } from "../router/router.jsx";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { useStats } from "../hooks/useStats.js";
import { demoListings } from "../data/demoListings.js";
import { conditionLabel, productPrice, rupees, trustOutOf5 } from "../lib/format.js";
import ProductDetailModal from "../components/ProductDetailModal.jsx";
import WantedBoard from "../components/WantedBoard.jsx";

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
  const price = productPrice(product);
  const outOf5 = trustOutOf5(product.seller_trust_score);

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
      className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-sunken/80 focus:bg-sunken"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-sunken text-faint group-hover:border-line-strong transition">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
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
    products.length > 0 ? products.slice(0, 3) : demoListings.slice(0, 3);

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
      <div className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-12">
        {/* Intro */}
        <section className="min-w-0">
          <p className="eyebrow">The campus marketplace</p>

          <h1 className="mt-3 text-3xl font-medium leading-tight sm:mt-4 sm:text-5xl sm:leading-[1.08]">
            Buy and sell with people on your own campus.
          </h1>

          <p className="mt-3.5 max-w-xl text-[15px] leading-relaxed text-muted sm:mt-5 sm:text-base">
            List a textbook, lab kit or gadget in under a minute. Our vision AI
            reads four photos, suggests a fair resale price in ₹, and puts a
            trust score next to every seller — so you know who you are dealing
            with before you message them.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center">
            <Link to="/marketplace" className="btn btn-primary w-full sm:w-auto">
              <Store className="h-4 w-4 shrink-0" aria-hidden="true" />
              Browse Live Marketplace
            </Link>
            <Link to="/download" className="btn btn-secondary w-full sm:w-auto">
              <Smartphone className="h-4 w-4 shrink-0" aria-hidden="true" />
              Get the Android App
            </Link>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 sm:mt-7">
            {PROMISES.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[13px] text-muted"
              >
                <Check className="h-3.5 w-3.5 shrink-0 text-positive" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Live counters + previews */}
        <aside className="min-w-0 space-y-4">
          <div className="card p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">
                Campus Activity
              </p>
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

            <dl className="mt-4 grid grid-cols-2 gap-3">
              <Counter term="Active listings" value={listings} />
              <Counter term="Verified students" value={students} />
            </dl>

            <div className="mt-4 flex items-center justify-end gap-3 border-t border-line pt-3">
              <button
                type="button"
                onClick={refresh}
                className="text-xs font-medium text-accent transition-colors hover:text-accent-deep"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="card p-4 sm:p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg leading-none">Fresh on campus</h2>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent transition-colors hover:text-accent-deep"
              >
                All listings
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>

            <ul className="mt-1 divide-y divide-line">
              {preview.map((product) => (
                <PreviewRow
                  key={product.id}
                  product={product}
                  onOpen={setSelected}
                />
              ))}
            </ul>

            <p className="mt-2 text-[11px] text-faint">
              {products.length > 0
                ? "Recently posted by verified students."
                : "Showing popular items while we reconnect."}
            </p>
          </div>
        </aside>
      </div>

      {/* Wanted on Campus Preview Strip */}
      <section className="mx-auto max-w-6xl px-5 pt-6 pb-14 sm:px-8 sm:pb-20">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
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
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-deep sm:text-sm"
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
