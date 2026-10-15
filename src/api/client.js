const EXPLICIT_BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = (EXPLICIT_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");
const NETWORK_ENABLED = Boolean(EXPLICIT_BASE) || import.meta.env.DEV;

const REQUEST_TIMEOUT_MS = 8000;

function requestSignal() {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
    return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  }
  return undefined;
}

export function getApiBaseUrl() {
  return NETWORK_ENABLED ? API_BASE : "";
}

export function apiConfigured() {
  return Boolean(EXPLICIT_BASE);
}

export async function checkApiHealth() {
  if (!NETWORK_ENABLED) return false;
  try {
    const response = await fetch(`${API_BASE}/`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: requestSignal(),
    });
    return response.ok;
  } catch {
    return false;
  }
}

function normalizeProduct(raw) {
  return {
    id: raw?.id ?? null,
    title: raw?.title ?? "",
    description: raw?.description ?? "",
    category: raw?.category ?? "",
    condition: raw?.condition ?? "",
    image_url: raw?.image_url ?? null,
    listed_price: raw?.listed_price ?? null,
    suggested_price: raw?.suggested_price ?? null,
    seller_trust_score: raw?.seller_trust_score ?? null,
    created_at: raw?.created_at ?? null,
  };
}

export async function fetchLiveProducts() {
  if (!NETWORK_ENABLED) {
    throw new Error("API base URL is not configured");
  }
  const response = await fetch(`${API_BASE}/products/`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: requestSignal(),
  });

  if (!response.ok) {
    throw new Error(`Products request failed with status ${response.status}`);
  }

  const data = await response.json();
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.products)
      ? data.products
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.results)
          ? data.results
          : [];

  return list.map(normalizeProduct);
}
