import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";

import cloudinary from "../../config/cloudinary.config.js";

import Topic from "../../models/Topic.js";
import Thread from "../../models/Thread.js";
import User from "../../models/User.js";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../../utils/customErrors.js";
import Comment from "../../models/Comment.js";

// --------------------------
//
// PUBLIC CONTROLLERS
//
// --------------------------

// Get all topics
export const getTopics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "lastActivityAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const isActive = req.query.isActive as string;
    const threadSlug = req.query.threadSlug as string;

    // Build filter
    const filter: any = {};

    // If user is looking for active topics only
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Optional filtering by thread
    if (threadSlug) {
      const thread = await Thread.findOne({ slug: threadSlug });

      if (!thread) throw new NotFoundError("Thread not found");

      filter.thread = thread._id;
    }

    // Build sort
    const sort: any = { isPinned: -1 }; // We always want pinned first
    sort[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const [topics, totalItems] = await Promise.all([
      Topic.find(filter)
        .populate("author", "username avatar")
        .populate("thread", "title slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean(),

      Topic.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    // Transform _id to id
    const transformedTopics = topics.map((topic: any) => {
      const { _id, author, thread, ...rest } = topic;

      return {
        id: _id,
        author: author
          ? {
              id: author._id,
              username: author.username,
              avatar: author.avatar,
            }
          : null,
        thread: thread
          ? {
              id: thread._id,
              title: thread.title,
              slug: thread.slug,
            }
          : null,
        ...rest,
      };
    });

    res.status(200).json({
      success: true,
      message: "Topics retrieved successfully",
      data: transformedTopics,
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

// Get single topic by slug
export const getTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    // Find topic
    const topic: any = await Topic.findOne({ slug })
      .populate({
        path: "thread",
        select: "title slug section",
        populate: {
          path: "section",
          select: "title slug",
        },
      })
      .populate("author", "username avatar")
      .select("-__v")
      .lean();

    // If topic doesn't exist
    if (!topic || !topic.isActive) {
      throw new NotFoundError("Topic not found or inactive");
    }

    // Transform _id to id
    const { _id, author, thread, ...rest } = topic;

    // If author or thread are deleted
    if (!author || !thread) {
      throw new NotFoundError("Topic data is missing");
    }

    res.status(200).json({
      success: true,
      message: "Topic retrieved successfully",
      data: {
        id: _id,
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
        thread: {
          id: thread._id,
          title: thread.title,
          slug: thread.slug,
          section: {
            id: topic.thread.section._id,
            title: topic.thread.section.title,
            slug: topic.thread.section.slug,
          },
        },
        ...rest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------
//
// USER CONTROLLERS
//
// --------------------------

// Create topic
export const createTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content, threadSlug } = req.body;

    // Find the thread by slug
    const thread = await Thread.findOne({ slug: threadSlug });

    // Check if thread exists or not active
    if (!thread || !thread.isActive) {
      throw new NotFoundError("Thread not found or inactive");
    }

    /// Handle image uploads
    const imageURLs: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      // Max 20 images
      if (req.files.length > 20) {
        throw new BadRequestError("Maximum 20 images per topic");
      }

      // Upload each image to Cloudinary
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "tropicario/topics",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          });

          imageURLs.push(result.secure_url);

          await fs.unlink(file.path); // Remove the local copy after upload
        } catch (error) {
          // Even if the upload fails, delete the local copy
          await fs.unlink(file.path).catch(() => {});
          throw error;
        }
      }
    }

    // Create new topic
    const topic = await Topic.create({
      title,
      content,
      images: imageURLs,
      thread: thread._id,
      author: req.user!.id,
      lastActivityAt: new Date(),
    });

    // Increase topicCount in thread and set new lastActivityAt
    await Thread.findByIdAndUpdate(thread._id, {
      $inc: { topicsCount: 1 },
      lastActivityAt: new Date(),
    });

    // Increase user's topics count
    await User.findByIdAndUpdate(req.user!.id, {
      $inc: { postsCount: 1 },
    });

    // Transform _id to id
    const { _id, ...rest } = topic.toJSON();

    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: {
        id: _id,
        ...rest,
      },
    });
  } catch (error) {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        await fs.unlink(file.path).catch(() => {});
      }
    }

    next(error);
  }
};

// Update topic (if user is author)
export const updateTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body;

    // Find topic
    const topic: any = await Topic.findOne({ slug })
      .populate("author", "username avatar")
      .populate("thread", "title slug");

    // Check if topic doesn't exist
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }

    // Check if user is authorized to change
    if (
      topic.author._id.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      throw new ForbiddenError("You are not authorized to modify this post");
    }

    // Update topic
    if (title !== undefined) topic.title = title;
    if (content !== undefined) topic.content = content;
    await topic.save();

    const transformedTopic = topic.toJSON();

    // Transform _id to id
    const { _id, author, thread, ...rest } = transformedTopic;

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: {
        id: _id,
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
        thread: {
          id: thread._id,
          title: thread.title,
          slug: thread.slug,
        },
        ...rest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete topic (if user is author)
export const deleteTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    // Find topic
    const topic = await Topic.findOne({ slug });

    // Check if topic exists
    if (!topic || !topic.isActive) {
      throw new NotFoundError("Topic not found or inactive");
    }

    // Check authorization
    if (
      req.user!.id.toString() !== topic.author.toString() &&
      req.user!.role !== "admin"
    ) {
      throw new ForbiddenError("You are not allowed to delete this topic");
    }

    // Delete all comments from the topic together with topic and decrement topicsCount from thread
    await Promise.all([
      Comment.deleteMany({ topic: topic._id }),
      Topic.findByIdAndDelete(topic._id),
      Thread.findByIdAndUpdate(topic.thread, { $inc: { topicsCount: -1 } }),
    ]);

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
