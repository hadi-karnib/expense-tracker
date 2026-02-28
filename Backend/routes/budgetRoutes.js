import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getBudget, upsertBudget } from "../controllers/budgetController.js";

const router = express.Router();

router.get("/", authMiddleware, getBudget);
router.post("/", authMiddleware, upsertBudget);

export default router;
