import { body, param, query } from "express-validator";
import validate from "../middlewares/validate.middleware.js";

// Create section validator
export const createSectionValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 2, max: 55 })
    .withMessage("Section title must be between 2 and 55 characters long"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Section description can't be more than 255 characters long"),

  validate,
];

// Get sections validator
export const getSectionsValidator = [
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
    .isIn(["order", "createdAt", "title", "threadsCount"])
    .withMessage("Invalid sortBy field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),

  query("isActive")
    .optional()
    .isIn(["true", "false", "all"])
    .withMessage("isActive must be: true, false, or all"),

  validate,
];

// Get section validator
export const getSectionBySlugValidator = [
  param("slug")
    .trim()
    .notEmpty()
    .withMessage("Section slug is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Section slug must be between 1 and 100 characters"),

  validate,
];

// Update section validator
export const updateSectionValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 55 })
    .withMessage("Section title must be between 2 and 55 characters long"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Section description can't be more than 255 characters long"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Order must be a non-negative integer"),

  param("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID format"),

  validate,
];

// Delete section validator
export const deleteSectionValidator = [
  param("sectionId")
    .notEmpty()
    .withMessage("Section ID is required")
    .isMongoId()
    .withMessage("Invalid Section ID format"),

  validate,
];
