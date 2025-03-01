import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  commentOnPost,
  createPosts,
  deletePosts,
  getAllPosts,
  getLikedPosts,
  likeUnlikePosts,
} from "../controllers/postControllers.js";
const router = express.Router();

router.use(authMiddleware);
router.get("/all", getAllPosts);
router.get("/likes/:id", getLikedPosts);
router.post("/create", createPosts);
router.post("/like/:id", likeUnlikePosts);
router.post("/comment/:id", commentOnPost);
router.delete("/:id", deletePosts);

export default router;
