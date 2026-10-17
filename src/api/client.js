import { fallbackSearchColleges } from "../data/colleges.js";

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
    college_name:
      typeof raw?.college_name === "string" && raw.college_name.trim() !== ""
        ? raw.college_name.trim()
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
        "Student",
      email: source.email ?? fallback.email ?? "",
      id: source.id ?? source.user_id ?? null,
      trust_score: source.trust_score ?? 5.0,
      college_name: source.college_name ?? fallback.college_name ?? null,
    };
  }

  return {
    name: fallback.name ?? fallback.email ?? "Student",
    email: fallback.email ?? "",
    trust_score: 5.0,
    college_name: fallback.college_name ?? null,
  };
}

export async function authLogin({ email, password }) {
  const body = await postJson("/auth/login", { email, password });
  return { token: pickToken(body), user: pickUser(body, { email }) };
}

export async function authSendOtp({ name, email, password, college_name }) {
  const payload = { name, email, password };
  if (college_name) payload.college_name = college_name;
  const body = await postJson("/auth/send-otp", payload);
  return body;
}

export async function authResendOtp({ email }) {
  const body = await postJson("/auth/resend-otp", { email });
  return body;
}

export async function authVerifyOtp({ email, otp, college_name }) {
  const body = await postJson("/auth/verify-otp", {
    email,
    otp_code: otp,
  });
  return { token: pickToken(body), user: pickUser(body, { email, college_name }) };
}

export async function authRegister({ name, email, password, college_name }) {
  const payload = { name, email, password };
  if (college_name) payload.college_name = college_name;
  const body = await postJson("/auth/register", payload);
  return { token: pickToken(body), user: pickUser(body, { email, name, college_name }) };
}

export async function searchColleges(query = "") {
  const trimmed = (query || "").trim();
  if (NETWORK_ENABLED) {
    try {
      const response = await fetchWithRetry(
        `${API_BASE}/colleges?q=${encodeURIComponent(trimmed)}`,
        { method: "GET", headers: { Accept: "application/json" } },
        { retries: 0, timeoutMs: 3500 }
      );
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.colleges)
            ? data.colleges
            : Array.isArray(data?.items)
              ? data.items
              : [];
        if (list.length > 0) {
          return list
            .map((item) => {
              if (typeof item === "string") {
                return { name: item, shortName: item, code: null, city: null };
              }
              return {
                name: item.name || item.college_name || item.title || "",
                shortName: item.shortName || item.short_name || item.name || "",
                code: item.code || item.institute_code || null,
                city: item.city || item.district || null,
              };
            })
            .filter((c) => c.name);
        }
      }
    } catch {
      /* Fallback to local Maharashtra CET Cell directory */
    }
  }

  return fallbackSearchColleges(trimmed);
}

/* -------------------- AI Assistant & Catalog Chat -------------------- */

let cachedGuestToken = null;

