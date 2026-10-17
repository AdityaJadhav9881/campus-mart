import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  GraduationCap,
  PackageSearch,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useLiveFeed } from "../hooks/useLiveFeed.js";
import { useWarmup } from "../hooks/useWarmup.js";
import { demoListings } from "../data/demoListings.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductDetailModal from "../components/ProductDetailModal.jsx";
import WantedBoard from "../components/WantedBoard.jsx";
import ApiStatusBadge from "../components/ApiStatusBadge.jsx";
import WarmupBanner from "../components/WarmupBanner.jsx";
import { inferAcademicMeta, productPrice, trustOutOf5 } from "../lib/format.js";
import { ACADEMIC_YEARS, BRANCHES } from "../data/site.js";

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
  const [activeTab, setActiveTab] = useState("listings"); // "listings" | "wanted"
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [college, setCollege] = useState("All");
  const [branch, setBranch] = useState("All Branches");
  const [year, setYear] = useState("All Years");
  const [sortBy, setSortBy] = useState("featured");
  const [selected, setSelected] = useState(null);
  const warmup = useWarmup(loading);

  const usingDemo = !loading && !online && products.length === 0;
  const source = usingDemo ? demoListings : products;

  // Deep-link query listener: ?tab=wanted, ?wanted=, and ?item=<id-or-slug>
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);

    const tabParam = params.get("tab");
    const wantedParam = params.get("wanted");
    if (tabParam === "wanted" || wantedParam) {
      setActiveTab("wanted");
    }

    const itemParam = params.get("item");
    if (itemParam && source.length > 0) {
      const needle = decodeURIComponent(itemParam).trim().toLowerCase();
      const matched = source.find((p) => {
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
  }, [source]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const product of source) {
      if (product.category) set.add(product.category);
    }
    return ["All", ...[...set].sort()];
  }, [source]);

  const colleges = useMemo(() => {
    const set = new Set();
    for (const product of source) {
      if (product.college_name) set.add(product.college_name);
    }
    return ["All", ...[...set].sort()];
  }, [source]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = source.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (college !== "All" && product.college_name !== college) return false;

      // Academic Department & Year filtering with intelligent fallback
      const academic = inferAcademicMeta(product);
      if (branch !== "All Branches" && academic.branch !== branch) return false;
      if (year !== "All Years" && academic.academic_year !== year) return false;

      if (!needle) return true;
      const tagsStr = Array.isArray(product.ai_tags) ? product.ai_tags.join(" ") : "";
      const notesStr = product.ai_condition_notes || "";
      const collegeStr = product.college_name || "";
      const branchStr = academic.branch || "";
      const yearStr = academic.academic_year || "";
      const haystack = `${product.title} ${product.description ?? ""} ${
        product.category ?? ""
      } ${collegeStr} ${branchStr} ${yearStr} ${tagsStr} ${notesStr}`.toLowerCase();
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
  }, [source, query, category, college, branch, year, sortBy]);

  const hasFilters =
    query.trim() !== "" ||
    category !== "All" ||
    college !== "All" ||
    branch !== "All Branches" ||
    year !== "All Years" ||
    sortBy !== "featured";

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setCollege("All");
    setBranch("All Branches");
    setYear("All Years");
    setSortBy("featured");
  };

  return (
    <div className="page-in mx-auto w-full max-w-6xl px-5 pt-6 pb-12 sm:px-8 sm:pt-8">
      <header className="shrink-0">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <p className="eyebrow">Campus Commerce Hub</p>
            <h1 className="mt-2 text-3xl leading-tight sm:text-4xl">
              What students are trading right now
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Verified pre-owned textbooks, electronics, and hostel essentials
              with AI fair valuation, instant WhatsApp sharing, and request board.
            </p>
          </div>

          <ApiStatusBadge
            online={online}
            loading={loading}
            onRefresh={refresh}
            demo={usingDemo}
          />
        </div>

        {/* Primary View Switcher: Listings vs Want to Buy */}
        <div className="mx-auto mt-6 flex max-w-6xl items-center gap-2 border-b border-line pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition ${
              activeTab === "listings"
                ? "bg-ink text-paper shadow-xs"
                : "bg-sunken text-muted hover:text-ink hover:bg-line/50"
            }`}
          >
            <span>🛒 Browse Listings</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] tabular-nums font-semibold ${
                activeTab === "listings"
                  ? "bg-paper/20 text-paper"
                  : "bg-line text-ink-soft"
              }`}
            >
              {filtered.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wanted")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-medium transition ${
              activeTab === "wanted"
                ? "bg-ink text-paper shadow-xs"
                : "bg-sunken text-muted hover:text-ink hover:bg-line/50"
            }`}
          >
            <span>📢 Want to Buy Board</span>
            <span className="flex h-2 w-2 rounded-full bg-accent" />
          </button>
        </div>

        {/* Listings Search & Filters (Visible only in listings tab) */}
        {activeTab === "listings" && (
          <div className="mt-5 space-y-3">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative lg:w-72">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search — bose, calculus, drafter…"
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

              {/* Category Pills */}
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

              {/* College & Sort Selectors */}
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 pt-1 sm:pt-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  {colleges.length > 1 && (
                    <div className="flex items-center gap-1.5">
                      <span className="flex shrink-0 items-center gap-1 text-xs text-faint">
                        <GraduationCap className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                        Campus:
                      </span>
                      <select
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        aria-label="Filter by College"
                        className="h-8.5 max-w-[190px] truncate rounded-lg border border-line bg-card px-2.5 text-xs font-medium text-ink outline-none transition hover:border-line-strong focus:border-accent"
                      >
                        <option value="All">All Campuses</option>
                        {colleges
                          .filter((c) => c !== "All")
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    <span className="flex shrink-0 items-center gap-1 text-xs text-faint">
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
                </div>

                <p className="shrink-0 text-xs tabular-nums text-faint lg:pl-1">
                  {loading ? "Loading…" : `${filtered.length} of ${source.length}`}
                </p>
              </div>
            </div>

            {/* Department / Branch Pills */}
            <div className="mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto pb-1 scroll-slim">
              <span className="shrink-0 pr-1 text-xs text-faint">Dept:</span>
              {BRANCHES.map((b) => (
                <button
                  key={b}
                  type="button"
                  className="pill shrink-0 text-xs py-1 px-2.5"
                  data-active={branch === b}
                  aria-pressed={branch === b}
                  onClick={() => setBranch(b)}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Academic Year Pills */}
            <div className="mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto pb-1 scroll-slim">
              <span className="shrink-0 pr-1 text-xs text-faint">Year:</span>
              {ACADEMIC_YEARS.map((y) => (
                <button
                  key={y}
                  type="button"
                  className="pill shrink-0 text-xs py-1 px-2.5"
                  data-active={year === y}
                  aria-pressed={year === y}
                  onClick={() => setYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
        )}

        {usingDemo && (
          <p className="mx-auto mt-4 max-w-6xl rounded-xl border border-warn/25 bg-warn-soft px-4 py-3 text-[13px] leading-relaxed text-warn">
            Showing popular items while the marketplace reconnects. Tap refresh
            in a moment to see everything live on campus.
          </p>
        )}
      </header>

      {/* Main Content Area */}
      <div className="mt-6 w-full">
        <WarmupBanner show={warmup.show} elapsed={warmup.elapsed} className="mb-5" />

        {activeTab === "wanted" ? (
          <WantedBoard
            products={source}
            onSelectProduct={(p) => setSelected(p)}
          />
        ) : loading ? (
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
            <h2 className="mt-4 text-xl">Nothing matches that filter yet</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              {hasFilters
                ? "Try a different keyword or department, or clear filters."
                : "No listings are on the board right now."}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-secondary"
                >
                  Clear filters
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("wanted")}
                className="btn btn-primary gap-1.5"
              >
                <Sparkles className="h-4 w-4" />
                Post on Want to Buy Board
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id ?? product.title}
                  product={product}
                  onOpen={() => setSelected(product)}
                />
              ))}
            </div>

            {/* Want to Buy Callout footer banner */}
            <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-card p-6 sm:flex-row sm:p-7">
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-deep">
                  <Sparkles className="h-3.5 w-3.5" />
                  Looking for something specific?
                </span>
                <h3 className="mt-2 text-lg font-medium">
                  Can't find the textbook, drafter or gadget you need?
                </h3>
                <p className="mt-1 text-xs text-muted sm:text-sm">
                  Post on the Want to Buy Board. Seniors and hostel batchmates get notified and can sell directly to you.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("wanted");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="btn btn-primary shrink-0 gap-2 text-xs sm:text-sm"
              >
                Go to Want to Buy Board →
              </button>
            </div>
          </>
        )}
      </div>

      {selected && (
        <ProductDetailModal
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
