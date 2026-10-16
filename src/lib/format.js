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

export function trustScore(value) {
  if (value === null || value === undefined || value === "") return null;
  const score = Number(value);
  if (!Number.isFinite(score)) return null;
  return Math.round(Math.min(100, Math.max(0, score)));
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
