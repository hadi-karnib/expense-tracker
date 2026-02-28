// A small, modern palette meant to look good in both light & dark themes.
// Colors are assigned deterministically per category name.

const PALETTE = [
  "#6366F1", // indigo
  "#22C55E", // green
  "#60A5FA", // blue
  "#F59E0B", // amber
  "#F43F5E", // rose
  "#A78BFA", // purple
  "#14B8A6", // teal
  "#94A3B8", // slate
  "#EC4899", // pink
  "#F97316", // orange
  "#10B981", // emerald
  "#8B5CF6", // violet
];

function hashString(input) {
  // Simple stable hash (djb2-ish), good enough for palette indexing.
  let h = 5381;
  const s = String(input || "");
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return Math.abs(h);
}

export function getCategoryColor(categoryName) {
  const name = (categoryName || "Other").trim() || "Other";
  const idx = hashString(name) % PALETTE.length;
  return PALETTE[idx];
}

export function getPalette() {
  return [...PALETTE];
}
