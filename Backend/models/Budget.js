import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    monthKey: { type: String, required: true }, // YYYY-MM
    totalUsd: { type: Number, default: 0 },
    perCategoryUsd: { type: Object, default: {} }, // { [categoryName]: number }
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, monthKey: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
