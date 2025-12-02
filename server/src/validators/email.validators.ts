import { body } from "express-validator";
import validate from "../middlewares/validate.middleware.js";

export const resendVerificationValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),

  validate,
];
