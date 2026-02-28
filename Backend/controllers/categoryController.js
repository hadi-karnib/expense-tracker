import Category from "../models/Category.js";

const DEFAULTS = [
  { name: "Food", color: "#f97316" },
  { name: "Rent", color: "#22c55e" },
  { name: "Transport", color: "#3b82f6" },
  { name: "Bills", color: "#a855f7" },
  { name: "Shopping", color: "#ef4444" },
  { name: "Entertainment", color: "#06b6d4" },
];

export const getCategories = async (req, res) => {
  try {
    const userId = req.user.userId;
    let cats = await Category.find({ userId }).sort({ name: 1 });
    if (!cats.length) {
      await Category.insertMany(DEFAULTS.map((c) => ({ ...c, userId })));
      cats = await Category.find({ userId }).sort({ name: 1 });
    }
    res.json(cats);
  } catch (e) {
    res.status(500).json({ message: "Failed to load categories.", error: e.message });
  }
};

export const upsertCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, color } = req.body;
    if (!name || !color) return res.status(400).json({ message: "name and color required" });

    const cat = await Category.findOneAndUpdate(
      { userId, name },
      { $set: { color } },
      { upsert: true, new: true }
    );
    res.json({ message: "Category saved", category: cat });
  } catch (e) {
    res.status(500).json({ message: "Failed to save category.", error: e.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "name required" });

    await Category.findOneAndDelete({ userId, name });
    res.json({ message: "Category deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete category.", error: e.message });
  }
};
