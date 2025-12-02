import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../../models/User.js";
import { emailService } from "../../services/email.service.js";
import "dotenv/config";
import { TooManyRequestsError } from "../../utils/customErrors.js";

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.json({
        success: true,
        message:
          "If that email exists, we sent a password reset link. Please check your inbox.",
      });
    }

    // Rate limiting - check if email was already sent
    if (
      user.passwordResetExpires &&
      user.passwordResetExpires.getTime() > Date.now()
    ) {
      throw new TooManyRequestsError(
        "Password reset email was already sent. Please check your inbox or wait 10 minutes."
      );
    }

    // Create password reset token
    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send an email with reset link to user
    try {
      await emailService.sendResetLink(user, token);
    } catch (error) {
      delete user.passwordResetToken;
      delete user.passwordResetExpires;
      await user.save({ validateBeforeSave: false });

      throw new Error(
        "Failed to send an email with reset link. Please try again later."
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Reset link sent. Check your email." });
  } catch (error) {
    next(error);
  }
};
