import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { deleteCategory, getCategories, upsertCategory } from "../controllers/categoryController.js";

const router = express.Router();

router.get("/", authMiddleware, getCategories);
router.post("/", authMiddleware, upsertCategory);
router.delete("/", authMiddleware, deleteCategory);

export default router;
