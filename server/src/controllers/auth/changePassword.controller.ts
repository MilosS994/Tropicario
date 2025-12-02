import { Request, Response, NextFunction } from "express";
import User from "../../models/User.js";
import { NotFoundError, BadRequestError } from "../../utils/customErrors.js";
import "dotenv/config";

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if user is logged in and retrieve password only
    const user = await User.findById(req.user!.id).select("+password");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if current password matches the one from database
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      throw new BadRequestError("Old password does not match");
    }

    // Save new pasword to database and hash it
    user.password = newPassword;
    await user.save();

    // Logout user after change (clear cookies)
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Redirecting to login page.",
    });
  } catch (error) {
    next(error);
  }
};
