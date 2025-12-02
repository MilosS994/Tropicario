import express from "express";
import { register } from "../../controllers/auth/register.controller.js";
import { login } from "../../controllers/auth/login.controller.js";
import { logout } from "../../controllers/auth/logout.controller.js";
import { getMe } from "../../controllers/auth/getMe.controller.js";
import { verifyEmail } from "../../controllers/auth/verifyEmail.controller.js";
import { resendVerification } from "../../controllers/auth/resendVerification.controller.js";
import { changePassword } from "../../controllers/auth/changePassword.controller.js";
import { forgotPassword } from "../../controllers/auth/forgotPassword.controller.js";
import { showResetPasswordForm } from "../../controllers/auth/showResetPasswordForm.controller.js";
import { resetPassword } from "../../controllers/auth/resetPassword.controller.js";
import * as userValidators from "../../validators/user.validators.js";
import * as passwordValidators from "../../validators/password.validator.js";
import { resendVerificationValidator } from "../../validators/email.validators.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import {
  authLimiter,
  registerLimiter,
} from "../../middlewares/rateLimiter.middleware.js";

const router = express.Router();

//
// -------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------
//

// REGISTER USER ROUTE
router.post(
  "/register",
  registerLimiter,
  userValidators.createUserValidator,
  register
);
// LOGIN USER ROUTE
router.post("/login", authLimiter, userValidators.loginUserValidator, login);
// VERIFY EMAIL ROUTE
router.get("/verify-email/:token", verifyEmail);
// RESEND VERIFICATION ROUTE
router.post(
  "/resend-verification",
  authLimiter,
  resendVerificationValidator,
  resendVerification
);
// FORGOT PASSWORD ROUTE
router.post(
  "/forgot-password",
  authLimiter,
  passwordValidators.forgotPasswordValidator,
  forgotPassword
);
// SHOW RESET PASSWORD FORM
router.get(
  "/reset-password/:resetToken",
  passwordValidators.resetTokenValidator,
  showResetPasswordForm
);
// RESET PASSWORD
router.post(
  "/reset-password/:resetToken",
  passwordValidators.resetTokenValidator,
  passwordValidators.resetPasswordValidator,
  resetPassword
);

//
// -------------------------------------------
// PROTECTED ROUTES
// -------------------------------------------
//

// LOGOUT USER ROUTE
router.post("/logout", authMiddleware, logout);
// GET ME ROUTE (GET USER INFO)
router.get("/me", authMiddleware, getMe);
// CHANGE PASSWORD ROUTE
router.post(
  "/change-password",
  authMiddleware,
  passwordValidators.changePasswordValidator,
  changePassword
);

export default router;
