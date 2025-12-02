import { Request, Response, NextFunction } from "express";
import "dotenv/config";

export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Remove the auth token from the cookies
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};
