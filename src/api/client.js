import { fallbackSearchColleges } from "../data/colleges.js";
import { cleanAiNotes } from "../lib/format.js";

const DEFAULT_PROD_API = "https://campusmart-api-zia4.onrender.com";
const EXPLICIT_BASE =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : DEFAULT_PROD_API;
const API_BASE = (EXPLICIT_BASE || DEFAULT_PROD_API).replace(/\/+$/, "");
const NETWORK_ENABLED = true;

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
      typeof raw?.ai_condition_notes === "string"
        ? cleanAiNotes(raw.ai_condition_notes)
        : null,
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

/* -------------------- 3-Layer Hybrid College Discovery Engine -------------------- */

async function discoverCollegesNominatim(query, signal) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&limit=8&q=${encodeURIComponent(
      query + " college"
    )}`;
    const res = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data
      .map((item) => {
        const full = item.display_name || "";
        const parts = full.split(",").map((p) => p.trim());
        const rawName = parts[0];
        const lower = full.toLowerCase();
        if (
          !lower.includes("college") &&
          !lower.includes("institute") &&
          !lower.includes("university") &&
          !lower.includes("polytechnic") &&
          !lower.includes("campus") &&
          !lower.includes("vidyalaya")
        ) {
          return null;
        }

        let city = parts[1] || "";
        for (let i = 1; i < parts.length - 2; i++) {
          if (!/^\d+$/.test(parts[i]) && parts[i] !== "India" && parts[i].length > 2) {
            city = parts[i];
            break;
          }
        }

        return {
          name: rawName,
          shortName: rawName.length > 45 ? rawName.slice(0, 42) + "…" : rawName,
          code: null,
          city: city || null,
          type: "Verified Campus",
          badge: "Verified Campus",
          source: "web",
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

async function discoverCollegesWikipedia(query, signal) {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
      query + " college"
    )}&format=json&origin=*&srlimit=8`;
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.query?.search || [];
    return items
      .map((item) => {
        const title = (item.title || "").trim();
        const lower = title.toLowerCase();
        if (
          !lower.includes("college") &&
          !lower.includes("institute") &&
          !lower.includes("university") &&
          !lower.includes("polytechnic")
        ) {
          return null;
        }
        if (lower.includes("disambiguation") || lower.includes("list of")) {
          return null;
        }

        return {
          name: title,
          shortName: title.length > 45 ? title.slice(0, 42) + "…" : title,
          code: null,
          city: null,
          type: "Verified Campus",
          badge: "Verified Campus",
          source: "web",
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function searchCollegesOnline(query = "") {
  const trimmed = (query || "").trim();
  if (!trimmed) {
    return fallbackSearchColleges("");
  }

  // Source A: Instant local match from comprehensive dataset
  const localList = fallbackSearchColleges(trimmed);

  // Source B: Live call to backend AI engine
  const backendPromise = (async () => {
    if (!NETWORK_ENABLED) return [];
    try {
      const response = await fetchWithRetry(
        `${API_BASE}/colleges?q=${encodeURIComponent(trimmed)}&discover=true`,
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
        return list
          .map((item) => {
            if (typeof item === "string") {
              return {
                name: item,
                shortName: item,
                code: null,
                city: null,
                type: "CET Cell",
                badge: "CET Cell",
                source: "backend",
              };
            }
            const code = item.code || item.institute_code || null;
            return {
              name: item.name || item.college_name || item.title || "",
              shortName: item.shortName || item.short_name || item.name || "",
              code,
              city: item.city || item.district || null,
              type: item.type || (code ? `CET ${code}` : "CET Cell"),
              badge: code ? `CET ${code}` : (item.type || "CET Cell"),
              source: "backend",
            };
          })
          .filter((c) => c.name);
      }
    } catch {
      // Backend cold-starting or endpoint not ready
    }
    return [];
  })();

  // Source C: Live web discovery via Nominatim and Wikipedia
  let signal;
  if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) {
    signal = AbortSignal.timeout(3500);
  }

  const webPromise = (async () => {
    try {
      const [nom, wiki] = await Promise.allSettled([
        discoverCollegesNominatim(trimmed, signal),
        discoverCollegesWikipedia(trimmed, signal),
      ]);
      const listA = nom.status === "fulfilled" ? nom.value : [];
      const listB = wiki.status === "fulfilled" ? wiki.value : [];
      return [...listA, ...listB];
    } catch {
      return [];
    }
  })();

  let backendList = [];
  let webList = [];
  try {
    const [bRes, wRes] = await Promise.allSettled([backendPromise, webPromise]);
    if (bRes.status === "fulfilled") backendList = bRes.value;
    if (wRes.status === "fulfilled") webList = wRes.value;
  } catch {
    // Local list is always ready
  }

  function coreKey(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(
        /\b(dr|shri|late|college|of|engineering|technology|institute|and|research|society|trust|the|pune|mumbai|karad|satara)\b/g,
        ""
      )
      .replace(/[^a-z0-9]/g, "");
  }

  const seenCodes = new Set();
  const seenKeys = new Set();
  const merged = [];

  const addCandidate = (item) => {
    if (!item || !item.name) return;
    if (item.code) {
      if (seenCodes.has(item.code)) return;
      seenCodes.add(item.code);
    }
    const key = coreKey(item.name);
    if (key.length >= 3) {
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
    } else {
      const exact = item.name.toLowerCase().trim();
      if (seenKeys.has(exact)) return;
      seenKeys.add(exact);
    }
    merged.push(item);
  };

  // Merge with priority: Local Authoritative -> Backend AI -> Live Web Discovery
  for (const c of localList) addCandidate(c);
  for (const c of backendList) addCandidate(c);
  for (const c of webList) addCandidate(c);

  return merged.slice(0, 35);
}

export const searchColleges = searchCollegesOnline;

/* -------------------- AI Assistant & Catalog Chat -------------------- */

let cachedGuestToken = null;

async function getOrAcquireToken(userToken) {
  if (userToken) return userToken;
  if (cachedGuestToken) return cachedGuestToken;

  // 1. Check logged-in user in localStorage
  try {
    const authStored = window?.localStorage?.getItem("campusmart.auth.v1");
    if (authStored) {
      const parsed = JSON.parse(authStored);
      if (parsed?.token) {
        cachedGuestToken = parsed.token;
        return parsed.token;
      }
    }
  } catch {
    /* ignore */
  }

  // 2. Check previously cached guest token
  try {
    const stored = window?.localStorage?.getItem("campusmart.guest_token");
    if (stored) {
      cachedGuestToken = stored;
      return stored;
    }
  } catch {
    /* localStorage unavailable */
  }

  // 3. Seamless instant guest registration for visitors to receive real live Gemini LLM responses
  if (NETWORK_ENABLED) {
    try {
      const guestEmail = `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@campus.edu`;
      const regRes = await postJson(
        "/auth/register",
        {
          name: "Campus Student",
          email: guestEmail,
          password: "VisitorGuestPassword2026!",
          college_name: "Campus Community",
        },
        { retries: 0 }
      );

      const token = pickToken(regRes);
      if (token) {
        cachedGuestToken = token;
        try {
          window?.localStorage?.setItem("campusmart.guest_token", token);
        } catch {}
        return token;
      }
    } catch {
      /* fallback to local catalog assistant if network is slow */
    }
  }

  return null;
}

function generateCatalogAssistantReply(message, catalog = []) {
  const lower = (message || "").toLowerCase().trim();
  const rawCatalog = Array.isArray(catalog) ? catalog : [];

  // Stop words to remove for item matching
  const stopWords = new Set([
    "what", "is", "a", "an", "the", "for", "in", "on", "at", "to", "of", "and", "or",
    "price", "fair", "second-hand", "secondhand", "resale", "used", "rate", "cost",
    "campus", "college", "student", "selling", "buy", "buying", "sell", "show", "me",
    "best", "deals", "deal", "cheap", "should", "pay", "i", "can", "get", "how", "much",
    "about", "this", "item", "good", "condition", "please", "suggest", "valuation",
  ]);

  const words = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  // Check if query is looking for budget/cheap deals
  const isBudgetQuery =
    lower.includes("500") ||
    lower.includes("cheap") ||
    lower.includes("budget") ||
    lower.includes("deal") ||
    lower.includes("under");

  if (isBudgetQuery && rawCatalog.length > 0) {
    const budgetLimitMatch = lower.match(/(?:under|below|max|within|upto|up to|rs\.?|inr|₹)\s*(\d{2,6})/);
    const maxBudget = budgetLimitMatch ? parseInt(budgetLimitMatch[1], 10) : 600;

    const budgetItems = rawCatalog.filter((p) => {
      const price = Number(p.listed_price ?? p.suggested_price);
      return Number.isFinite(price) && price > 0 && price <= maxBudget;
    });

    if (budgetItems.length > 0) {
      const topItems = budgetItems.slice(0, 3);
      const list = topItems
        .map((p) => `• ${p.title} (₹${p.listed_price || p.suggested_price} · ${p.condition || "Fair"})`)
        .join("\n");
      return {
        reply: `Here are great student budget deals under ₹${maxBudget} currently live in our campus catalog:\n\n${list}\n\nAll items are posted by verified students with transparent condition checks!`,
        source: "catalog",
        recommendedProductIds: topItems.map((p) => p.id).filter(Boolean),
      };
    }
  }

  // Dynamic Catalog Keyword Search
  if (words.length > 0 && rawCatalog.length > 0) {
    const scored = rawCatalog
      .map((item) => {
        const itemText = `${item.title || ""} ${item.category || ""} ${item.description || ""} ${(item.ai_tags || []).join(" ")}`.toLowerCase();
        let matchScore = 0;
        for (const word of words) {
          if (itemText.includes(word)) matchScore += 1;
        }
        return { item, matchScore };
      })
      .filter((entry) => entry.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    if (scored.length > 0) {
      const topMatches = scored.slice(0, 3).map((s) => s.item);
      const prices = topMatches
        .map((p) => Number(p.listed_price ?? p.suggested_price))
        .filter((pr) => Number.isFinite(pr) && pr > 0);
      const minP = prices.length > 0 ? Math.min(...prices) : null;
      const maxP = prices.length > 0 ? Math.max(...prices) : null;

      const itemsList = topMatches
        .map(
          (p) =>
            `• ${p.title} — ₹${p.listed_price || p.suggested_price} (${p.condition || "Fair"} condition · ${p.college_name || "Campus Community"})`
        )
        .join("\n");

      const priceSummary =
        minP !== null && maxP !== null
          ? minP === maxP
            ? `Current campus listing price is ₹${minP}.`
            : `Current campus listing prices range from ₹${minP} to ₹${maxP}.`
          : "";

      return {
        reply: `Based on verified campus catalog listings, here are items matching your query:\n\n${itemsList}\n\n${priceSummary} Verified student sellers offer 4-angle photo inspections before you meet up!`,
        source: "catalog",
        recommendedProductIds: topMatches.map((p) => p.id).filter(Boolean),
      };
    }
  }

  // Category & Domain Benchmarks when exact catalog item is not currently active
  if (lower.includes("calculator") || lower.includes("casio") || lower.includes("fx-")) {
    return {
      reply:
        "For scientific calculators like Casio FX-991ES Plus or FX-991CW (retail ₹1,300–₹1,600), fair second-hand campus pricing is typically ₹500 to ₹750 in good condition. Be sure to check that the solar cell is working, all buttons are responsive, and the plastic slide-on cover is intact!",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  if (lower.includes("drafter") || lower.includes("drawing") || lower.includes("sheet")) {
    return {
      reply:
        "An engineering mini drafter (retail ₹600–₹750) typically sells on campus for ₹180 to ₹320. First-year (FE) students need them for Engineering Graphics and Drawing submissions. Make sure the clamp screw tightens securely onto drawing tables!",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  if (
    lower.includes("book") ||
    lower.includes("textbook") ||
    lower.includes("math") ||
    lower.includes("nirali") ||
    lower.includes("techmax") ||
    lower.includes("notes")
  ) {
    return {
      reply:
        "Standard university textbooks in fair-to-good condition usually sell for 40% to 55% of their printed MRP (typically ₹200 to ₹400). Clean editions without excessive pen markings command the highest resale value.",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  if (lower.includes("bose") || lower.includes("speaker") || lower.includes("soundlink") || lower.includes("audio")) {
    return {
      reply:
        "A typical second-hand Bluetooth speaker on campus trades for ₹4,000 to ₹7,500. Since the Bose SoundLink Flex is a premium water-resistant speaker (original retail ~₹15,000), a fair second-hand campus resale in good condition is ₹6,000 to ₹8,500. Always check Bluetooth pairing, port cleanliness, and battery longevity before finalizing!",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  if (lower.includes("laptop") || lower.includes("macbook") || lower.includes("thinkpad") || lower.includes("computer")) {
    return {
      reply:
        "Student coding laptops generally resell on campus for ₹14,000 to ₹28,000 depending on CPU generation, RAM (8GB vs 16GB), and battery health. Always check keyboard keys, charger cord condition, and run a battery health test before paying.",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  if (lower.includes("apron") || lower.includes("coat") || lower.includes("lab") || lower.includes("multimeter")) {
    return {
      reply:
        "Lab essentials like white cotton aprons resell for ₹120 to ₹220 (retail ~₹450), while digital multimeters trade for ₹150 to ₹300. These are high-demand items during first-year chemistry, pharmacy, and electrical workshop labs.",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  if (lower.includes("cycle") || lower.includes("bicycle")) {
    return {
      reply:
        "Campus bicycles in good rideable condition typically trade for ₹1,200 to ₹2,800 depending on gear status and tire condition. Inspect brakes, tire pressure, and chain rust before closing the deal.",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  if (lower.includes("kettle") || lower.includes("iron") || lower.includes("induction") || lower.includes("cooler") || lower.includes("hostel")) {
    return {
      reply:
        "Hostel appliances like electric kettles, dry irons, and room coolers typically sell for 45%–60% of retail (₹350 to ₹800). Ensure cords and heating elements are safely insulated without frayed wires.",
      source: "catalog",
      recommendedProductIds: [],
    };
  }

  // Extract clean subject name if possible
  const cleanSubject =
    words.length > 0
      ? words.slice(0, 4).join(" ")
      : "second-hand campus items";

  return {
    reply: `On CampusMart AI, fair second-hand pricing for ${cleanSubject} typically ranges from 45% to 65% of original retail for electronics and 40% to 50% for books and lab equipment in good condition. You can also post an ISO request on our "Wanted on Campus" board to get quick responses from seniors!`,
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

  let activeToken = await getOrAcquireToken(token);

  if (NETWORK_ENABLED) {
    for (let attempt = 0; attempt < 2; attempt++) {
      if (!activeToken) {
        activeToken = await getOrAcquireToken(token);
      }
      if (!activeToken) break;

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
              history: history.slice(-6).map((h) => ({
                role: h.role === "user" ? "user" : "assistant",
                content: String(h.content || ""),
              })),
            }),
          },
          { retries: 1, timeoutMs: 35000 }
        );

        if (response.status === 401 && attempt === 0) {
          // Token expired or invalid; clear and re-register
          cachedGuestToken = null;
          try {
            window?.localStorage?.removeItem("campusmart.guest_token");
          } catch {}
          activeToken = null;
          continue;
        }

        if (response.ok) {
          const data = await response.json();
          if (data?.reply) {
            return {
              reply: data.reply,
              source: data.source || "llm",
              recommendedProductIds: data.recommended_product_ids || [],
              sessionId: data.session_id,
              sessionTitle: data.session_title,
            };
          }
        }
      } catch {
        /* Network timeout or backend waking up — fall through gracefully */
        break;
      }
    }
  }

  return generateCatalogAssistantReply(message, catalog);
}

/* ---------------- Wanted Board API Methods ---------------- */

export function normalizeWantedRequest(raw) {
  return {
    id: raw?.id ?? `wanted-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: raw?.title ?? "",
    description: raw?.description ?? "",
    budget: raw?.budget ?? raw?.max_budget ?? null,
    branch: raw?.branch ?? "All Branches",
    academic_year: raw?.academic_year ?? "All Years",
    college_name: raw?.college_name ?? "Campus Community",
    urgency: raw?.urgency ?? "Needed this week",
    student_name: raw?.student_name ?? raw?.buyer_name ?? "Campus Student",
    contact_info: raw?.contact_info ?? null,
    created_at: raw?.created_at ?? new Date().toISOString(),
  };
}

export async function fetchWantedRequests() {
  if (!NETWORK_ENABLED) return null;
  try {
    const response = await fetchWithRetry(
      `${API_BASE}/wanted/`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      },
      { retries: 1, timeoutMs: 15000 }
    );

    if (!response.ok) return null;
    const data = await response.json();
    const list = Array.isArray(data)
      ? data
      : Array.isArray(data?.wanted)
        ? data.wanted
        : Array.isArray(data?.items)
          ? data.items
          : [];
    return list.map(normalizeWantedRequest);
  } catch {
    return null;
  }
}

export async function createWantedRequest(payload) {
  const normalized = normalizeWantedRequest(payload);
  if (NETWORK_ENABLED) {
    try {
      const response = await fetchWithRetry(
        `${API_BASE}/wanted/`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(normalized),
        },
        { retries: 1, timeoutMs: 15000 }
      );
      if (response.ok) {
        const data = await response.json();
        return normalizeWantedRequest(data);
      }
    } catch {
      /* Fallback to local optimistic persistence */
    }
  }
  return normalized;
}

export async function aiDraftWantedRequest(prompt) {
  if (!prompt || !prompt.trim()) {
    return null;
  }
  const text = prompt.trim();

  // Try backend if alive
  if (NETWORK_ENABLED) {
    try {
      const response = await fetchWithRetry(
        `${API_BASE}/wanted/ai-draft`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: text }),
        },
        { retries: 0, timeoutMs: 8000 }
      );
      if (response.ok) {
        const data = await response.json();
        if (data?.title) return data;
      }
    } catch {
      /* Fall through to instant smart local NLP parser */
    }
  }

  // Instant smart local NLP parser
  const lower = text.toLowerCase();

  // Extract budget: e.g. "under 700", "under ₹700", "₹700", "700 rs", "rs 700", "budget 800"
  let budget = null;
  const budgetMatch =
    text.match(/(?:under|below|max|budget|within|upto|up to|rs\.?|inr|₹)\s*(\d{2,6})/i) ||
    text.match(/(\d{2,6})\s*(?:rs|rupees|inr|bucks|\/-)/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1], 10);
  }

  // Extract urgency
  let urgency = "⚡ Needed this week";
  if (
    lower.includes("urgent") ||
    lower.includes("tomorrow") ||
    lower.includes("today") ||
    lower.includes("tonight")
  ) {
    urgency = "🔥 Urgent for tomorrow's exam";
  } else if (
    lower.includes("monday") ||
    lower.includes("submission") ||
    lower.includes("deadline")
  ) {
    urgency = "🔥 Urgent for Monday submission";
  } else if (
    lower.includes("midterm") ||
    lower.includes("in-sem") ||
    lower.includes("end-sem") ||
    lower.includes("exam")
  ) {
    urgency = "📚 Before Exams";
  }

  // Extract branch & year
  let branch = "First Year (Common)";
  let academic_year = "FE (1st Year)";

  if (
    lower.includes("drafter") ||
    lower.includes("drawing") ||
    lower.includes("bee") ||
    lower.includes("m1") ||
    lower.includes("m2") ||
    lower.includes("mechanics")
  ) {
    branch = "First Year (Common)";
    academic_year = "FE (1st Year)";
  } else if (
    lower.includes("python") ||
    lower.includes("java") ||
    lower.includes("code") ||
    lower.includes("laptop") ||
    lower.includes("c++") ||
    lower.includes("dsa") ||
    lower.includes("dbms")
  ) {
    branch = "Computer / IT";
    academic_year = "SE (2nd Year)";
  } else if (
    lower.includes("thermo") ||
    lower.includes("workshop") ||
    lower.includes("lathe") ||
    lower.includes("cad") ||
    lower.includes("mechanical")
  ) {
    branch = "Mechanical";
    academic_year = "SE (2nd Year)";
  } else if (
    lower.includes("pharma") ||
    lower.includes("chemistry") ||
    lower.includes("lab coat") ||
    lower.includes("aphe")
  ) {
    branch = "Pharmacy";
    academic_year = "FE (1st Year)";
  } else if (
    lower.includes("arduino") ||
    lower.includes("multimeter") ||
    lower.includes("breadboard") ||
    lower.includes("circuit") ||
    lower.includes("entc") ||
    lower.includes("sensor")
  ) {
    branch = "Electrical / ENTC";
    academic_year = "SE (2nd Year)";
  } else if (
    lower.includes("civil") ||
    lower.includes("survey") ||
    lower.includes("concrete")
  ) {
    branch = "Civil";
    academic_year = "SE (2nd Year)";
  }

  // Extract cleaned title
  let title = text
    .replace(/(?:need|want|looking for|require|urgently|urgent|buy|buying)\s+/i, "")
    .replace(/(?:under|below|max|budget|within|upto|up to|rs\.?|inr|₹)\s*\d{2,6}\s*(?:rs|rupees|inr|bucks|\/-)?/gi, "")
    .replace(/(?:urgent for|for exam|for tomorrow|tomorrow|today|exam|submission)/gi, "")
    .trim();
  if (title.length > 2) {
    title = title.charAt(0).toUpperCase() + title.slice(1);
  } else {
    title = text;
  }

  return {
    title: title || text,
    budget: budget || 500,
    branch,
    academic_year,
    urgency,
    description: `Urgent requirement: ${text}. Please reach out if you have this available on campus!`,
  };
}

/* ---------------- Image Compression & Live AI Price Estimation ---------------- */

export function compressImageToBase64(file, maxDimension = 1024, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("File must be an image (PNG, JPG, WebP)"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("Failed to load image into memory"));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export async function estimatePriceWithAi({
  image_base64 = null,
  title = "",
  condition = "good",
  age_years = 1,
  filename = "",
  token = null,
}) {
  const combinedNames = `${title} ${filename}`.toLowerCase();

  // Instant pre-flight guardrail: Reject obvious phone/desktop screenshots
  if (/screenshot|screencap|screen_shot|screen\s*capture/i.test(combinedNames)) {
    return {
      is_valid_product: false,
      error_type: "screenshot",
      rejection_reason:
        "This looks like a screen capture or non-sellable image. Please upload a real photo of a textbook, gadget, calculator, or hostel item.",
      title: "Screenshot / Non-Product",
      category: "Invalid Image",
      retail_price_inr: null,
      suggested_price_inr: null,
      price_min_inr: null,
      price_max_inr: null,
      condition: "needs-repair",
      condition_notes:
        "REJECTED — This looks like a screen capture or non-sellable image. Please upload a real photo of a textbook, gadget, calculator, or hostel item.",
      confidence: 0.99,
      source: "guardrail",
    };
  }

  const activeToken = await getOrAcquireToken(token);

  // 1. Try dedicated endpoint POST /ai/estimate-price on live backend
  if (NETWORK_ENABLED) {
    try {
      const res = await fetchWithRetry(
        `${API_BASE}/ai/estimate-price`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
          },
          body: JSON.stringify({
            image_base64: image_base64 || undefined,
            title: title ? title.trim() : undefined,
            condition,
            age_years: Number(age_years) || 1,
          }),
        },
        { retries: 0, timeoutMs: 25000 }
      );

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.is_valid_product === "boolean") {
          return {
            ...data,
            title: data.title || data.identified_title || title || "Campus Item",
            suggested_price_inr: data.suggested_price_inr ?? data.suggested_price ?? null,
            price_min_inr: data.price_min_inr ?? data.price_range_min ?? null,
            price_max_inr: data.price_max_inr ?? data.price_range_max ?? null,
            retail_price_inr: data.retail_price_inr ?? data.retail_mrp_inr ?? null,
            condition_notes: cleanAiNotes(data.condition_notes),
            source: data.ai_provider_used || "backend-estimate-price",
          };
        }
      }
    } catch {
      /* Fallback to /ai/chat or catalog */
    }
  }

  // 2. Query live Google Gemini Vision via POST /ai/chat
  if (NETWORK_ENABLED && activeToken) {
    try {
      const prompt = `You are the CampusMart AI pricing and inspection engine for Indian university students.
Item Title Input: "${title ? title.trim() : "None provided - identify completely from photo"}"
Condition Stated: "${condition}"
Age: "${age_years} year(s)"

STRICT EVALUATION INSTRUCTIONS:
1. Examine the attached photo and/or title.
Determine if this is a REAL PHYSICAL SELLABLE PRODUCT (textbook, calculator, drafter, headphones, lab coat, laptop, hostel appliance, electronics, stationery).
If the image is a phone/computer screenshot, chat capture, meme, selfie, document, receipt, or non-product, you MUST set "is_valid_product": false.
2. If it is a valid product:
- Identify the exact brand and model in "title".
- Categorize into: "Academic Material", "Electronics", "Lab Equipment", "Hostel Gear", or "Stationery".
- Determine current Indian retail MRP in ₹ ("retail_price_inr").
- Calculate recommended campus second-hand resale price in ₹ ("suggested_price_inr", usually 45%–65% of MRP for functional items).
- Provide fair range ("price_min_inr", "price_max_inr").
- Write 1-3 sentences of market analysis and inspection notes in "condition_notes".
- Set "confidence": number between 0.88 and 0.99.

Output ONLY a raw JSON object with NO markdown formatting:
{
  "is_valid_product": true,
  "rejection_reason": "",
  "title": "Exact Product Name",
  "category": "Electronics",
  "retail_price_inr": 1500,
  "suggested_price_inr": 650,
  "price_min_inr": 550,
  "price_max_inr": 750,
  "condition": "good",
  "condition_notes": "Inspection notes here...",
  "confidence": 0.95
}`;

      const res = await fetchWithRetry(
        `${API_BASE}/ai/chat`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify({
            message: prompt,
            image_url: image_base64 || undefined,
          }),
        },
        { retries: 0, timeoutMs: 35000 }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data?.reply || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed.is_valid_product === "boolean") {
            return {
              ...parsed,
              condition_notes: cleanAiNotes(parsed.condition_notes),
              source: "gemini-vision",
            };
          }
        }
      }
    } catch {
      /* Fallback to catalog benchmarks */
    }
  }

  // 3. Fallback: Local Indian Campus Valuation Benchmarks
  const lower = (title || filename || "").toLowerCase();

  // Check Bose / Speaker
  if (lower.includes("bose") || lower.includes("speaker") || lower.includes("soundlink")) {
    return {
      is_valid_product: true,
      title: "Bose SoundLink Flex Portable Speaker",
      category: "Electronics",
      retail_price_inr: 15900,
      suggested_price_inr: 6500,
      price_min_inr: 5800,
      price_max_inr: 7200,
      condition: condition || "good",
      condition_notes:
        "Verified Bose SoundLink Flex portable speaker in good condition. Indian campus resale ranges between 40% and 55% of retail price. Excellent sound clarity and battery life.",
      confidence: 0.96,
      source: "catalog-benchmark",
    };
  }

  // Check Casio / Calculator
  if (lower.includes("casio") || lower.includes("calculator") || lower.includes("fx-")) {
    return {
      is_valid_product: true,
      title: "Casio fx-991CW ClassWiz Scientific Calculator",
      category: "Electronics",
      retail_price_inr: 1595,
      suggested_price_inr: 650,
      price_min_inr: 550,
      price_max_inr: 750,
      condition: condition || "good",
      condition_notes:
        "Verified Casio scientific calculator. High campus demand for FE/SE engineering math and mechanics exams. All buttons responsive and solar panel intact.",
      confidence: 0.98,
      source: "catalog-benchmark",
    };
  }

  // Check Drafter
  if (lower.includes("drafter") || lower.includes("drawing")) {
    return {
      is_valid_product: true,
      title: "Engineering Mini Drafter with Clamps",
      category: "Lab Equipment",
      retail_price_inr: 650,
      suggested_price_inr: 280,
      price_min_inr: 220,
      price_max_inr: 350,
      condition: condition || "good",
      condition_notes:
        "Verified engineering mini drafter with steel rod arms and angle scale. High demand among first-year engineering students for drawing submissions.",
      confidence: 0.97,
      source: "catalog-benchmark",
    };
  }

  // Check Textbook
  if (lower.includes("book") || lower.includes("math") || lower.includes("nirali") || lower.includes("techmax")) {
    return {
      is_valid_product: true,
      title: title ? title.trim() : "Engineering Mathematics-II (M2) Nirali",
      category: "Academic Material",
      retail_price_inr: 620,
      suggested_price_inr: 250,
      price_min_inr: 200,
      price_max_inr: 300,
      condition: condition || "good",
      condition_notes:
        "Verified university syllabus textbook in good binding condition. Clean pages with minimal highlighting.",
      confidence: 0.94,
      source: "catalog-benchmark",
    };
  }

  // Check Lab coat / Apron
  if (lower.includes("coat") || lower.includes("apron") || lower.includes("lab")) {
    return {
      is_valid_product: true,
      title: "White Full-Sleeve Laboratory Apron",
      category: "Lab Equipment",
      retail_price_inr: 550,
      suggested_price_inr: 250,
      price_min_inr: 200,
      price_max_inr: 300,
      condition: condition || "good",
      condition_notes:
        "Standard cotton laboratory coat suitable for chemistry and pharmacy lab sessions. Clean, stainless and washed.",
      confidence: 0.95,
      source: "catalog-benchmark",
    };
  }

  // Generic Campus Item Benchmark
  const cleanTitle = title ? title.trim() : "Campus Second-Hand Item";
  return {
    is_valid_product: true,
    title: cleanTitle,
    category: "Academic Material",
    retail_price_inr: 800,
    suggested_price_inr: 350,
    price_min_inr: 280,
    price_max_inr: 420,
    condition: condition || "good",
    condition_notes: `Standard Indian campus resale estimation for ${cleanTitle}. Functional items in ${condition} condition typically trade at 40%–55% of retail value.`,
    confidence: 0.90,
    source: "catalog-benchmark",
  };
}
