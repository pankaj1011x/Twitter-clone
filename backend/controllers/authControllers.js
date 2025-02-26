import { generateTokenandsetCookies } from "../lib/utils/generateToken.js";
import User from "../model/userModel.js";
import { loginSchema, signupSchema } from "../validations/userValidations.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }

    const { fullname, username, email, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "User is already taken",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        error: "email is already taken",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullname,
      username,
      email,
      password: hashedPassword,
    });
    console.log(newUser);
    if (newUser) {
      generateTokenandsetCookies(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json({
        error: "invalid user data",
      });
    }
  } catch (err) {
    console.log("error in signup controller", err);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.format() });
    }
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    const ispasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !ispasswordCorrect) {
      return res.status(400).json({
        error: "invalid username or password",
      });
    }
    generateTokenandsetCookies(user._id, res);
    res.status(201).json({
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
    });
  } catch (err) {
    console.log("error in login controller", err);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ msg: "logged out successfully" });
  } catch (err) {
    console.log("error in logout controller", err);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("error in getMe controllers", error.message);
    res.status(500).json({
      msg: "Internal server error",
    });
  }
};
