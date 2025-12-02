import { body, param, query } from "express-validator";
import validate from "../middlewares/validate.middleware.js";

// Create thread validator
export const createThreadValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Thread title is required")
    .isLength({ min: 3, max: 75 })
    .withMessage("Thread title must be between 3 and 75 characters long"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Thread description can't be more than 255 characters long"),

  body("sectionSlug").trim().notEmpty().withMessage("Section slug is required"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),

  validate,
];

// Get threads validator
export const getThreadsValidator = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn(["order", "createdAt", "topicsCount", "title"])
    .withMessage("Invalid sortBy field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),

  query("sectionSlug")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Section slug cannot be empty"),

  validate,
];

// Get thread by slug validator
export const getThreadValidator = [
  param("slug").trim().notEmpty().withMessage("Thread slug is required"),
  validate,
];

// Update thread validator
export const updateThreadValidator = [
  param("threadId")
    .notEmpty()
    .withMessage("Thread ID is required")
    .isMongoId()
    .withMessage("Invalid Thread ID format"),

  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 75 })
    .withMessage("Thread title must be between 3 and 75 characters long"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Thread description can't be more than 255 characters long"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a positive integer"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  validate,
];

// Delete thread validator
export const deleteThreadValidator = [
  param("threadId")
    .notEmpty()
    .withMessage("Thread ID is required")
    .isMongoId()
    .withMessage("Invalid Thread ID format"),
];
