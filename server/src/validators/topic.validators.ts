import { body, param, query } from "express-validator";
import validate from "../middlewares/validate.middleware.js";

// Create topic validator
export const createTopicValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Topic title is required")
    .isLength({ min: 3, max: 175 })
    .withMessage("Topic title must be between 3 and 175 characters long"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Topic content is required")
    .isLength({ min: 1, max: 1750 })
    .withMessage("Topic content must be between 1 and 1750 characters long"),

  body("threadSlug").trim().notEmpty().withMessage("Thread slug is required"),

  validate,
];

// Get all topics validator
export const getTopicsValidator = [
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
    .isIn([
      "title",
      "thread",
      "slug",
      "commentsCount",
      "isActive",
      "isPinned",
      "isLocked",
      "lastActivityAt",
      "createdAt",
      "updatedAt",
    ])
    .withMessage("Invalid sortBy field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),

  query("threadSlug")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Thread slug cannot be empty"),

  validate,
];

// Get single topic validator
export const getTopicValidator = [
  param("slug").trim().notEmpty().withMessage("Topic slug is required"),
  validate,
];

// Update topic validator
export const updateTopicValidator = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 175 })
    .withMessage("Topic title must be between 3 and 175 characters long"),

  body("content")
    .optional()
    .trim()
    .isLength({ min: 1, max: 1750 })
    .withMessage("Topic content must be between 1 and 1750 characters long"),

  validate,
];

// Delete topic validator
export const deleteTopicValidator = [
  param("slug").trim().notEmpty().withMessage("Topic slug is required"),

  validate,
];
