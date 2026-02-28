import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { createGoal, deleteGoal, listGoals, updateGoal } from "../controllers/savingsController.js";

const router = express.Router();

router.get("/", authMiddleware, listGoals);
router.post("/", authMiddleware, createGoal);
router.patch("/", authMiddleware, updateGoal);
router.delete("/", authMiddleware, deleteGoal);

export default router;
