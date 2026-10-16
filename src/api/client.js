const EXPLICIT_BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = (EXPLICIT_BASE || "http://127.0.0.1:8000").replace(/\/+$/, "");
const NETWORK_ENABLED = Boolean(EXPLICIT_BASE) || import.meta.env.DEV;

/* Render's free tier sleeps after inactivity; waking it can take 45-90s.
   Requests wait up to 75s and retry transient network/5xx failures. */
const REQUEST_TIMEOUT_MS = 75000;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1200;

export class ApiError extends Error {
  constructor(message, { status = 0, body = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

function requestSignal(timeoutMs = REQUEST_TIMEOUT_MS) {
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
    return AbortSignal.timeout(timeoutMs);
  }
  return undefined;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, { retries = MAX_RETRIES, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_BASE_DELAY_MS * attempt);
    }

    let response;
    try {
      response = await fetch(url, { ...options, signal: requestSignal(timeoutMs) });
    } catch (networkError) {
      /* AbortError = timeout or offline; DNS/fetch failures also land here. */
      lastError = new ApiError(
        navigator?.onLine === false
          ? "You appear to be offline. Check your connection and try again."
          : "Could not reach the CampusMart server. It may still be waking up."
      );
      lastError.cause = networkError;
      continue;
    }

    if (RETRYABLE_STATUSES.has(response.status) && attempt < retries) {
      lastError = new ApiError(`Server returned ${response.status}. Retrying…`, {
        status: response.status,
      });
      continue;
    }

    return response;
  }

  throw lastError ?? new ApiError("Request failed after retries.");
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
    const response = await fetchWithRetry(
      `${API_BASE}/`,
      { method: "GET", headers: { Accept: "application/json" } },
      { retries: 1 }
    );
    return response.ok;
  } catch {
    return false;
  }
}

function normalizeImageUrls(raw) {
  const urls = Array.isArray(raw?.image_urls)
    ? raw.image_urls.filter((url) => typeof url === "string" && url.trim() !== "")
    : [];
  if (urls.length > 0) return urls.slice(0, 8);
  if (typeof raw?.image_url === "string" && raw.image_url.trim() !== "") {
    return [raw.image_url];
  }
  return [];
}

function normalizeTags(raw) {
  const tags = Array.isArray(raw?.ai_tags) ? raw.ai_tags : [];
  return tags
    .filter((tag) => typeof tag === "string" && tag.trim() !== "")
    .map((tag) => tag.trim())
    .slice(0, 12);
}

function normalizeProduct(raw) {
  return {
    id: raw?.id ?? null,
    title: raw?.title ?? "",
    description: raw?.description ?? "",
    category: raw?.category ?? "",
    condition: raw?.condition ?? "",
    image_url: raw?.image_url ?? null,
    image_urls: normalizeImageUrls(raw),
    ai_tags: normalizeTags(raw),
    ai_condition_notes:
      typeof raw?.ai_condition_notes === "string" ? raw.ai_condition_notes : null,
    seller_name:
      typeof raw?.seller_name === "string" && raw.seller_name.trim() !== ""
        ? raw.seller_name.trim()
        : null,
    listed_price: raw?.listed_price ?? null,
    suggested_price: raw?.suggested_price ?? null,
    seller_trust_score: raw?.seller_trust_score ?? null,
    created_at: raw?.created_at ?? null,
  };
}

