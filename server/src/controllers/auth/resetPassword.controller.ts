import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User from "../../models/User.js";
import { BadRequestError } from "../../utils/customErrors.js";

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    // Hash token
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken!)
      .digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      throw new BadRequestError(
        "Password reset token is invalid or has expired"
      );
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    // Remove token fields with unset
    await User.findByIdAndUpdate(user._id, {
      $unset: {
        passwordResetToken: "",
        passwordResetExpires: "",
      },
    });

    res.json({
      success: true,
      message:
        "Password reset successful. You can now login with your new password.",
    });
  } catch (error) {
    next(error);
  }
};
