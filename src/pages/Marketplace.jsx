import { useMemo, useState } from "react";
import { ArrowUpDown, PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { useWarmup } from "../hooks/useWarmup.js";
import { demoListings } from "../data/demoListings.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductDetailModal from "../components/ProductDetailModal.jsx";
import ApiStatusBadge from "../components/ApiStatusBadge.jsx";
import WarmupBanner from "../components/WarmupBanner.jsx";
import { productPrice, trustOutOf5 } from "../lib/format.js";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="aspect-[16/10] animate-pulse bg-sunken" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-sunken" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-sunken" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-20 animate-pulse rounded bg-sunken" />
          <div className="h-4 w-14 animate-pulse rounded bg-sunken" />
        </div>
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { products, online, loading, refresh } = useLiveFeed();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [selected, setSelected] = useState(null);
  const warmup = useWarmup(loading);

  const usingDemo = !loading && !online && products.length === 0;
  const source = usingDemo ? demoListings : products;

  const categories = useMemo(() => {
    const set = new Set();
    for (const product of source) {
      if (product.category) set.add(product.category);
    }
    return ["All", ...[...set].sort()];
  }, [source]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = source.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (!needle) return true;
      const tagsStr = Array.isArray(product.ai_tags) ? product.ai_tags.join(" ") : "";
      const notesStr = product.ai_condition_notes || "";
      const haystack = `${product.title} ${product.description ?? ""} ${
        product.category ?? ""
      } ${tagsStr} ${notesStr}`.toLowerCase();
      return haystack.includes(needle);
    });

    return [...list].sort((a, b) => {
      if (sortBy === "price-asc") {
        return (productPrice(a) ?? 0) - (productPrice(b) ?? 0);
      }
      if (sortBy === "price-desc") {
        return (productPrice(b) ?? 0) - (productPrice(a) ?? 0);
      }
      if (sortBy === "best-value") {
        const getSavings = (p) => {
          const l = productPrice(p);
          const s = Number(p.suggested_price);
          if (l > 0 && s > 0 && s >= l * 0.5 && s <= l * 2) {
            return (s - l) / s;
          }
          return -1;
        };
        return getSavings(b) - getSavings(a);
      }
      if (sortBy === "trust-desc") {
        const trustA = trustOutOf5(a.seller_trust_score) ?? 0;
        const trustB = trustOutOf5(b.seller_trust_score) ?? 0;
        return trustB - trustA;
      }
      return 0; // featured default
    });
  }, [source, query, category, sortBy]);

  const hasFilters = query.trim() !== "" || category !== "All" || sortBy !== "featured";

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setSortBy("featured");
  };

  return (
    <div className="page-in mx-auto w-full max-w-6xl px-5 pt-6 pb-12 sm:px-8 sm:pt-8">
      <header className="shrink-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p className="eyebrow">Live campus marketplace</p>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
              What students are selling right now
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Browse verified pre-owned textbooks, electronics, and hostel
              essentials from students on your campus.
            </p>
          </div>

          <ApiStatusBadge
            online={online}
            loading={loading}
            onRefresh={refresh}
            demo={usingDemo}
          />
        </div>

        <div className="mx-auto mt-5 flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-72">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search — bose, calculus, lab kit…"
              aria-label="Search listings"
              className="input pl-10 pr-9"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-faint transition-colors hover:bg-sunken hover:text-ink"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scroll-slim">
            <span className="hidden shrink-0 items-center gap-1.5 pr-1 text-xs text-faint sm:flex">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              Category
            </span>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className="pill shrink-0"
                data-active={category === item}
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 pt-1 sm:pt-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-faint shrink-0 flex items-center gap-1">
                <ArrowUpDown className="h-3 w-3" aria-hidden="true" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort listings"
                className="h-8.5 rounded-lg border border-line bg-card px-2.5 text-xs font-medium text-ink outline-none transition hover:border-line-strong focus:border-accent"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="best-value">Best Value vs AI Estimate</option>
                <option value="trust-desc">Highest Seller Trust</option>
              </select>
            </div>

            <p className="shrink-0 text-xs tabular-nums text-faint lg:pl-1">
              {loading
                ? "Loading…"
                : `${filtered.length} of ${source.length}`}
            </p>
          </div>
        </div>

        {usingDemo && (
          <p className="mx-auto mt-4 max-w-6xl rounded-xl border border-warn/25 bg-warn-soft px-4 py-3 text-[13px] leading-relaxed text-warn">
            Showing popular items while the marketplace reconnects. Tap refresh
            in a moment to see everything live on campus.
          </p>
        )}
      </header>

      <div className="mt-6 w-full">
        <WarmupBanner show={warmup.show} elapsed={warmup.elapsed} className="mb-5" />

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-card text-faint">
              <PackageSearch className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-xl">Nothing matches that yet</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              {hasFilters
                ? "Try a different word, or clear the filters to see everything on campus."
                : "No listings are on the board right now. Check back after the next class."}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary mt-5"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id ?? product.title}
                product={product}
                onOpen={() => setSelected(product)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <ProductDetailModal product={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
