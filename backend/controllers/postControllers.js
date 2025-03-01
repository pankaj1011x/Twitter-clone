import User from "../model/userModel.js";
import Post from "../model/postModel.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../model/notificationModel.js";

export const createPosts = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: "user not found",
      });
    }

    if (!text && !img) {
      return res.status(400).json({ error: "post must have text or img" });
    }

    if (img) {
      const uploadResponse = cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
    console.log("error in createPosts controller:", err.message);
  }
};

export const deletePosts = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ msg: "you are not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.spilt("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "post deleted successfully",
    });
  } catch (err) {
    console.log("Error in deletePost controller", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    if (!text) {
      return res.status(400).json({
        error: "Text field is required",
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.staus(404).json({
        message: "Post not found",
      });
    }

    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    res.status(200).json(post);
  } catch (err) {
    console.log("Error in commentOnPost controller:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const likeUnlikePosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        error: "post not found",
      });
    }
    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      post.likes.push(userId);
      await User.updateOne(
        { _id: userId },
        {
          $push: {
            likedPosts: postId,
          },
        }
      );
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });

      await notification.save();
      res.status(200).json({
        message: "Post liked successfully",
      });
    }
  } catch (err) {
    console.log("Error in likeUnlike controller:", err.message);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(200).json({
        error: [],
      });
    }
    res.status(200).json(posts);
  } catch (err) {
    console.log("Error in getAllPosts controller", err);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log("Error in getLikedPosts controller: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
