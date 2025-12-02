import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { UnauthorizedError } from "../utils/customErrors.js";
import "dotenv/config";

// Extend Express Request type so it has user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

interface JWTPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw new UnauthorizedError("Not authenticated. Please login.");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    // If exists, check his/her status
    if (user.status === "banned") {
      throw new UnauthorizedError("Your account has been banned");
    }

    if (user.status === "disabled") {
      throw new UnauthorizedError("Your account has been disabled");
    }

    // Add user info to request
    req.user = {
      id: String(user._id),
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError("Invalid token"));
    }

    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError("Token expired. Please login again."));
    }

    next(error);
  }
};
