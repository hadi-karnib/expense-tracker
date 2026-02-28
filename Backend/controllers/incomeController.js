import Income from "../models/Income.js";
import User from "../models/User.js";

/**
 * Salary rules:
 * - salary monthly entry has autoKey salary:YYYY-MM
 * - defaultSalaryUsd + salaryEnabled stored on User
 * - fetching income for month auto-creates salary if enabled
 */
function monthKeyFromDate(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function getMonthBounds(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  return { start, end };
}

async function ensureSalary({ userId, monthKey }) {
  const user = await User.findById(userId).lean();
  if (!user?.salaryEnabled || !user?.defaultSalaryUsd) return null;

  const autoKey = `salary:${monthKey}`;
  const existing = await Income.findOne({ userId, autoKey });
  if (existing) return existing;

  const { start } = getMonthBounds(monthKey);
  const date = new Date(start);
  const day = Math.min(Math.max(Number(user.salaryDayOfMonth || 1), 1), 28);
  date.setUTCDate(day);

  const doc = await Income.create({
    userId,
    source: "salary",
    autoKey,
    amount: Number(user.defaultSalaryUsd),
    date,
    note: "Salary",
    description: "Salary",
    isRecurring: true,
    recurring: { freq: "monthly", dayOfMonth: day },
  });

  return doc;
}

export const getIncome = async (req, res) => {
  try {
    const month = req.query.month; // YYYY-MM optional
    const userId = req.user.userId;

    if (month) {
      await ensureSalary({ userId, monthKey: month });
      const { start, end } = getMonthBounds(month);
      const income = await Income.find({
        userId,
        date: { $gte: start, $lt: end },
      }).sort({ date: -1 });
      return res.json(income);
    }

    // all income (no auto create)
    const income = await Income.find({ userId }).sort({ date: -1 });
    return res.json(income);
  } catch (e) {
    res.status(500).json({ message: "Failed to load income.", error: e.message });
  }
};

export const addIncome = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount, date, description, note, category, source } = req.body;
    if (typeof amount !== "number" || !amount) return res.status(400).json({ message: "amount must be a number" });
    if (!date || isNaN(new Date(date).getTime())) return res.status(400).json({ message: "valid date required" });

    const doc = await Income.create({
      userId,
      amount,
      date,
      note: (note ?? description ?? "") || "",
      description: description || "",
      source: source || "income",
    });

    res.status(201).json({ message: "Income added", income: doc });
  } catch (e) {
    res.status(500).json({ message: "Failed to add income.", error: e.message });
  }
};

export const updateIncome = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id, amount, date, description, note } = req.body;
    if (!id) return res.status(400).json({ message: "id required" });

    const updates = {};
    if (amount !== undefined) {
      if (typeof amount !== "number" || amount === 0) return res.status(400).json({ message: "amount must be a number" });
      updates.amount = amount;
    }
    if (date !== undefined) {
      if (isNaN(new Date(date).getTime())) return res.status(400).json({ message: "valid date required" });
      updates.date = date;
    }
    if (note !== undefined) updates.note = String(note);
    if (description !== undefined) updates.description = String(description);

    const doc = await Income.findOneAndUpdate({ _id: id, userId }, { $set: updates }, { new: true });
    if (!doc) return res.status(404).json({ message: "Income not found" });

    res.json({ message: "Income updated", income: doc });
  } catch (e) {
    res.status(500).json({ message: "Failed to update income.", error: e.message });
  }
};

export const deleteIncome = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "id required" });

    const doc = await Income.findOneAndDelete({ _id: id, userId });
    if (!doc) return res.status(404).json({ message: "Income not found" });

    res.json({ message: "Income deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete income.", error: e.message });
  }
};

export const getSalarySettings = async (req, res) => {
  const user = await User.findById(req.user.userId).lean();
  res.json({
    salaryEnabled: !!user?.salaryEnabled,
    defaultSalaryUsd: Number(user?.defaultSalaryUsd || 0),
    salaryDayOfMonth: Number(user?.salaryDayOfMonth || 1),
  });
};

export const patchSalarySettings = async (req, res) => {
  try {
    const { salaryEnabled, defaultSalaryUsd, salaryDayOfMonth } = req.body;
    const updates = {};
    if (salaryEnabled !== undefined) updates.salaryEnabled = !!salaryEnabled;
    if (defaultSalaryUsd !== undefined) updates.defaultSalaryUsd = Number(defaultSalaryUsd) || 0;
    if (salaryDayOfMonth !== undefined) updates.salaryDayOfMonth = Math.min(Math.max(Number(salaryDayOfMonth) || 1, 1), 28);

    const user = await User.findByIdAndUpdate(req.user.userId, { $set: updates }, { new: true });
    res.json({
      salaryEnabled: !!user.salaryEnabled,
      defaultSalaryUsd: Number(user.defaultSalaryUsd || 0),
      salaryDayOfMonth: Number(user.salaryDayOfMonth || 1),
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to update salary settings.", error: e.message });
  }
};

export const editSalaryForMonth = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month, amount, applyToFuture } = req.body;
    if (!month || !/^[0-9]{4}-[0-9]{2}$/.test(month)) return res.status(400).json({ message: "month must be YYYY-MM" });
    if (typeof amount !== "number") return res.status(400).json({ message: "amount must be a number" });

    // ensure salary exists
    const salary = await ensureSalary({ userId, monthKey: month });
    if (!salary) return res.status(400).json({ message: "Salary not enabled" });

    salary.amount = amount;
    await salary.save();

    if (applyToFuture) {
      await User.findByIdAndUpdate(userId, { $set: { defaultSalaryUsd: amount, salaryEnabled: true } });
    }

    res.json({ message: "Salary updated", income: salary });
  } catch (e) {
    res.status(500).json({ message: "Failed to update salary.", error: e.message });
  }
};
