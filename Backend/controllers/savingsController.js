import SavingsGoal from "../models/SavingsGoal.js";

export const listGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (e) {
    res.status(500).json({ message: "Failed to load goals.", error: e.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { title, targetUsd, currentUsd, dueDate } = req.body;
    if (!title || typeof targetUsd !== "number") return res.status(400).json({ message: "title and targetUsd required" });

    const g = await SavingsGoal.create({
      userId: req.user.userId,
      title,
      targetUsd,
      currentUsd: typeof currentUsd === "number" ? currentUsd : 0,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });
    res.status(201).json({ message: "Goal created", goal: g });
  } catch (e) {
    res.status(500).json({ message: "Failed to create goal.", error: e.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { id, title, targetUsd, currentUsd, dueDate } = req.body;
    if (!id) return res.status(400).json({ message: "id required" });

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (targetUsd !== undefined) updates.targetUsd = Number(targetUsd);
    if (currentUsd !== undefined) updates.currentUsd = Number(currentUsd);
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : undefined;

    const g = await SavingsGoal.findOneAndUpdate({ _id: id, userId: req.user.userId }, { $set: updates }, { new: true });
    if (!g) return res.status(404).json({ message: "Goal not found" });
    res.json({ message: "Goal updated", goal: g });
  } catch (e) {
    res.status(500).json({ message: "Failed to update goal.", error: e.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "id required" });
    await SavingsGoal.findOneAndDelete({ _id: id, userId: req.user.userId });
    res.json({ message: "Goal deleted" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete goal.", error: e.message });
  }
};
