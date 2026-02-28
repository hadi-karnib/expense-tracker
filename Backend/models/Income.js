import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    source: { type: String, default: "income" }, // "salary" | "income"
    autoKey: { type: String, index: true }, // salary:YYYY-MM or other recurring keys
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    note: { type: String, default: "" },
    description: { type: String, default: "" }, // legacy/alt


    isRecurring: { type: Boolean, default: false },
    recurring: {
      freq: { type: String, enum: ["monthly"], default: "monthly" },
      dayOfMonth: { type: Number, default: 1 },
    },
  },
  { timestamps: true }
);

incomeSchema.index({ userId: 1, autoKey: 1 }, { unique: false });

export default mongoose.model("Income", incomeSchema);
