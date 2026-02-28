import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import { categorizeText } from "./helpers/categorize.js";

function parseCsv(csvText) {
  const lines = (csvText || "").split(/\r?\n/).filter((l) => l.trim().length);
  if (!lines.length) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const out = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const headers = parseLine(lines[0]).map((h) => h.trim().toLowerCase());
  const rows = lines.slice(1).map((l) => {
    const cols = parseLine(l);
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = cols[idx] ?? ""));
    return obj;
  });
  return { headers, rows };
}

export const importCsv = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { csvText, type } = req.body;
    if (!csvText) return res.status(400).json({ message: "csvText required" });

    const { rows } = parseCsv(csvText);

    let imported = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const dateStr = r.date || r.transaction_date || r.datetime;
      const amountStr = r.amount || r.amount_usd || r.value;
      const description = (r.description || r.note || "").toString();
      let category = (r.category || r.cat || "").toString();

      const date = new Date(dateStr);
      const amount = Number(amountStr);

      if (!dateStr || isNaN(date.getTime()) || !Number.isFinite(amount)) {
        errors.push({ row: i + 2, message: "Invalid date or amount" });
        continue;
      }

      // smart rules if no category
      if (!category.trim()) {
        const suggested = await categorizeText({ userId, text: `${description}`.trim(), applyTo: type === "income" ? "income" : "expense" });
        if (suggested) category = suggested;
      }
      if (!category.trim()) category = type === "income" ? "Income" : "Uncategorized";

      if (type === "income") {
        await Income.create({
          userId,
          source: "income",
          amount: Math.abs(amount),
          date,
          description,
        });
      } else {
        await Expense.create({
          userId,
          category,
          amount: Math.abs(amount),
          date,
          description,
        });
      }
      imported++;
    }

    res.json({ message: "Import complete", imported, errors });
  } catch (e) {
    res.status(500).json({ message: "CSV import failed.", error: e.message });
  }
};
