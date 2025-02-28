import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  followUnfollowUser,
  getSuggestedUsers,
  getUserProfile,
  updateProfile,
} from "../controllers/userControllers.js";
const router = express.Router();

router.use(authMiddleware);
router.get("/profile/:username", getUserProfile);
router.get("/suggested", getSuggestedUsers);
router.post("/follow/:id", followUnfollowUser);
router.post("/update", updateProfile);

export default router;
