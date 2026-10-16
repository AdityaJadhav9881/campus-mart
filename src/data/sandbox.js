/* Inputs and heuristics for the interactive sandbox pipeline.
   The production app derives category, price and clearance from the
   real agents — these mirror the same signals for an in-browser run. */

export const sandboxConditions = [
  { id: "like-new", label: "Like new", multiplier: 0.72 },
  { id: "good", label: "Good", multiplier: 0.55 },
  { id: "fair", label: "Fair", multiplier: 0.38 },
];

export const categoryBasePrice = {
  "Academic Material": 450,
  "Lab Equipment": 1200,
  Electronics: 2600,
};

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
