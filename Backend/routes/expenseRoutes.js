import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addExpense,
  getExpenses,
  getExpensesByMonth,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Expense routes
router.post("/", authMiddleware, addExpense); // Add an expense
router.get("/", authMiddleware, getExpenses); // Get all expenses
router.get("/month", authMiddleware, getExpensesByMonth); // Get expenses by month/year
router.patch("/", authMiddleware, updateExpense); // Update an expense (ID in body)
router.delete("/", authMiddleware, deleteExpense); // Delete an expense (ID in body)

export default router;
