import mongoose from "mongoose";

const debtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  creditor: { type: String, required: true }, // Who the debt is owed to
  totalAmount: { type: Number, required: true }, // Total debt amount
  remainingAmount: { type: Number, required: true }, // Balance left to pay
  dueDate: { type: Date, required: true },
  payments: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Debt", debtSchema);
