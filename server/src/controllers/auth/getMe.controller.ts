import { Request, Response, NextFunction } from "express";
import User from "../../models/User.js";
import { NotFoundError } from "../../utils/customErrors.js";
import "dotenv/config";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { lastActive: new Date() },
      { new: true }
    )
      .select("-__v")
      .lean();

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { _id, ...rest } = user;

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: { id: _id, ...rest },
    });
  } catch (error) {
    next(error);
  }
};
