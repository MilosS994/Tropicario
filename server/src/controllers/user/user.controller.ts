import { Request, Response, NextFunction } from "express";
import cloudinary from "../../config/cloudinary.config.js";
import User from "../../models/User.js";
import Topic from "../../models/Topic.js";
import Comment from "../../models/Comment.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/customErrors.js";

// Get user public profile
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username } = req.params;

    // Find user
    const user = await User.findOne({ username }).select(
      "username avatar fullName bio location role createdAt lastActive postsCount"
    );

    // Check if user doesn't exist
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get user stats for comments count because we don't have it in model
    const commentsCount = await Comment.countDocuments({
      author: user._id,
      isDeleted: false,
    });

    const { _id, ...rest } = user.toJSON();

    res.status(200).json({
      success: true,
      message: "User profile fetched successfully",
      data: {
        id: _id,
        ...rest,
        commentsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update user details
export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, fullName, age, location, bio } = req.body;

    // Update data
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (age !== undefined) updateData.age = age;
    if (location !== undefined) updateData.location = location;
    if (bio !== undefined) updateData.bio = bio;

    // Update user
    const user = await User.findByIdAndUpdate(req.user!.id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-__v")
      .lean();

    const { _id, ...rest } = user as any; // so we can return id instead of _id in response

    res.status(200).json({
      success: true,
      message: "User info updated successfully",
      data: { id: _id, ...rest },
    });
  } catch (error) {
    next(error);
  }
};

// Disable account (soft delete)
export const disableAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;
    // Find user
    const user: any = await User.findById(req.user!.id).select("+password");

    // Check if passwords match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Incorrect password");
    }

    // Check user status before update
    if (user.status === "disabled") {
      throw new BadRequestError("Your account is already disabled");
    }

    // Anonimize data (soft delete)
    user.status = "disabled";
    user.username = `deleted_user_${user._id}`;
    user.email = `deleted_${user._id}@deleted.com`;
    user.fullName = undefined;
    user.avatar = "";
    user.age = undefined;
    user.location = undefined;
    user.bio = undefined;

    // Save changes
    await user.save();

    // Logout
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Your account has been disabled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Upload avatar
export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if there is a file attached
    if (!req.file) {
      throw new BadRequestError("Please upload an image file");
    }

    // Find user
    const user: any = await User.findById(req.user!.id);

    // Delete old avatar from Cloudinary (if exists)
    if (user.avatar) {
      // Extract public_id from URL
      const publicId = user.avatar.split("/").pop()?.split(".")[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`tropicario/avatars/${publicId}`);
      }
    }

    // Upload
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "tropicario/avatars",
      transformation: [
        { width: 200, height: 200, crop: "fill", gravity: "face" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    // Delete temp file from disk
    const fs = await import("fs");
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });

    // Update user avatar URL
    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
