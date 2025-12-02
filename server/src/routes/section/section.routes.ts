import express from "express";

import * as sectionControllers from "../../controllers/section/section.controller.js";

import * as sectionValidators from "../../validators/section.validators.js";

import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { isAdmin } from "../../middlewares/isAdmin.middleware.js";

const router = express.Router();

// ---------------------------------------------------------------------------------
//
// PUBLIC ROUTES
//
// ---------------------------------------------------------------------------------

// Get all sections
router.get(
  "/",
  sectionValidators.getSectionsValidator,
  sectionControllers.getSections
);

// Get single section by slug
router.get(
  "/:slug",
  sectionValidators.getSectionBySlugValidator,
  sectionControllers.getSectionBySlug
);

// ---------------------------------------------------------------------------------
//
// ADMIN ROUTES
//
// ---------------------------------------------------------------------------------

// Create new section
router.post(
  "/",
  authMiddleware,
  isAdmin,
  sectionValidators.createSectionValidator,
  sectionControllers.createSection
);

// Update an existing section
router.patch(
  "/:sectionId",
  authMiddleware,
  isAdmin,
  sectionValidators.updateSectionValidator,
  sectionControllers.updateSection
);

// Delete section
router.delete(
  "/:sectionId",
  authMiddleware,
  isAdmin,
  sectionValidators.deleteSectionValidator,
  sectionControllers.deleteSection
);

export default router;
