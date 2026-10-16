import { useMemo, useState } from "react";
import { PackageSearch, Search, SlidersHorizontal, X } from "lucide-react";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { useWarmup } from "../hooks/useWarmup.js";
import { demoListings } from "../data/demoListings.js";
import ProductCard from "../components/ProductCard.jsx";
import ApiStatusBadge from "../components/ApiStatusBadge.jsx";
import WarmupBanner from "../components/WarmupBanner.jsx";

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
    return source.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (!needle) return true;
      const haystack = `${product.title} ${product.description ?? ""} ${
        product.category ?? ""
      }`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [source, query, category]);

  const hasFilters = query.trim() !== "" || category !== "All";

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
  };

  return (
    <div className="page-in flex h-full flex-col px-5 pt-7 pb-4 sm:px-8">
      <header className="shrink-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p className="eyebrow">Live campus marketplace</p>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
              What students are selling right now
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Every row below comes from the campus backend, with the AI
              condition grade, a ₹ price and the seller's trust score.
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
          <div className="relative lg:w-80">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search listings — textbook, calculator…"
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

          <p className="shrink-0 text-xs tabular-nums text-faint lg:pl-2">
            {loading
              ? "Loading…"
              : `${filtered.length} of ${source.length} listings`}
          </p>
        </div>

        {usingDemo && (
          <p className="mx-auto mt-4 max-w-6xl rounded-xl border border-warn/25 bg-warn-soft px-4 py-3 text-[13px] leading-relaxed text-warn">
            The backend could not be reached, so these are sample listings. Tap
            refresh once the API is back to see live inventory.
          </p>
        )}
      </header>

      <div className="mx-auto mt-6 w-full min-h-0 max-w-6xl flex-1 overflow-y-auto scroll-slim pb-4">
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
              <ProductCard key={product.id ?? product.title} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
