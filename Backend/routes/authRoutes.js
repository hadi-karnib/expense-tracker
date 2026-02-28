import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { register, login, logout, me } from "../controllers/userController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

export default router;
