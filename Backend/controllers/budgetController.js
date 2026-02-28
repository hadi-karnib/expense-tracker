import Budget from "../models/Budget.js";

export const getBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { month } = req.query;
    if (!month) return res.status(400).json({ message: "month=YYYY-MM required" });

    const b = await Budget.findOne({ userId, monthKey: month }).lean();
    res.json(b || { userId, monthKey: month, totalUsd: 0, perCategoryUsd: {} });
  } catch (e) {
    res.status(500).json({ message: "Failed to load budget.", error: e.message });
  }
};

export const upsertBudget = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { monthKey, totalUsd, perCategoryUsd } = req.body;
    if (!monthKey) return res.status(400).json({ message: "monthKey required" });

    const b = await Budget.findOneAndUpdate(
      { userId, monthKey },
      { $set: { totalUsd: Number(totalUsd || 0), perCategoryUsd: perCategoryUsd || {} } },
      { upsert: true, new: true }
    );
    res.json({ message: "Budget saved", budget: b });
  } catch (e) {
    res.status(500).json({ message: "Failed to save budget.", error: e.message });
  }
};
