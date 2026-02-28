import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { importCsv } from "../controllers/importController.js";

const router = express.Router();

router.post("/csv", authMiddleware, importCsv);

export default router;
