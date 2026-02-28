import mongoose from "mongoose";

const savingsGoalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    targetUsd: { type: Number, required: true },
    currentUsd: { type: Number, default: 0 },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("SavingsGoal", savingsGoalSchema);
