import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/customErrors.js";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // If user is not an admin
    if (req.user!.role !== "admin") {
      throw new UnauthorizedError();
    }

    next();
  } catch (error) {
    next(error);
  }
};
