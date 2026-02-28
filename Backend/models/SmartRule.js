import mongoose from "mongoose";

const smartRuleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    keyword: { type: String, required: true },
    category: { type: String, required: true },
    applyTo: { type: String, enum: ["expense", "income", "both"], default: "expense" },
  },
  { timestamps: true }
);

smartRuleSchema.index({ userId: 1, keyword: 1, applyTo: 1 }, { unique: true });

export default mongoose.model("SmartRule", smartRuleSchema);
