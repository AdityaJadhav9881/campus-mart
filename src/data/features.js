import { ScanLine, TrendingUp, ShieldCheck, Sparkles } from "lucide-react";

export const features = [
  {
    id: "listing-intelligence",
    index: "01",
    icon: ScanLine,
    title: "Listing Intelligence",
    summary: "Automated data entry via computer vision.",
    body: "Point the camera at a textbook, lab kit, or device. Vision agents read the title, edition, condition, and photos — and assemble a complete, publish-ready listing in seconds. No forms. No typing.",
    connectsTo: "Smart Price Prediction",
  },
  {
    id: "smart-price-prediction",
    index: "02",
    icon: TrendingUp,
    title: "Smart Price Prediction",
    summary: "Fair value, calculated from campus demand.",
    body: "Market agents study campus demand, edition cycles, and exchange history to suggest a fair price range for every item — so sellers list with confidence and buyers know a good deal when they see one.",
    connectsTo: "Trust & Fraud Detection",
  },
  {
    id: "trust-fraud-detection",
    index: "03",
    icon: ShieldCheck,
    title: "Trust & Fraud Detection",
    summary: "Scam patterns surfaced before they reach you.",
    body: "Verification agents cross-check profiles, listing signals, and transaction patterns to flag suspicious behavior early — keeping the exchange inside the campus community it was built for.",
    connectsTo: "Personalized Recommendations",
  },
  {
    id: "personalized-recommendations",
    index: "04",
    icon: Sparkles,
    title: "Personalized Recommendations",
    summary: "The materials you need, before you search.",
    body: "Recommendation agents learn your courses and campus context to surface relevant materials at the right moment in the semester — discoveries that feel connected, not random.",
    connectsTo: "Listing Intelligence",
  },
];

export const agentPipeline = [
  { label: "Listing Agent", role: "VISION" },
  { label: "Pricing Agent", role: "MARKET" },
  { label: "Trust Agent", role: "SECURITY" },
  { label: "Recommendation Agent", role: "DISCOVERY" },
];

export const exchangeFlow = [
  {
    step: "Capture",
    caption: "Computer vision reads the item",
  },
  {
    step: "List",
    caption: "Agents assemble the listing",
  },
  {
    step: "Price",
    caption: "Fair value from campus demand",
  },
  {
    step: "Verify",
    caption: "Trust agents clear the exchange",
  },
  {
    step: "Exchange",
    caption: "Students trade — securely",
  },
];

/* ---- Price Estimator demo model ----
   Illustrative multipliers shown live in the UI. The pricing agent in the
   production app derives these from campus demand and exchange history. */

export const priceCategories = [
  { id: "textbooks", label: "Engineering Textbooks", max: 120 },
  { id: "calculators", label: "Scientific Calculators", max: 220 },
  { id: "lab-kits", label: "Drafter & Lab Kits", max: 300 },
  { id: "electronics", label: "Electronics", max: 800 },
];

export const conditionTiers = [
  { id: "like-new", label: "Like New", multiplier: 0.7, speed: "Under 24 hours" },
  { id: "good", label: "Good", multiplier: 0.55, speed: "1 – 2 days" },
  { id: "fair", label: "Fair", multiplier: 0.38, speed: "3 – 5 days" },
];

/* ---- Phone preview data ---- */

export const feedListings = [
  {
    id: "op-amp",
    title: "Op-Amps & Linear ICs Handbook",
    price: 420,
    trust: 96,
    tag: "ENGINEERING",
  },
  {
    id: "calc",
    title: "Casio fx-991EX Classwiz",
    price: 950,
    trust: 92,
    tag: "CALCULATOR",
  },
  {
    id: "drafter",
    title: "Mini Drafter + Lab Kit",
    price: 600,
    trust: 89,
    tag: "LAB KIT",
  },
];

export const chatMessages = [
  {
    id: 1,
    from: "peer",
    name: "Sneha · EE '27",
    body: "Hi! Is the Casio still available? I'm in Hostel B.",
  },
  {
    id: 2,
    from: "me",
    body: "Yes — verified student. Pickup at the Library Atrium zone?",
  },
  {
    id: 3,
    from: "peer",
    name: "Sneha · EE '27",
    body: "Perfect. See you at 5, Atrium zone 2.",
  },
];

export const faqs = [
  {
    id: "prevention",
    question: "How does the platform prevent non-students and scammers?",
    answer: "Access is limited to verified student accounts — each signup is confirmed against institutional email before a profile can list or message. On top of that, a Trust Agent scores every account and listing in real time, cross-checking behavior patterns to surface suspicious activity before it reaches other students.",
  },
  {
    id: "meetups",
    question: "Where do item exchanges take place?",
    answer: "Exchanges are designed around designated safe campus meetup zones — well-lit, high-traffic spots like the library atrium or student center. The app nudges both parties toward these zones so handoffs stay on campus and inside the community.",
  },
  {
    id: "commissions",
    question: "Does CampusMart take a cut of student sales?",
    answer: "No. Peer-to-campus exchanges carry zero seller commissions. A student who sells a used textbook keeps the full asking price — the platform is built to keep materials circulating on campus, not to monetize student-to-student sales.",
  },
  {
    id: "pricing",
    question: "How is the AI Suggested Resale Price calculated?",
    answer: "The pricing agent weighs category demand, edition cycles, item condition, and recent campus exchange history to propose a fair range. It's guidance, not a rule — sellers can adjust the final price at any time.",
  },
  {
    id: "listing",
    question: "Do I have to type out every listing by hand?",
    answer: "No. Point the in-app camera at the item and the vision agent reads the title, edition, condition, and photos, then assembles a publish-ready listing in seconds. You review and post — nothing to type.",
  },
];
