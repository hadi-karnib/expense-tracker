import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true }, // e.g., Food, Rent, Entertainment
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    description: { type: String },
  },
  { timestamps: true } // Enables createdAt & updatedAt fields automatically
);

export default mongoose.model("Expense", expenseSchema);
