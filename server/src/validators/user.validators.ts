import { body } from "express-validator";
import validate from "../middlewares/validate.middleware.js";

// Create user (register) validators
export const createUserValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 2, max: 55 })
    .withMessage("Username must be between 2 and 55 characters long"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)"
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),

  validate,
];

// Login user validators
export const loginUserValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .toLowerCase(),

  body("password").notEmpty().withMessage("Password is required"),

  validate,
];

// Update user validator
export const updateUserValidator = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 2, max: 55 })
    .withMessage("Username must be between 2 and 55 characters long")
    .matches(RegExp(/^[\w-]+$/))
    .withMessage(
      "Username can only contain letters, numbers, hyphens and underscores"
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("fullName")
    .optional()
    .trim()
    .isLength({ max: 75 })
    .withMessage("Full name can't be more than 75 characters long"),

  body("age")
    .optional()
    .isInt({ min: 13, max: 120 })
    .withMessage("Age must be a number between 13 and 120"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 125 })
    .withMessage("Location can't be more than 75 characters long"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio can't be more than 500 characters long"),

  validate,
];

// Disable user account validator
export const disableUserAccountValidator = [
  body("password")
    .notEmpty()
    .withMessage("Password is required to disable your account"),

  validate,
];