export async function fetchLiveProducts() {
  if (!NETWORK_ENABLED) {
    throw new ApiError("API base URL is not configured");
  }
  const response = await fetchWithRetry(`${API_BASE}/products/`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(`Products request failed with status ${response.status}`, {
      status: response.status,
    });
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

const STAT_ENDPOINTS = ["/stats/", "/stats", "/metrics/"];

function pickCount(source, keys) {
  if (!source || typeof source !== "object") return null;
  for (const key of keys) {
    const value = Number(source[key]);
    if (Number.isFinite(value) && value >= 0) return Math.round(value);
  }
  return null;
}

async function fetchJson(path, options = {}) {
  const response = await fetchWithRetry(`${API_BASE}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    ...options,
  });
  if (!response.ok) throw new ApiError(`${path} -> ${response.status}`, { status: response.status });
  return response.json();
}

/* Optional counters used on the home page: active listings + students.
   Probed in parallel against a few likely endpoints; returns null when the
   backend does not expose stats, so callers can fall back gracefully. */
export async function fetchStats() {
  if (!NETWORK_ENABLED) return null;

  const results = await Promise.allSettled(
    STAT_ENDPOINTS.map((path) => fetchJson(path, { retries: 0 }))
  );

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    const payload = result.value;
    const bodies = [payload, payload?.data, payload?.stats].filter(Boolean);

    let listings = null;
    let students = null;
    for (const body of bodies) {
      listings ??= pickCount(body, [
        "listings",
        "active_listings",
        "products",
        "product_count",
        "total_products",
        "items",
      ]);
      students ??= pickCount(body, [
        "students",
        "verified_students",
        "users",
        "student_count",
        "total_students",
        "members",
      ]);
    }

    if (listings !== null || students !== null) return { listings, students };
  }

  return null;
}

/* ---------------------------- Auth ---------------------------- */

async function readBody(response) {
  const text = await response.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function messageFrom(body, fallback) {
  if (!body) return fallback;
  if (typeof body.detail === "string" && body.detail) return body.detail;
  if (Array.isArray(body.detail) && body.detail[0]?.msg) return body.detail[0].msg;
  if (typeof body.message === "string" && body.message) return body.message;
  if (typeof body.error === "string" && body.error) return body.error;
  return fallback;
}

async function postJson(path, payload, { retries = 1 } = {}) {
  if (!NETWORK_ENABLED) {
    throw new ApiError("The campus network is not configured for this build.");
  }

  let response;
  try {
    response = await fetchWithRetry(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }, { retries });
  } catch (error) {
    throw new ApiError(
      "Could not reach the CampusMart server — it may still be waking up. Try again in a moment.",
      { cause: error }
    );
  }

  const body = await readBody(response);

  if (!response.ok) {
    throw new ApiError(messageFrom(body, `Request failed (${response.status}).`), {
      status: response.status,
      body,
    });
  }

  return body ?? {};
}

export function pickToken(payload) {
  return (
    payload?.access_token ??
    payload?.token ??
    payload?.jwt ??
    payload?.data?.access_token ??
    payload?.data?.token ??
    null
  );
}

export function pickUser(payload, fallback = {}) {
  const source =
    payload?.user ?? payload?.data?.user ?? payload?.profile ?? payload?.data ?? null;

  if (source && typeof source === "object" && !Array.isArray(source)) {
    return {
      name:
        source.name ??
        source.full_name ??
        source.username ??
        fallback.name ??
        fallback.email ??
        "",
      email: source.email ?? fallback.email ?? "",
      id: source.id ?? source.user_id ?? null,
    };
  }

  return { name: fallback.name ?? "", email: fallback.email ?? "" };
}

export async function authLogin({ email, password }) {
  const body = await postJson("/auth/login", { email, password });
  return { token: pickToken(body), user: pickUser(body, { email }) };
}

export async function authSendOtp({ name, email, password }) {
  const body = await postJson("/auth/send-otp", { name, email, password });
  return body;
}

export async function authResendOtp({ email }) {
  const body = await postJson("/auth/resend-otp", { email });
  return body;
}

export async function authVerifyOtp({ email, otp }) {
  const body = await postJson("/auth/verify-otp", {
    email,
    otp_code: otp,
  });
  return { token: pickToken(body), user: pickUser(body, { email }) };
}

export async function authRegister({ name, email, password }) {
  const body = await postJson("/auth/register", { name, email, password });
  return { token: pickToken(body), user: pickUser(body, { email, name }) };
}
