import { useCallback, useEffect, useMemo, useState } from "react";
import { checkApiHealth, fetchLiveProducts, getApiBaseUrl } from "../api/client.js";
import { sandboxConditions } from "../data/sandbox.js";

const CONDITION_LABELS = Object.fromEntries(
  sandboxConditions.map((c) => [c.id, c.label])
);

let cachedProducts = null;
let inflight = null;

function syncWithBackend() {
  if (inflight) return inflight;
  inflight = (async () => {
    const healthy = await checkApiHealth();
    if (!healthy) return { products: cachedProducts ?? [], online: false };
    try {
      const products = await fetchLiveProducts();
      cachedProducts = products;
      return { products, online: true };
    } catch {
      return { products: cachedProducts ?? [], online: false };
    }
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export function mapProductToFeedItem(product) {
  const trust = Number(product.seller_trust_score);
  const hasTrust = Number.isFinite(trust);
  const price = Number(product.suggested_price ?? product.listed_price ?? 0) || 0;
  const title = product.title || "Untitled listing";

  return {
    id: `live-${product.id ?? Math.random().toString(36).slice(2)}`,
    source: "live",
    title,
    description: product.description ?? "",
    category: product.category || "Academic Material",
    condition: product.condition ?? "",
    conditionLabel: CONDITION_LABELS[product.condition] ?? product.condition ?? "—",
    suggestedPrice: price,
    listedPrice: product.listed_price ?? null,
    confidence: hasTrust
      ? Math.min(1, Math.max(0, trust <= 5 ? trust / 5 : trust / 100))
      : null,
    sellerTrustScore: hasTrust ? trust : null,
    clearance: "CLEARED",
    clearanceNote: "Verified listing from your campus.",
    flaggedTerms: [],
    verified: true,
    thumbnail: product.image_url || null,
    seedTag: title.slice(0, 4).toUpperCase(),
    createdAt: product.created_at ?? null,
  };
}

export function useLiveFeed() {
  const [products, setProducts] = useState(() => cachedProducts ?? []);
  const [online, setOnline] = useState(() => cachedProducts !== null);
  const [loading, setLoading] = useState(() => cachedProducts === null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await syncWithBackend();
    setProducts(result.products);
    setOnline(result.online);
    setLoading(false);
    return result;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const feedItems = useMemo(
    () => products.map(mapProductToFeedItem),
    [products]
  );

  return {
    products,
    feedItems,
    online,
    loading,
    refresh,
    apiUrl: getApiBaseUrl(),
  };
}
