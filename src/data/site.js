/* Copy and structured content for the How-it-works and Download pages. */

export const SUPPORT_EMAIL = "martaicampus@gmail.com";
export const SUPPORT_MAILTO =
  "mailto:martaicampus@gmail.com?subject=CampusMart%20AI%20Support%20Inquiry&body=Hi%20CampusMart%20Support%20Team,%0A%0AI%20need%20help%20with:";

export const photoAngles = [
  {
    id: "front",
    label: "Front",
    hint: "Whole item, flat on a table",
    checked: "Item identity and model",
  },
  {
    id: "back",
    label: "Back",
    hint: "Labels, serials, edition page",
    checked: "Edition and authenticity",
  },
  {
    id: "edges",
    label: "Edges & ports",
    hint: "Corners, connectors, binding",
    checked: "Wear where it happens first",
  },
  {
    id: "wear",
    label: "Wear and tear",
    hint: "Scratches, stains, tears",
    checked: "Honest condition grade",
  },
];

export const verificationSteps = [
  {
    n: 1,
    title: "Shoot all four sides",
    body: "Front, back, edges and any wear. Four photos take about thirty seconds — no forms, no writing a description by hand.",
  },
  {
    n: 2,
    title: "Vision AI reads the condition",
    body: "The model looks for scratches, screen damage, binding wear and missing parts, then grades the item as like new, good or fair.",
  },
  {
    n: 3,
    title: "You get a fair ₹ price",
    body: "The price agent compares your item against campus demand and recent exchanges in India, and suggests a resale range you can accept or adjust.",
  },
  {
    n: 4,
    title: "Trust scores protect both sides",
    body: "Sellers verify with a campus email, and every completed exchange lifts their trust score. Buyers see it before they message anyone.",
  },
];

export const readBack = [
  { label: "Condition grade", value: "Good", note: "Light edge wear, spine intact" },
  { label: "Suggested resale", value: "₹289 – ₹330", note: "Based on campus demand this month" },
  { label: "Listing text", value: "Written for you", note: "Title, edition and notes included" },
  { label: "Seller trust", value: "★ 4.9 / 5", note: "Verified campus email, 12 past trades" },
];

export const installSteps = [
  {
    n: 1,
    title: "Download the APK",
    body: "Tap the button below, or scan the QR code with your phone's camera app.",
  },
  {
    n: 2,
    title: "Allow the one-time install",
    body: "Android asks permission to install apps from your browser. Allow it once — it never applies to other apps.",
  },
  {
    n: 3,
    title: "Sign in with your campus email",
    body: "Verify your institutional email to unlock listing, chat and campus-only pickup zones.",
  },
];

export const appSpecs = [
  { label: "Compatibility", value: "Works on all Android phones" },
  { label: "Verification", value: "Campus Email OTP Verified" },
  { label: "Zero Fees", value: "0% commission on student sales" },
  { label: "Safety", value: "AI-verified photos & fair ₹ pricing" },
];