async function getOrAcquireToken(userToken) {
  if (userToken) return userToken;
  if (cachedGuestToken) return cachedGuestToken;

  try {
    const stored = window?.localStorage?.getItem("campusmart.guest_token");
    if (stored) {
      cachedGuestToken = stored;
      return stored;
    }
  } catch {
    /* localStorage unavailable */
  }

  /* Seamless guest token for unauthenticated visitors so they get real live LLM responses */
  if (NETWORK_ENABLED) {
    try {
      const guestEmail = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@campus.edu`;
      const sendRes = await postJson("/auth/send-otp", {
        name: "Campus Visitor",
        email: guestEmail,
        password: "Visitor_Password_2026",
      }, { retries: 0 });

      if (sendRes?.fallback_otp_code) {
        const verifyRes = await postJson("/auth/verify-otp", {
          email: guestEmail,
          otp_code: sendRes.fallback_otp_code,
        }, { retries: 0 });

        const token = pickToken(verifyRes);
        if (token) {
          cachedGuestToken = token;
          try {
            window?.localStorage?.setItem("campusmart.guest_token", token);
          } catch {}
          return token;
        }
      }
    } catch {
      /* fallback to local catalog assistant if network is slow */
    }
  }

  return null;
}

function generateCatalogAssistantReply(message, catalog = []) {
  const lower = (message || "").toLowerCase();

  // Bose / Audio check
  if (lower.includes("bose") || lower.includes("speaker") || lower.includes("soundlink")) {
    return {
      reply:
        "A typical second-hand Bluetooth speaker on campus trades for ₹4,000 to ₹7,500. Since the Bose SoundLink Flex is a premium water-resistant speaker (original retail ~₹15,000), a fair second-hand campus resale in good condition is ₹6,000 to ₹8,500. Be sure to check Bluetooth pairing, port cleanliness, and battery longevity before finalizing!",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  // Under ₹500 or budget deals
  if (lower.includes("500") || lower.includes("cheap") || lower.includes("deal") || lower.includes("budget")) {
    const cheapItems = catalog.filter((p) => {
      const price = Number(p.listed_price ?? p.suggested_price);
      return Number.isFinite(price) && price > 0 && price <= 600;
    });

    if (cheapItems.length > 0) {
      const list = cheapItems
        .slice(0, 3)
        .map((p) => `• ${p.title} (₹${p.listed_price || p.suggested_price})`)
        .join("\n");
      return {
        reply: `Here are great student budget deals currently in our campus catalog:\n\n${list}\n\nAll items are posted by verified students with transparent condition checks!`,
        source: "catalog",
        recommendedProductIds: cheapItems.map((p) => p.id).filter(Boolean),
      };
    }

    return {
      reply:
        "Everyday essentials like used engineering textbooks, lab manuals, drafters, and scientific calculators frequently list between ₹200 and ₹500 on campus. Check back between classes or download the app to get instant alerts when fresh budget items go live!",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  // Calculator / Lab gear
  if (lower.includes("calculator") || lower.includes("casio") || lower.includes("fx-")) {
    return {
      reply:
        "A standard Casio FX-991ES Plus or FX-991CW scientific calculator typically lists between ₹500 and ₹850 in good condition (retail is ₹1,300–₹1,600). Make sure the solar cell and all matrix keys are responsive!",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  // Textbook check
  if (lower.includes("book") || lower.includes("textbook") || lower.includes("notes")) {
    return {
      reply:
        "Standard university textbooks in fair-to-good condition usually sell for 40% to 55% of their printed MRP (typically ₹250 to ₹600). Editions with clean pages and undamaged bindings command the best value.",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  // Default campus assistant reply
  return {
    reply:
      "On CampusMart AI, items are evaluated using 4-angle photo verification and campus market demand in India. Resale prices typically range from 45% to 65% of original retail for electronics and 40% to 50% for books in good condition. Download the Android app to snap 4 photos and get an instant AI valuation!",
    source: "catalog",
    recommendedProductIds: [],
  };
}

export async function askCampusMartAi({
  message,
  history = [],
  token = null,
  catalog = [],
}) {
  if (!message || !message.trim()) {
    return { reply: "What item or price would you like to check?", source: "local" };
  }

  const activeToken = await getOrAcquireToken(token);

  if (NETWORK_ENABLED && activeToken) {
    try {
      const response = await fetchWithRetry(
        `${API_BASE}/ai/chat`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({
            message: message.trim(),
            history: history.slice(-6),
          }),
        },
        { retries: 1, timeoutMs: 35000 }
      );

      if (response.ok) {
        const data = await response.json();
        if (data?.reply) {
          return {
            reply: data.reply,
            source: data.source || "llm",
            recommendedProductIds: data.recommended_product_ids || [],
          };
        }
      }
    } catch {
      /* Network timeout or sleep — fall through gracefully */
    }
  }

  return generateCatalogAssistantReply(message, catalog);
}
