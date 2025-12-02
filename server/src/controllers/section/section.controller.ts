import { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../../utils/customErrors.js";
import Section from "../../models/Section.js";

// -------------------------------------------------------------------------------------
//
// PUBLIC CONTROLLERS
//
// -------------------------------------------------------------------------------------

// Get sections
export const getSections = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "order";
    const sortOrder = (req.query.order as string) === "desc" ? -1 : 1;
    const isActive = req.query.isActive as string;

    // Create a filter
    const filter: any = {};

    // If admin is looking for active sections only
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Sort filter
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const [sections, totalItems] = await Promise.all([
      Section.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("author", "username avatar")
        .lean(),

      Section.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const transformedSections = sections.map((section: any) => {
      const { _id, author, ...rest } = section;
      return {
        id: _id,
        author:
          author && typeof author === "object" && "_id" in author
            ? {
                id: author._id,
                username: author.username,
                avatar: author.avatar,
              }
            : author,
        ...rest,
      };
    });

    res.status(200).json({
      success: true,
      message: "Sections retrieved successfully",
      data: transformedSections,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get section by slug
export const getSectionBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const section: any = await Section.findOne({ slug })
      .populate("author", "username avatar")
      .select("-__v")
      .lean();

    // Check if section exists
    if (!section) {
      throw new NotFoundError("Section not found");
    }

    const { _id, author, ...rest } = section; // so we can change _id to id in section and also within the populated author

    res.status(200).json({
      success: true,
      message: "Section retrieved successfully",
      data: {
        id: _id,
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
        ...rest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------------------------------
//
// ADMIN CONTROLLERS
//
// -------------------------------------------------------------------------------------

// Create new section
export const createSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description } = req.body;

    const section = await Section.create({
      title,
      description,
      author: req.user!.id,
    });

    const { _id, ...rest } = section.toJSON(); // So we can change _id to id

    res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: { id: _id, ...rest },
    });
  } catch (error) {
    next(error);
  }
};

// Update an existing section
export const updateSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, isActive, order } = req.body;
    const { sectionId } = req.params;

    // Update data dinamically
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (order !== undefined) updateData.order = order;

    // Find section
    const section: any = await Section.findById(sectionId).populate(
      "author",
      "username avatar"
    );

    // Check if section doesn't exist
    if (!section) {
      throw new NotFoundError("Section not found");
    }

    // Update fields
    if (title !== undefined) section.title = title;
    if (description !== undefined) section.description = description;
    if (isActive !== undefined) section.isActive = isActive;
    if (order !== undefined) section.order = order;

    // Save section
    await section.save(); // we want to trigger pre save hook and generate new slug, that is why we don't use findByIdAndUpdate

    const sectionObj = section.toJSON();
    const { _id, author, ...rest } = sectionObj; // Transform to object

    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: {
        id: _id,
        author: author
          ? {
              id: author._id,
              username: author.username,
              avatar: author.avatar,
            }
          : null,
        ...rest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete section
export const deleteSection = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sectionId } = req.params;

    // Delete section
    const section = await Section.findByIdAndDelete(sectionId);

    // Check if section exists
    if (!section) {
      throw new NotFoundError("Section not found");
    }

    res
      .status(200)
      .json({ success: true, message: "Section deleted successfully" });
  } catch (error) {
    next(error);
  }
};
