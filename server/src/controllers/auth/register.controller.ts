import { Request, Response, NextFunction } from "express";
import "dotenv/config";

import { authService } from "../../services/auth.service.js";
import { emailService } from "../../services/email.service.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    // Call registerUser service
    const { user, token } = await authService.registerUser(
      username,
      email,
      password
    );

    // Generate user verification token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (error) {
      delete user.emailVerificationToken;
      delete user.emailVerificationExpires;
      await user.save({ validateBeforeSave: false });

      console.error("Failed to send verification email:", error);
    }

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
