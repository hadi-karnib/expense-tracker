import mongoose from "mongoose";

const recurringSchema = new mongoose.Schema(
  {
    freq: { type: String, enum: ["monthly"], default: "monthly" },
    dayOfMonth: { type: Number, min: 1, max: 31, default: 1 },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Standard fields
    category: { type: String, required: true }, // e.g., Food, Rent, Entertainment
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String },

    // Recurring support
    isRecurring: { type: Boolean, default: false },
    isTemplate: { type: Boolean, default: false }, // template record for recurring items
    templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", default: null }, // points to template
    autoKey: { type: String, default: null }, // e.g. recur:<templateId>:YYYY-MM

    recurring: { type: recurringSchema, default: null },
  },
  { timestamps: true }
);

// Helpful indexes
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, autoKey: 1 }, { unique: true, sparse: true });
expenseSchema.index({ userId: 1, isTemplate: 1 });

export default mongoose.model("Expense", expenseSchema);
