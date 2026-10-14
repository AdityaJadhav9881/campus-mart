/* ---- Live Marketplace Sandbox ----
   Simulation model for the in-browser listing pipeline. The production
   app derives category, price, and clearance from the real agents. */

export const sandboxConditions = [
  { id: "like-new", label: "Like New", multiplier: 0.7 },
  { id: "good", label: "Good", multiplier: 0.55 },
  { id: "fair", label: "Fair", multiplier: 0.38 },
];

export const categoryBasePrice = {
  "Academic Material": 450,
  "Lab Equipment": 1200,
  Electronics: 2600,
};

/* Prohibited-term scan list (Regex / NLP fraud agent). */
export const prohibitedTerms = [
  "scam",
  "stolen",
  "fake",
  "replica",
  "counterfeit",
  "hack",
  "illegal",
  "drug",
  "weapon",
  "free money",
  "wire transfer",
  "gift card",
  "off-campus only",
  "ship it",
  "cash only",
];

/* Seed feed so the Campus Feed is never empty on first view. */
export const seedFeedItems = [
  {
    id: "seed-1",
    title: "Engineering Mathematics Vol. II",
    ageYears: 1,
    condition: "good",
    conditionLabel: "Good",
    category: "Academic Material",
    suggestedPrice: 248,
    confidence: 0.93,
    clearance: "CLEARED",
    clearanceNote: "No prohibited terms detected.",
    flaggedTerms: [],
    verified: true,
    thumbnail: null,
    seedTag: "MATHEMATICS",
  },
  {
    id: "seed-2",
    title: "Oscilloscope 20MHz Probe Set",
    ageYears: 2,
    condition: "like-new",
    conditionLabel: "Like New",
    category: "Lab Equipment",
    suggestedPrice: 840,
    confidence: 0.89,
    clearance: "CLEARED",
    clearanceNote: "No prohibited terms detected.",
    flaggedTerms: [],
    verified: true,
    thumbnail: null,
    seedTag: "LAB",
  },
  {
    id: "seed-3",
    title: "Raspberry Pi 4 Model B (4GB)",
    ageYears: 1,
    condition: "fair",
    conditionLabel: "Fair",
    category: "Electronics",
    suggestedPrice: 988,
    confidence: 0.87,
    clearance: "FLAGGED",
    clearanceNote: "Listing text matched a watch-list phrase.",
    flaggedTerms: ["cash only"],
    verified: true,
    thumbnail: null,
    seedTag: "ELECTRONICS",
  },
];

/* ---- Multi-Agent Architecture Explorer ----
   Node + connection graph for the interactive system diagram. */

export const architectureNodes = [
  {
    id: "flutter",
    layer: "Frontend Layer",
    name: "Flutter Mobile App",
    tech: "Flutter · Dart",
    blurb:
      "Cross-platform client for students — camera capture, live feed, chat, and safe-zone pickup.",
  },
  {
    id: "admin",
    layer: "Frontend Layer",
    name: "React Admin Control",
    tech: "React",
    blurb:
      "Master control surface for campus moderation, listing oversight, and trust review.",
  },
  {
    id: "fastapi",
    layer: "Backend Layer",
    name: "FastAPI Server",
    tech: "FastAPI · Python",
    blurb:
      "Typed REST API that routes every request into the AI orchestration layer.",
  },
  {
    id: "firebase",
    layer: "Backend Layer",
    name: "Firebase Auth",
    tech: "Firebase",
    blurb:
      "Institutional-email verification — only confirmed students can list or message.",
  },
  {
    id: "langgraph",
    layer: "AI Orchestration Layer",
    name: "LangGraph Orchestrator",
    tech: "LangGraph",
    blurb:
      "Central brain that sequences the three specialized agents and merges their results.",
  },
  {
    id: "yolo",
    layer: "AI Orchestration Layer",
    name: "YOLO Vision",
    tech: "YOLO",
    role: "Listing Intelligence",
    blurb:
      "Classifies the captured item into Academic Material, Lab Equipment, or Electronics.",
  },
  {
    id: "sklearn",
    layer: "AI Orchestration Layer",
    name: "Scikit-learn Pricing",
    tech: "Scikit-learn",
    role: "Price Prediction",
    blurb:
      "Regression model scores condition and category against campus exchange history.",
  },
  {
    id: "fraud",
    layer: "AI Orchestration Layer",
    name: "Regex / NLP Fraud",
    tech: "Regex · NLP",
    role: "Trust & Fraud Detection",
    blurb:
      "Scans listing text for prohibited terms and assigns a security clearance.",
  },
  {
    id: "postgres",
    layer: "Data Persistence",
    name: "PostgreSQL 15",
    tech: "PostgreSQL 15",
    blurb:
      "System of record for listings, trust scores, clearances, and exchange history.",
  },
];

export const architectureLayers = [
  "Frontend Layer",
  "Backend Layer",
  "AI Orchestration Layer",
  "Data Persistence",
];

/* id -> [connected node ids]. Symmetric; drives the highlight state. */
export const architectureConnections = {
  flutter: ["fastapi", "firebase"],
  admin: ["fastapi", "postgres"],
  fastapi: ["flutter", "admin", "firebase", "langgraph"],
  firebase: ["flutter", "fastapi"],
  langgraph: ["fastapi", "yolo", "sklearn", "fraud", "postgres"],
  yolo: ["langgraph"],
  sklearn: ["langgraph"],
  fraud: ["langgraph"],
  postgres: ["langgraph", "admin"],
};

export const architectureNodeById = Object.fromEntries(
  architectureNodes.map((node) => [node.id, node])
);
