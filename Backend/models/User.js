import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    salaryEnabled: { type: Boolean, default: true },
    defaultSalaryUsd: { type: Number, default: 0 },
    salaryDayOfMonth: { type: Number, default: 1 },
  },
  { timestamps: true } // Enables createdAt & updatedAt fields automatically
);

export default mongoose.model("User", userSchema);
