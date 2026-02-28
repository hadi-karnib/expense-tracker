import SmartRule from "../../models/SmartRule.js";

/**
 * Apply keyword->category rules. First match wins (longer keywords first).
 */
export async function categorizeText({ userId, text, applyTo = "expense" }) {
  const raw = (text || "").toLowerCase();
  if (!raw.trim()) return null;

  const rules = await SmartRule.find({
    userId,
    applyTo: { $in: applyTo === "income" ? ["income", "both"] : applyTo === "expense" ? ["expense", "both"] : ["both"] },
  }).lean();

  const sorted = rules
    .slice()
    .sort((a, b) => (b.keyword?.length || 0) - (a.keyword?.length || 0));

  for (const r of sorted) {
    const kw = (r.keyword || "").toLowerCase().trim();
    if (!kw) continue;
    if (raw.includes(kw)) return r.category;
  }
  return null;
}
