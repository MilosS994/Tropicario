import { Request, Response, NextFunction } from "express";
import User from "../../models/User.js";
import { emailService } from "../../services/email.service.js";
import {
  BadRequestError,
  NotFoundError,
  TooManyRequestsError,
} from "../../utils/customErrors.js";

export const resendVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      throw new NotFoundError("User with this email does not exist");
    }

    // Check if user is already verified
    if (user.isVerified) {
      throw new BadRequestError("Email is already verified");
    }

    // Rate limiting - we don't let more than 1 email per hour
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires.getTime() > Date.now() + 23 * 60 * 60 * 1000
    ) {
      throw new TooManyRequestsError(
        "Please wait before requesting another verification email"
      );
    }

    // Generate new token
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send email
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (error) {
      delete user.emailVerificationToken;
      delete user.emailVerificationExpires;
      await user.save({ validateBeforeSave: false });

      throw new Error(
        "Failed to send verification email. Please try again later."
      );
    }

    res.json({
      success: true,
      message: "Verification email sent successfully. Please check your inbox.",
    });
  } catch (error) {
    next(error);
  }
};
