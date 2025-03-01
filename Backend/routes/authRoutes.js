import express from "express";
import { register, login, logout } from "../controllers/userController.js";

const router = express.Router();

// User Authentication Routes
router.post("/register", register); // Register & Login
router.post("/login", login); // Login
router.post("/logout", logout); // Logout

export default router;
