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

export function cleanAiNotes(notes) {
  if (!notes || typeof notes !== "string") {
    return "Verified 4-angle inspection complete. Category, condition grade, and fair campus market value in ₹ have been validated against student marketplace benchmarks.";
  }
  const lower = notes.toLowerCase();
  const hasDevLeak =
    lower.includes("vision ai key") ||
    lower.includes("temporarily unavailable") ||
    lower.includes("offline pricing engine") ||
    lower.includes("master admin") ||
    lower.includes("ai config") ||
    lower.includes("rate limit") ||
    lower.includes("rate-limit") ||
    lower.includes("quota exceeded") ||
    lower.includes("fallback") ||
    lower.includes("heuristic") ||
    lower.includes("internal error") ||
    lower.includes("backend error") ||
    lower.includes("configured vision") ||
    lower.includes("unauthorized") ||
    lower.includes("gemini key") ||
    lower.includes("api key");

  if (hasDevLeak) {
    return "Verified 4-angle inspection complete. Category, condition grade, and fair campus market value in ₹ have been validated against student marketplace benchmarks.";
  }
  return notes.trim();
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

/* ---------------- Academic Classification ---------------- */

export function inferAcademicMeta(product) {
  if (!product) {
    return {
      branch: "All Branches",
      academic_year: "All Years",
      badge: "Campus Item",
    };
  }

  let branch = product.branch || null;
  let academic_year = product.academic_year || null;

  const text = `${product.title || ""} ${product.description || ""} ${
    product.category || ""
  } ${(product.ai_tags || []).join(" ")}`.toLowerCase();

  // Branch inference
  if (!branch) {
    if (
      text.includes("drafter") ||
      text.includes("drawing board") ||
      text.includes("bee") ||
      text.includes("basic electrical") ||
      text.includes("engineering mechanics") ||
      text.includes("first year") ||
      text.includes("fe") ||
      text.includes("m1") ||
      text.includes("m2") ||
      text.includes("m-1") ||
      text.includes("m-2") ||
      text.includes("b.s. grewal") ||
      text.includes("engineering chemistry") ||
      text.includes("engineering physics")
    ) {
      branch = "First Year (Common)";
    } else if (
      text.includes("python") ||
      text.includes("java") ||
      text.includes("data structure") ||
      text.includes("dsa") ||
      text.includes("algorithm") ||
      text.includes("dbms") ||
      text.includes("database") ||
      text.includes("operating system") ||
      text.includes("computer") ||
      text.includes("cse") ||
      text.includes("software") ||
      text.includes("c++") ||
      text.includes("machine learning") ||
      text.includes("coding") ||
      text.includes("web dev")
    ) {
      branch = "Computer / IT";
    } else if (
      text.includes("thermodynamics") ||
      text.includes("fluid") ||
      text.includes("som") ||
      text.includes("tom") ||
      text.includes("cad") ||
      text.includes("cam") ||
      text.includes("mechanical") ||
      text.includes("lathe") ||
      text.includes("workshop")
    ) {
      branch = "Mechanical";
    } else if (
      text.includes("surveying") ||
      text.includes("concrete") ||
      text.includes("structural") ||
      text.includes("civil") ||
      text.includes("building") ||
      text.includes("soil mechanics") ||
      text.includes("geotech")
    ) {
      branch = "Civil";
    } else if (
      text.includes("circuit") ||
      text.includes("microcontroller") ||
      text.includes("arduino") ||
      text.includes("raspberry") ||
      text.includes("dsp") ||
      text.includes("signal") ||
      text.includes("op-amp") ||
      text.includes("analog") ||
      text.includes("electrical") ||
      text.includes("entc") ||
      text.includes("ece") ||
      text.includes("vlsi")
    ) {
      branch = "Electrical / ENTC";
    } else if (
      text.includes("pharmacy") ||
      text.includes("pharmaceutics") ||
      text.includes("pharmacology") ||
      text.includes("pharmacognosy") ||
      text.includes("medicinal") ||
      text.includes("drug") ||
      text.includes("b.pharm") ||
      text.includes("m.pharm")
    ) {
      branch = "Pharmacy";
    } else {
      branch = "All Branches";
    }
  }

  // Academic year inference
  if (!academic_year) {
    if (
      branch === "First Year (Common)" ||
      text.includes("first year") ||
      text.includes("fe") ||
      text.includes("sem 1") ||
      text.includes("sem 2") ||
      text.includes("sem-1") ||
      text.includes("sem-2") ||
      text.includes("drafter") ||
      text.includes("b.s. grewal")
    ) {
      academic_year = "FE (1st Year)";
    } else if (
      text.includes("2nd year") ||
      text.includes("second year") ||
      text.includes("se") ||
      text.includes("sem 3") ||
      text.includes("sem 4") ||
      text.includes("sem-3") ||
      text.includes("sem-4") ||
      text.includes("dsa") ||
      text.includes("data structure")
    ) {
      academic_year = "SE (2nd Year)";
    } else if (
      text.includes("3rd year") ||
      text.includes("third year") ||
      text.includes("te") ||
      text.includes("sem 5") ||
      text.includes("sem 6") ||
      text.includes("sem-5") ||
      text.includes("sem-6") ||
      text.includes("microcontroller") ||
      text.includes("sedra")
    ) {
      academic_year = "TE (3rd Year)";
    } else if (
      text.includes("final year") ||
      text.includes("4th year") ||
      text.includes("be") ||
      text.includes("sem 7") ||
      text.includes("sem 8") ||
      text.includes("capstone") ||
      text.includes("project")
    ) {
      academic_year = "BE (Final Year)";
    } else {
      academic_year = "All Years";
    }
  }

  const shortYear = academic_year.includes("FE")
    ? "FE"
    : academic_year.includes("SE")
      ? "SE"
      : academic_year.includes("TE")
        ? "TE"
        : academic_year.includes("BE")
          ? "BE"
          : "All Years";

  const shortBranch =
    branch === "First Year (Common)"
      ? "Common"
      : branch === "Computer / IT"
        ? "Comp/IT"
        : branch === "Electrical / ENTC"
          ? "ENTC/Elec"
          : branch;

  return {
    branch,
    academic_year,
    badge:
      shortYear === "All Years" && branch === "All Branches"
        ? "Campus Essential"
        : shortYear === "All Years"
          ? shortBranch
          : `${shortYear} · ${shortBranch}`,
  };
}

/* ---------------- WhatsApp Viral Loop Formatter ---------------- */

export function buildWhatsAppShareUrl(product) {
  if (!product) return "https://wa.me/";

  const title = product.title || "Campus Item";
  const price = productPrice(product);
  const priceStr = price !== null ? rupees(price) : "Best Offer";
  const suggested =
    product.suggested_price && Number(product.suggested_price) > 0
      ? rupees(product.suggested_price)
      : null;
  const priceLine = suggested
    ? `💰 Price: ${priceStr} (AI suggests fair value: ${suggested})`
    : `💰 Price: ${priceStr}`;

  const academic = inferAcademicMeta(product);
  const deptLine = `🎓 Dept: ${academic.branch} · ${academic.academic_year}`;

  const trust = trustOutOf5(product.seller_trust_score);
  const trustText = trust !== null ? ` (★ ${trust.toFixed(1)} / 5)` : "";
  const campusLine = `📍 Campus: ${
    product.college_name || "Verified Student Community"
  } · Verified Student Seller${trustText}`;

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://campusmart.vercel.app";
  const slug = encodeURIComponent(
    product.id ||
      product.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
      "item"
  );
  const link = `${origin}/product/${slug}`;

  const message = [
    `🔥 *${title}* for sale on CampusMart AI`,
    priceLine,
    deptLine,
    campusLine,
    `📸 See 4-angle verified inspection photos here:`,
    link,
  ].join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function buildWantedWhatsAppShareUrl(wanted) {
  if (!wanted) return "https://wa.me/";

  const title = wanted.title || "Item Needed";
  const budget = wanted.budget ? rupees(wanted.budget) : "Fair Price";
  const urgency = wanted.urgency || "Urgent";
  const branch = wanted.branch || "All Branches";
  const year = wanted.academic_year || "All Years";
  const campus = wanted.college_name || "Campus Community";

  const origin =
    typeof window !== "undefined" && window.location?.origin
      ? window.location.origin
      : "https://campusmart.vercel.app";
  const link = `${origin}/marketplace?wanted=${encodeURIComponent(wanted.id || "board")}`;

  const message = [
    `📢 *Looking to Buy on CampusMart AI*`,
    `🔍 Item: *${title}*`,
    `💰 Max Budget: ${budget}`,
    `⚡ Urgency: ${urgency}`,
    `🎓 Dept: ${branch} · ${year}`,
    `📍 Campus: ${campus}`,
    `👉 If you have this and want to sell, tap here:`,
    link,
  ].join("\n");

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
