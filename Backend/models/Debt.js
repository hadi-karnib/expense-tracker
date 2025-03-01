import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const debtSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creditor: { type: String, required: true }, // Who the debt is owed to
    totalAmount: { type: Number, required: true }, // Initial debt amount
    remainingAmount: { type: Number, required: true }, // Amount left to pay
    dueDate: { type: Date, required: true },
    payments: [paymentSchema], // Stores payment history
  },
  { timestamps: true }
);

export default mongoose.model("Debt", debtSchema);
