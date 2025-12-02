import { Request, Response, NextFunction } from "express";
import Section from "../../models/Section.js";
import Thread from "../../models/Thread.js";
import { BadRequestError, NotFoundError } from "../../utils/customErrors.js";

// -------------------------------------------------------------------------------------
//
// PUBLIC CONTROLLERS
//
// -------------------------------------------------------------------------------------

// Get all threads by section
export const getThreads = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "order";
    const sortOrder = (req.query.sortOrder as string) === "desc" ? -1 : 1;
    const isActive = req.query.isActive as string;
    const sectionSlug = req.query.sectionSlug as string;

    // Build filter
    const filter: any = {};

    // If only active threads are wanted
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Optional filtering by section
    if (sectionSlug) {
      const section = await Section.findOne({ slug: sectionSlug });

      if (!section) {
        throw new NotFoundError("Section not found");
      }

      filter.section = section._id;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const [threads, totalItems] = await Promise.all([
      Thread.find(filter)
        .populate("author", "username avatar")
        .populate("section", "title slug")
        .sort(sort)
        .skip(skip)
        .limit(limit),

      Thread.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // Transform _id to id
    const transformedThreads = threads.map((thread: any) => {
      const { _id, author, section, ...rest } = thread.toJSON();

      return {
        id: _id,
        author: author
          ? {
              id: author._id,
              username: author.username,
              avatar: author.avatar,
            }
          : null,

        section: section
          ? {
              id: section._id,
              title: section.title,
              slug: section.slug,
            }
          : null,
        ...rest,
      };
    });

    res.status(200).json({
      success: true,
      message: "Threads retrieved successfully",
      data: transformedThreads,
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

// Get thread by slug
export const getThread = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    // Find thread by slug
    const thread: any = await Thread.findOne({ slug })
      .populate("author", "username avatar")
      .populate("section", "title slug")
      .select("-__v")
      .lean();

    // Check if thread exists
    if (!thread) {
      throw new NotFoundError("Thread not found");
    }

    // Transform _id to id
    const { _id, author, section, ...rest } = thread;

    // Check if author or section are deleted
    if (!author || !section) {
      throw new NotFoundError("Thread data is missing");
    }

    res.status(200).json({
      success: true,
      message: "Thread retrieved successfully",
      data: {
        id: _id,
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
        section: {
          id: section._id,
          title: section.title,
          slug: section.slug,
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

// Create a thread
export const createThread = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, sectionSlug, order } = req.body;

    // Find section by slug
    const section = await Section.findOne({ slug: sectionSlug });

    // Check if thread with the same title exists
    const threadExists = await Thread.findOne({ title });
    if (threadExists) {
      throw new BadRequestError("Thread with the same title already exists");
    }

    // Check if section exists
    if (!section) {
      throw new NotFoundError("Section not found");
    }

    const thread = await Thread.create({
      title,
      description,
      author: req.user!.id,
      section: section._id,
      order: order || 0,
    });

    // Increase threadsCount in section
    section.threadsCount++;
    await section.save();

    // Transform _id to id
    const { _id, ...rest } = thread.toJSON();

    res.status(201).json({
      success: true,
      message: "Thread created successfully",
      data: { id: _id, ...rest },
    });
  } catch (error) {
    next(error);
  }
};

// Update a thread
export const updateThread = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { threadId } = req.params;
    const { title, description, order, isActive } = req.body;

    // Find thread
    const thread: any = await Thread.findById(threadId);

    // Check if thread exists
    if (!thread) {
      throw new NotFoundError("Thread not found");
    }

    // Data to update
    if (title !== undefined) thread.title = title;
    if (description !== undefined) thread.description = description;
    if (order !== undefined) thread.order = order;
    if (isActive !== undefined) thread.isActive = isActive;

    // We want to trigger pre save hook to change slug
    await thread.save();

    // Populate for response
    await thread.populate("author", "username avatar");
    await thread.populate("section", "title slug");

    const transformedThread = thread.toJSON();

    // So we can transform _id to id
    const { _id, author, section, ...rest } = transformedThread;

    res.status(200).json({
      success: true,
      message: "Thread updated successfully",
      data: {
        id: _id,
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
        section: {
          id: section._id,
          title: section.title,
          slug: section.slug,
        },
        ...rest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete thread
export const deleteThread = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { threadId } = req.params;

    // Find thread and delete it
    const thread = await Thread.findByIdAndDelete(threadId);

    // Check if thread exists
    if (!thread) {
      throw new NotFoundError("Error not found");
    }

    res
      .status(200)
      .json({ success: true, message: "Thread deleted successfully" });
  } catch (error) {
    next(error);
  }
};
