import SmartRule from "../models/SmartRule.js";

export const getRules = async (req, res) => {
  try {
    const rules = await SmartRule.find({ userId: req.user.userId }).sort({ keyword: 1 });
    res.json(rules);
  } catch (e) {
    res.status(500).json({ message: "Failed to load rules.", error: e.message });
  }
};

export const upsertRule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { keyword, category, applyTo } = req.body;
    if (!keyword || !category) return res.status(400).json({ message: "keyword and category required" });

    const rule = await SmartRule.findOneAndUpdate(
      { userId, keyword, applyTo: applyTo || "expense" },
      { $set: { category } },
      { upsert: true, new: true }
    );
    res.json({ message: "Rule saved", rule });
  } catch (e) {
    res.status(500).json({ message: "Failed to save rule.", error: e.message });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "id required" });
    await SmartRule.findOneAndDelete({ _id: id, userId });
    res.json({ message: "Rule deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete rule.", error: e.message });
  }
};
