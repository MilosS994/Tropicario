import express from "express";

import * as userControllers from "../../controllers/user/user.controller.js";

import * as userValidators from "../../validators/user.validators.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = express.Router();

// Update user info
router.patch(
  "/profile",
  authMiddleware,
  userValidators.updateUserValidator,
  userControllers.updateUser
);

// Disable user account (soft delete)
router.patch(
  "/profile/disable",
  authMiddleware,
  userValidators.disableUserAccountValidator,
  userControllers.disableAccount
);

// Upload avatar
router.patch(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  userControllers.uploadAvatar
);

// Get user public profile
router.get("/:username", userControllers.getUserProfile);

export default router;
