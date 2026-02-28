import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addIncome,
  deleteIncome,
  getIncome,
  updateIncome,
  getSalarySettings,
  patchSalarySettings,
  editSalaryForMonth,
} from "../controllers/incomeController.js";

const router = express.Router();

router.get("/", authMiddleware, getIncome);
router.post("/", authMiddleware, addIncome);
router.patch("/", authMiddleware, updateIncome);
router.delete("/", authMiddleware, deleteIncome);

// Salary settings + editing
router.get("/salary/settings", authMiddleware, getSalarySettings);
router.patch("/salary/settings", authMiddleware, patchSalarySettings);
router.post("/salary/edit-month", authMiddleware, editSalaryForMonth);

export default router;
