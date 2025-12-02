import express from "express";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

import * as topicControllers from "../../controllers/topic/topic.controller.js";

import * as topicValidators from "../../validators/topic.validators.js";

const router = express.Router();

// ---------------------------------
//
// PUBLIC ROUTES
//
// ---------------------------------

// GET ALL TOPICS ROUTE
router.get("/", topicValidators.getTopicsValidator, topicControllers.getTopics);

// GET SINGLE TOPIC ROUTE
router.get(
  "/:slug",
  topicValidators.getTopicValidator,
  topicControllers.getTopic
);

// ---------------------------------
//
// USER ROUTES
//
// ---------------------------------

// CREATE TOPIC ROUTE
router.post(
  "/",
  authMiddleware,
  upload.array("image", 20),
  topicValidators.createTopicValidator,
  topicControllers.createTopic
);

// UPDATE TOPIC ROUTE
router.patch(
  "/:slug",
  authMiddleware,
  topicValidators.updateTopicValidator,
  topicControllers.updateTopic
);

// DELETE TOPIC
router.delete(
  "/:slug",
  authMiddleware,
  topicValidators.deleteTopicValidator,
  topicControllers.deleteTopic
);

export default router;
