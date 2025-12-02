import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";

import cloudinary from "../../config/cloudinary.config.js";

import Comment from "../../models/Comment.js";
import Topic from "../../models/Topic.js";
import User from "../../models/User.js";

import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "../../utils/customErrors.js";

// Create comment
export const createComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { content } = req.body;
    const { topicSlug } = req.params;

    // Find the topic first
    const topicExists: any = await Topic.findOne({ slug: topicSlug });

    // Check if topic exists or is not active
    if (!topicExists || !topicExists.isActive) {
      throw new NotFoundError("Topic not found");
    }

    // Check if topic is locked
    if (topicExists.isLocked) {
      throw new ForbiddenError("This topic is locked. You can't add comments.");
    }

    // Handle image uploads
    const imageURLs: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      // Max 20 images
      if (req.files.length > 20) {
        throw new BadRequestError("Maximum 20 images per comment");
      }

      // Upload each image to Cloudinary
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "tropicario/comments",
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

    // Create comment
    const comment: any = await Comment.create({
      content,
      images: imageURLs,
      topic: topicExists._id,
      author: req.user!.id,
    });

    // Populate topic and author fields
    await comment.populate("topic", "title slug");
    await comment.populate("author", "username avatar");

    // Increment comments count in topic and update lastActivityAt
    await Topic.findByIdAndUpdate(topicExists._id, {
      $inc: { commentsCount: 1 },
      lastActivityAt: new Date(),
    });

    // Transform comment so we can modify _id to id
    const { _id, topic, author, ...rest } = comment.toJSON();

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: {
        id: _id,
        topic: {
          id: topic._id,
          slug: topic.slug,
          title: topic.title,
        },
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
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

// Get comments for a topic
export const getCommentsByTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topicSlug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "desc" ? -1 : 1;

    // Build filter
    const filter: any = {};

    // Find the topic first
    const topic = await Topic.findOne({ slug: topicSlug });

    if (!topic || !topic.isActive) {
      throw new NotFoundError("Topic not found or inactive");
    }

    filter.topic = topic._id;
    filter.isDeleted = false; // Exclude soft deleted comments
    filter.parentComment = null; // Only top-level comments

    // Build sort
    const sort: any = { isPinned: -1 }; // Pinned comments always first
    sort[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get comments for the topic and total count
    const [comments, totalItems] = await Promise.all([
      Comment.find(filter)
        .populate("author", "username avatar")
        .populate("topic", "title slug")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),

      Comment.countDocuments(filter),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalItems / limit);

    // Transform _id to id
    const transformedComments = comments.map((comment: any) => {
      const { _id, topic, author, parentComment, ...rest } = comment;
      return {
        id: _id,
        topic: {
          id: topic._id,
          slug: topic.slug,
          title: topic.title,
        },
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
        parentComment: comment.parentComment || null,
        ...rest,
      };
    });

    res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: transformedComments,
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

// Update comment
export const updateComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    // Find the comment
    const comment: any = await Comment.findById(commentId);

    if (!comment || comment.isDeleted) {
      throw new NotFoundError("Comment not found");
    }

    // Check if the user is the author of the comment or an admin
    if (
      comment.author.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      throw new ForbiddenError("You are not authorized to update this comment");
    }

    // Update the comment content
    comment.content = content;
    await comment.save();
    // Populate topic and author fields
    await comment.populate("topic", "title slug");
    await comment.populate("author", "username avatar");

    // Transform comment so we can modify _id to id
    const { _id, topic, author, ...rest } = comment.toJSON();

    res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: {
        id: _id,
        topic: {
          id: topic._id,
          slug: topic.slug,
          title: topic.title,
        },
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

// Delete comment (soft delete)
export const deleteComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;

    // Find the comment
    const comment: any = await Comment.findById(commentId);

    if (!comment || comment.isDeleted) {
      throw new NotFoundError("Comment not found");
    }

    // Check if the user is the author of the comment or an admin
    if (
      comment.author.toString() !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      throw new ForbiddenError("You are not authorized to delete this comment");
    }

    const topic: any = await Topic.findById(comment.topic);

    // Decrement comments count in topic
    if (topic) {
      await Topic.findByIdAndUpdate(topic._id, {
        $inc: { commentsCount: -1 },
      });
    }

    // Soft delete the comment
    comment.isDeleted = true;
    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Like a comment
export const likeComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    // Find comment
    const comment = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    // Check if user already liked the comment
    if (comment.usersLiked.map((id) => id.toString()).includes(userId)) {
      throw new BadRequestError("Comment already liked");
    }

    // Add user to usersLiked array and increment likesCount
    await Comment.findByIdAndUpdate(commentId, {
      $push: { usersLiked: userId },
      $inc: { likesCount: 1 },
    });

    res.status(200).json({ success: true, message: "You liked the comment" });
  } catch (error) {
    next(error);
  }
};

// Dislike a comment
export const dislikeComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;
    const userId = req.user!.id;

    // Find comment
    const comment = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    // Check if user hasn't liked the comment
    if (!comment.usersLiked.map((id) => id.toString()).includes(userId)) {
      throw new BadRequestError("Comment isn't liked");
    }

    // Remove user from usersLiked array and decrement likesCount
    await Comment.findByIdAndUpdate(commentId, {
      $pull: { usersLiked: userId },
      $inc: { likesCount: -1 },
    });

    res.status(200).json({ success: true, message: "You unliked the comment" });
  } catch (error) {
    next(error);
  }
};
