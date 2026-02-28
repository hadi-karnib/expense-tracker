import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { deleteRule, getRules, upsertRule } from "../controllers/rulesController.js";

const router = express.Router();

router.get("/", authMiddleware, getRules);
router.post("/", authMiddleware, upsertRule);
router.delete("/", authMiddleware, deleteRule);

export default router;
