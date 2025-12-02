import express from "express";

import * as threadControllers from "../../controllers/thread/thread.controller.js";

import * as threadValidators from "../../validators/thread.validators.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";

const router = express.Router();

// ---------------------------------------------------------------------------------
//
// PUBLIC ROUTES
//
// ---------------------------------------------------------------------------------

// GET THREADS ROUTE
router.get(
  "/",
  threadValidators.getThreadsValidator,
  threadControllers.getThreads
);

// GET THREAD ROUTE
router.get(
  "/:slug",
  threadValidators.getThreadValidator,
  threadControllers.getThread
);

// ---------------------------------------------------------------------------------
//
// ADMIN ROUTES
//
// ---------------------------------------------------------------------------------

// CREATE THREAD ROUTE
router.post(
  "/",
  authMiddleware,
  isAdmin,
  threadValidators.createThreadValidator,
  threadControllers.createThread
);

// UPDATE THREAD ROUTE
router.patch(
  "/:threadId",
  authMiddleware,
  isAdmin,
  threadValidators.updateThreadValidator,
  threadControllers.updateThread
);

// DELETE THREAD ROUTE
router.delete(
  "/:threadId",
  authMiddleware,
  isAdmin,
  threadValidators.deleteThreadValidator,
  threadControllers.deleteThread
);
export default router;
