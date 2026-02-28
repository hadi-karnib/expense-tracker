import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import debtRoutes from "./routes/debtRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import rulesRoutes from "./routes/rulesRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import savingsRoutes from "./routes/savingsRoutes.js";
import importRoutes from "./routes/importRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_ORIGIN, // set this to https://expense-tracker.vercel.app
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman / server-to-server

      if (allowedOrigins.includes(origin)) return cb(null, true);

      // ✅ allow any Vercel preview deployment
      if (origin.endsWith(".vercel.app")) return cb(null, true);

      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/debt", debtRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rules", rulesRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/savings", savingsRoutes);
app.use("/api/import", importRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
