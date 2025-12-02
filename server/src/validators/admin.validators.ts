import { param, query, body } from "express-validator";
import validate from "../middlewares/validate.middleware.js";

// Get all users validator
export const getUsersValidator = [
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
      "createdAt",
      "lastActive",
      "postsCount",
      "username",
      "email",
      "fullName",
      "isVerified",
    ])
    .withMessage("Invalid sortBy field"),

  query("status")
    .optional()
    .isIn(["active", "banned", "disabled", "all"])
    .withMessage("Status must be: active, banned, disabled, or all"),

  query("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role must be: user or admin"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Search query must be between 1 and 50 characters"),

  validate,
];

// Get user by id validator
export const getUserValidator = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid Mongo ID format"),

  validate,
];

// Ban user validator
export const banUserValidator = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid Mongo ID format"),

  validate,
];

// Unban user validator
export const unbanUserValidator = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid Mongo ID format"),

  validate,
];

// Delete user validator
export const deleteUserValidator = [
  param("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .isMongoId()
    .withMessage("Invalid Mongo ID format"),

  validate,
];

// Topic slug validator
export const topicSlugValidator = [
  param("slug").trim().notEmpty().withMessage("Topic slug is required"),
  validate,
];

// Comment ID validator for pinning/unpinning
export const commentIdValidator = [
  param("commentId")
    .notEmpty()
    .withMessage("Comment ID is required")
    .isMongoId()
    .withMessage("Invalid Mongo ID format"),
  validate,
];

// Move topic validator
export const moveTopicValidator = [
  param("slug").trim().notEmpty().withMessage("Topic slug is required"),

  body("newThreadId")
    .notEmpty()
    .withMessage("New thread ID is required")
    .isMongoId()
    .withMessage("Invalid Thread ID format"),

  validate,
];

// Move thread validator
export const moveThreadValidator = [
  param("slug").trim().notEmpty().withMessage("Thread slug is required"),

  body("newSectionId")
    .trim()
    .notEmpty()
    .withMessage("New section ID is required")
    .isMongoId()
    .withMessage("Invalid section ID format"),

  validate,
];
