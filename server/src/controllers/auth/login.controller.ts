import { Request, Response, NextFunction } from "express";
import "dotenv/config";

import { authService } from "../../services/auth.service.js";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Call loginUser service
    const { user, token } = await authService.loginUser(email, password);

    // Set cookies
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Login successfull",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};
