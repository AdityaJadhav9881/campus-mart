const CONDITION_LABELS = {
  "like-new": "Like new",
  likeNew: "Like new",
  "like new": "Like new",
  new: "New",
  good: "Good",
  fair: "Fair",
  poor: "Needs repair",
  "needs-repair": "Needs repair",
  average: "Fair",
  excellent: "Like new",
};

export function rupees(value) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function conditionLabel(value) {
  if (!value) return "Condition not stated";
  const key = String(value).trim().toLowerCase();
  return CONDITION_LABELS[key] ?? String(value).trim();
}

/* Backend trust scores arrive on a 0.0–5.0 scale (e.g. 4.9). Legacy seed
   rows used 0–100; anything above 5 is converted. Always display as X / 5. */
export function trustOutOf5(value) {
  if (value === null || value === undefined || value === "") return null;
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  const normalized = score <= 5 ? score : score / 20;
  const clamped = Math.min(5, Math.max(0, normalized));
  return Math.round(clamped * 10) / 10;
}

export function trustScore(value) {
  const outOf5 = trustOutOf5(value);
  return outOf5 === null ? null : `★ ${outOf5.toFixed(1)} / 5`;
}

export function productPrice(product) {
  const listed = product?.listed_price;
  const suggested = product?.suggested_price;
  if (listed !== null && listed !== undefined && listed !== "") {
    const listedValue = Number(listed);
    if (Number.isFinite(listedValue)) return listedValue;
  }
  if (suggested !== null && suggested !== undefined && suggested !== "") {
    const suggestedValue = Number(suggested);
    if (Number.isFinite(suggestedValue)) return suggestedValue;
  }
  return null;
}

export function relativeTime(iso) {
  if (!iso) return null;
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return null;
}
