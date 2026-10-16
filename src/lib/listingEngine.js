import {
  categoryBasePrice,
  prohibitedTerms,
  sandboxConditions,
} from "../data/sandbox.js";

/* Browser-side stand-ins for the three production agents, used by the
   sandbox so visitors can run the pipeline without an account. */

export function classifyItem(title) {
  const text = String(title ?? "").toLowerCase();
  const electronics =
    /\b(phone|laptop|tablet|raspberry|arduino|pcb|sensor|camera|charger|battery|monitor|keyboard|mouse|gpu|cpu|headphone|speaker|drone|oscilloscope|multimeter|solder|calculator|smartwatch)\b/.test(
      text
    );
  const lab =
    /\b(lab|kit|drafter|microscope|beaker|test tube|probe|breadboard|toolkit|equipment|apparatus|stand|clamp|multimeter)\b/.test(
      text
    );

  if (electronics) return "Electronics";
  if (lab) return "Lab Equipment";
  return "Academic Material";
}

export function scanProhibited(title) {
  const text = String(title ?? "").toLowerCase();
  const flagged = prohibitedTerms.filter((term) => text.includes(term));
  return { flagged, clearance: flagged.length ? "FLAGGED" : "CLEARED" };
}

export function priceFor(category, conditionId, ageYears) {
  const base = categoryBasePrice[category] ?? 500;
  const multiplier =
    sandboxConditions.find((c) => c.id === conditionId)?.multiplier ?? 0.55;
  const age = Number(ageYears) || 0;
  const ageFactor = Math.max(0.55, 1 - age * 0.08);
  const confidence = Math.min(0.97, 0.82 + multiplier * 0.18 - age * 0.01);

  return {
    suggestedPrice: Math.round(base * multiplier * ageFactor),
    confidence: Number(confidence.toFixed(2)),
  };
}
