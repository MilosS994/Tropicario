import { body, param, query } from "express-validator";
import validate from "../middlewares/validate.middleware.js";

// Create new comment
export const createCommentValidator = [
  param("topicSlug").trim().notEmpty().withMessage("Topic slug is required"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ max: 1750 })
    .withMessage("Comment can't be more than 1750 characters long"),

  validate,
];

// Get comments for a topic with pagination
export const getCommentsByTopicValidator = [
  param("topicSlug").trim().notEmpty().withMessage("Topic slug is required"),

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
    .isIn(["createdAt", "updatedAt", "isPinned", "likesCount"])
    .withMessage("Invalid sortBy value"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Invalid sortOrder value"),

  validate,
];

// Update comment validator
export const updateCommentValidator = [
  param("commentId")
    .trim()
    .notEmpty()
    .withMessage("Comment ID is required")
    .isMongoId()
    .withMessage("Invalid Comment ID"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Comment content is required")
    .isLength({ min: 1, max: 1750 })
    .withMessage("Comment must be between 1 and 1750 characters long"),

  validate,
];

// Delete comment validator
export const deleteCommentValidator = [
  param("commentId")
    .trim()
    .notEmpty()
    .withMessage("Comment ID is required")
    .isMongoId()
    .withMessage("Invalid Comment ID"),

  validate,
];
