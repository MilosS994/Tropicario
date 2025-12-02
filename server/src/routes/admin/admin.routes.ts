import express from "express";

import * as adminControllers from "../../controllers/admin/admin.controller.js";

import * as adminValidators from "../../validators/admin.validators.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";

const router = express.Router();

// Apply authentication and admin check to all routes in this router
router.use(authMiddleware, isAdmin);

// -----------------------
//
// USERS
//
// -----------------------

// GET USERS ROUTE
router.get(
  "/users",
  adminValidators.getUsersValidator,
  adminControllers.getUsers
);

// GET SINGLE USER BY ID ROUTE
router.get(
  "/users/:userId",
  adminValidators.getUserValidator,
  adminControllers.getUser
);

// BAN USER ROUTE
router.patch(
  "/users/:userId/ban",
  adminValidators.banUserValidator,
  adminControllers.banUser
);

// UNBAN USER ROUTE
router.patch(
  "/users/:userId/unban",
  adminValidators.unbanUserValidator,
  adminControllers.unbanUser
);

// DELETE USER ROUTE (SOFT DELETE)
router.delete(
  "/users/:userId",
  adminValidators.deleteUserValidator,
  adminControllers.deleteUser
);

// -----------------------
//
// THREADS
//
// -----------------------

// MOVE THREAD ROUTE
router.patch(
  "/threads/:slug/move",
  adminValidators.moveThreadValidator,
  adminControllers.moveThread
);

// -----------------------
//
// TOPICS
//
// -----------------------

// PIN TOPIC ROUTE
router.patch(
  "/topics/:slug/pin",
  adminValidators.topicSlugValidator,
  adminControllers.pinTopic
);

// UNPIN TOPIC ROUTE
router.patch(
  "/topics/:slug/unpin",
  adminValidators.topicSlugValidator,
  adminControllers.unpinTopic
);

// LOCK TOPIC ROUTE
router.patch(
  "/topics/:slug/lock",
  adminValidators.topicSlugValidator,
  adminControllers.lockTopic
);

// UNLOCK TOPIC ROUTE
router.patch(
  "/topics/:slug/unlock",
  adminValidators.topicSlugValidator,
  adminControllers.unlockTopic
);

// MOVE TOPIC ROUTE
router.patch(
  "/topics/:slug/move",
  adminValidators.moveTopicValidator,
  adminControllers.moveTopic
);

// -----------------------
//
// COMMENTS
//
// -----------------------

// PIN COMMENT ROUTE
router.patch(
  "/comments/:commentId/pin",
  adminValidators.commentIdValidator,
  adminControllers.pinComment
);

// UNPIN COMMENT ROUTE
router.patch(
  "/comments/:commentId/unpin",
  adminValidators.commentIdValidator,
  adminControllers.unpinComment
);

// -----------------------
//
// DASHBOARD
//
// -----------------------

// GET DASHBOARD STATS ROUTE
// GET DASHBOARD STATS
router.get("/dashboard", adminControllers.getDashboardStats);

export default router;
