import express from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

import * as commentControllers from "../../controllers/comment/comment.controller.js";

import * as commentValidators from "../../validators/comment.validators.js";

const router = express.Router();

// CREATE COMMENT ROUTE
router.post(
  "/:topicSlug",
  authMiddleware,
  upload.array("image", 20),
  commentValidators.createCommentValidator,
  commentControllers.createComment
);

// GET COMMENTS BY TOPIC ROUTE
router.get(
  "/:topicSlug",
  commentValidators.getCommentsByTopicValidator,
  commentControllers.getCommentsByTopic
);

// UPDATE COMMENT ROUTE
router.patch(
  "/:commentId",
  authMiddleware,
  commentValidators.updateCommentValidator,
  commentControllers.updateComment
);

// DELETE COMMENT ROUTE (SOFT DELETE)
router.delete(
  "/:commentId",
  authMiddleware,
  commentValidators.deleteCommentValidator,
  commentControllers.deleteComment
);

// LIKE COMMENT ROUTE
router.patch(
  "/:commentId/like",
  authMiddleware,
  commentValidators.deleteCommentValidator,
  commentControllers.likeComment
);

// DISLIKE COMMENT ROUTE
router.patch(
  "/:commentId/dislike",
  authMiddleware,
  commentValidators.deleteCommentValidator,
  commentControllers.dislikeComment
);

export default router;
