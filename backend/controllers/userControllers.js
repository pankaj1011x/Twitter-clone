import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log("error in getUserProfile", err.message);
    res.status(500).json({ err: err.message });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        error: "You can't follow/unfollow each other",
      });
    }

    if (!userToModify || !currentUser) {
      return res.status(400).json({
        error: "user not found",
      });
    }
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({
        message: "User unfollowed successfully",
      });
    } else {
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      //send notification to user
      res.status(200).json({
        message: "User followed successfully",
      });
    }
  } catch (err) {
    console.log("error in getUserProfile", err.message);
    res.status(500).json({ err: err.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const userFollowedByMe = await User.findById(userId).select("following");
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filteredUser = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUser.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("error in getSuggestedUsers :", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { fullname, email, username, currentPassword, newPassword, bio, link } =
    req.body;

  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: "user not found" });
    if ((!currentPassword && newPassword) || (currentPassword && !newPassword))
      return res.status(400).json({
        error: "Please provide both current password  and new password",
      });

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "current password is incorrect" });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const profileuploadResponse = await cloudinary.uploader.upload(
        profileImg
      );
      profileImg = profileuploadResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const coveruploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = coveruploadResponse.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    user.password = null;
    return res.status(200).json(user);
  } catch (err) {
    console.log("error in updateProfile", err.message);
    res.status(500).json({
      error: err.message,
    });
  }
};
