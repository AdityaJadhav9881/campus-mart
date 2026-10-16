import { ArrowRight, Check, Smartphone, Store } from "lucide-react";
import { Link } from "../router/router.jsx";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { useStats } from "../hooks/useStats.js";
import { demoListings } from "../data/demoListings.js";
import { conditionLabel, productPrice, rupees, trustOutOf5 } from "../lib/format.js";

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

function PreviewRow({ product }) {
  const price = productPrice(product);
  const outOf5 = trustOutOf5(product.seller_trust_score);

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-sunken text-faint">
        {product.image_url ? (
          <img src={product.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <Store className="h-4 w-4" aria-hidden="true" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">
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

  const preview =
    products.length > 0 ? products.slice(0, 3) : demoListings.slice(0, 3);

  return (
    <div className="page-in h-full overflow-y-auto scroll-slim">
      <div className="mx-auto grid min-h-full max-w-6xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-12">
        {/* Intro */}
        <section>
          <p className="eyebrow">The campus marketplace</p>

          <h1 className="mt-4 text-[2.25rem] leading-[1.06] sm:text-5xl">
            Buy and sell with people on your own campus.
          </h1>

          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
            List a textbook, lab kit or gadget in under a minute. Our vision AI
            reads four photos, suggests a fair resale price in ₹, and puts a
            trust score next to every seller — so you know who you are dealing
            with before you message them.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/marketplace" className="btn btn-primary">
              <Store className="h-4 w-4" aria-hidden="true" />
              Browse Live Marketplace
            </Link>
            <Link to="/download" className="btn btn-secondary">
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              Get the Android App
            </Link>
          </div>

          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
            {PROMISES.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[13px] text-muted"
              >
                <Check className="h-3.5 w-3.5 text-positive" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Live counters + previews */}
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-ink">
                Campus Activity
              </p>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
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

          <div className="card p-5">
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
                <PreviewRow key={product.id} product={product} />
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
    </div>
  );
}
