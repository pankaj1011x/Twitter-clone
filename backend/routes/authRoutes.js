import express from "express";
import {
  getMe,
  login,
  logout,
  signup,
} from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
