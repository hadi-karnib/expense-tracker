import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addDebt,
  getDebts,
  makePayment,
  updateDebt,
  deleteDebt,
} from "../controllers/debtController.js";

const router = express.Router();

// Debt routes
router.post("/", authMiddleware, addDebt); // Add a debt
router.get("/", authMiddleware, getDebts); // Get all debts
router.post("/pay", authMiddleware, makePayment); // Make a payment
router.patch("/", authMiddleware, updateDebt); // Update a debt
router.delete("/", authMiddleware, deleteDebt); // Delete a debt

export default router;
