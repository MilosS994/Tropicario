import { Request, Response, NextFunction } from "express";
import User from "../../models/User.js";
import Section from "../../models/Section.js";
import Thread from "../../models/Thread.js";
import Topic from "../../models/Topic.js";
import Comment from "../../models/Comment.js";
import { BadRequestError, NotFoundError } from "../../utils/customErrors.js";

// -----------------------
//
// USERS
//
// -----------------------

// Get all users
export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "desc" ? -1 : 1;
    const status = req.query.status as string;
    const role = req.query.role as string;
    const search = req.query.search as string;

    const filter: any = {};
    if (status && status !== "all") filter.status = status;
    if (role && (role === "user" || role === "admin")) filter.role = role;

    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }

    // Sort filter
    const sort: any = {};
    sort[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (page - 1) * limit;

    const [users, totalItems] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(limit),

      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    const transformedUsers = users.map((user: any) => {
      const { _id, ...rest } = user.toJSON();
      return {
        id: _id,
        ...rest,
      };
    });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: transformedUsers,
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

// Get user by ID
export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Find user by id
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { _id, ...rest } = user.toJSON(); // so we can change _id to id in json response

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: { id: _id, ...rest },
    });
  } catch (error) {
    next(error);
  }
};

// Ban user
export const banUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId).select("username role status");

    // Check if user exists
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if user is an admin (can't ban another admin)
    if (user.role === "admin") {
      throw new BadRequestError(
        `You can not ban another admin - ${user.username}`
      );
    }

    // Check user status
    if (user.status === "banned") {
      throw new BadRequestError("User is already banned");
    }

    if (user.status === "disabled") {
      throw new BadRequestError("You can not ban a user with disabled account");
    }

    // Ban user
    user.status = "banned";
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.username} has been banned successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Unban user
export const unbanUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Find user
    const user = await User.findById(userId).select("username status");

    // Check if user exists
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check user status
    if (user.status !== "banned") {
      throw new BadRequestError(`User ${user.username} is not banned`);
    }

    // Unban user
    user.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.username} has been unbanned successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (soft delete)
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Find user
    const user: any = await User.findById(userId);

    // CHeck if user exists
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if user is an admin (can't delete another admin)
    if (user.role === "admin") {
      throw new BadRequestError(
        `You can not delete another admin - ${user.username}`
      );
    }

    // Check if user is already disabled
    if (user.status === "disabled") {
      throw new BadRequestError(`User ${user.username} is already disabled`);
    }

    // Anonimize data (soft delete)
    user.status = "disabled";
    user.username = `deleted_user_${user._id}`;
    user.email = `deleted_${user._id}@deleted.com`;
    user.fullName = undefined;
    user.avatar = "";
    user.age = undefined;
    user.location = undefined;
    user.bio = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------
//
// THREADS
//
// -----------------------

// Move thread
export const moveThread = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { newSectionId } = req.body;

    // Find thread
    const thread: any = await Thread.findOne({ slug });

    // Check if thread doesnt exist or closed
    if (!thread || !thread.isActive) {
      throw new NotFoundError("Thread not found or inactive");
    }

    // Find new section
    const newSection: any = await Section.findById(newSectionId);

    // Check if new section exists or inactive
    if (!newSection || !newSection.isActive) {
      throw new NotFoundError("Target section not found or inactive");
    }

    // Check if already in that section
    if (thread.section.toString() === newSectionId) {
      throw new BadRequestError("Thread is already in this section");
    }

    // Find old section
    const oldSection: any = await Section.findById(thread.section);

    // Move thread
    thread.section = newSection._id;
    await thread.save();

    // Populate fields
    await thread.populate("author", "username avatar");
    await thread.populate("section", "title slug");

    // Change threadsCount in old and new sections
    await Promise.all([
      Section.findByIdAndUpdate(oldSection._id, { $inc: { threadsCount: -1 } }),
      Section.findByIdAndUpdate(newSectionId, {
        $inc: { threadsCount: 1 },
        lastActivityAt: new Date(),
      }),
    ]);

    // Transform _id to id
    const { _id, author, section, ...rest } = thread.toJSON();

    res.status(200).json({
      success: true,
      message: `Thread moved to section ${newSection.title} successfully`,
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

// -----------------------
//
// TOPICS
//
// -----------------------

// Pin topic
export const pinTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    // Find topic
    const topic: any = await Topic.findOne({ slug });

    // Check if topic doesnt exist or closed
    if (!topic || !topic.isActive) {
      throw new NotFoundError("Topic not found or inactive");
    }

    // Check if topic is already pinned
    if (topic.isPinned) {
      throw new BadRequestError("Topic is already pinned");
    }

    // Pin it
    topic.isPinned = true;
    await topic.save();

    await topic.populate("author", "username avatar");
    await topic.populate("thread", "title slug");

    // Transform _id to id
    const { _id, author, thread, ...rest } = topic.toJSON();

    res.status(200).json({
      success: true,
      message: "Topic pinned successfully",
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

// Unpin topic
export const unpinTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    // Find topic
    const topic: any = await Topic.findOne({ slug });

    // Check if topic doesnt exist or closed
    if (!topic || !topic.isActive) {
      throw new NotFoundError("Topic not found or inactive");
    }

    // Check if topic is not pinned
    if (!topic.isPinned) {
      throw new BadRequestError("This topic is not pinned");
    }

    // Unpin it
    topic.isPinned = false;
    await topic.save();

    await topic.populate("author", "username avatar");
    await topic.populate("thread", "title slug");

    // Transform _id to id
    const { _id, author, thread, ...rest } = topic.toJSON();

    res.status(200).json({
      success: true,
      message: "Topic unpinned successfully",
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

// Lock topic
export const lockTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    // Find topic
    const topic: any = await Topic.findOne({ slug });

    // Check if topic doesnt exist or closed
    if (!topic || !topic.isActive) {
      throw new NotFoundError("Topic not found or inactive");
    }

    // Check if topic is already locked
    if (topic.isLocked) {
      throw new BadRequestError("Topic is already locked");
    }

    // Lock it
    topic.isLocked = true;
    await topic.save();

    await topic.populate("author", "username avatar");
    await topic.populate("thread", "title slug");

    // Transform _id to id
    const { _id, author, thread, ...rest } = topic.toJSON();

    res.status(200).json({
      success: true,
      message: "Topic locked successfully",
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

// Unlock topic
export const unlockTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    // Find topic
    const topic: any = await Topic.findOne({ slug });

    // Check if topic doesnt exist or closed
    if (!topic || !topic.isActive) {
      throw new NotFoundError("Topic not found or inactive");
    }

    // Check if topic is not locked
    if (!topic.isLocked) {
      throw new BadRequestError("This topic is not locked");
    }

    // Unlock it
    topic.isLocked = false;
    await topic.save();

    await topic.populate("author", "username avatar");
    await topic.populate("thread", "title slug");

    // Transform _id to id
    const { _id, author, thread, ...rest } = topic.toJSON();

    res.status(200).json({
      success: true,
      message: "Topic unlocked successfully",
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

// Move topic to another thread
export const moveTopic = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;
    const { newThreadId } = req.body;

    // Find topic
    const topic: any = await Topic.findOne({ slug });

    // Check if topic doesnt exist or closed
    if (!topic || !topic.isActive) {
      throw new NotFoundError("Topic not found or inactive");
    }

    // Find new thread
    const newThread: any = await Thread.findById(newThreadId);

    // Check if new thread exists or inactive
    if (!newThread || !newThread.isActive) {
      throw new NotFoundError("Target thread not found or inactive");
    }

    // Check if already in that thread
    if (topic.thread.toString() === newThreadId) {
      throw new BadRequestError("Topic is already in this thread");
    }

    // Find old thread
    const oldThread: any = await Thread.findById(topic.thread);

    // Move topic
    topic.thread = newThread._id;
    await topic.save();

    // Populate fields
    await topic.populate("author", "username avatar");
    await topic.populate("thread", "title slug");

    // Change topicsCount in old and new threads
    await Promise.all([
      Thread.findByIdAndUpdate(oldThread._id, { $inc: { topicsCount: -1 } }),
      Thread.findByIdAndUpdate(newThreadId, {
        $inc: { topicsCount: 1 },
        lastActivityAt: new Date(),
      }),
    ]);

    // Transform _id to id
    const { _id, author, thread, ...rest } = topic.toJSON();

    res.status(200).json({
      success: true,
      message: `Topic moved to thread ${newThread.title} successfully`,
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

// -----------------------
//
// COMMENTS
//
// -----------------------

// Pin comment
export const pinComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;

    // Find comment
    const comment: any = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment || comment.isDeleted) {
      throw new NotFoundError("Comment not found");
    }

    // Check if comment is already pinned
    if (comment.isPinned) {
      throw new BadRequestError("Comment is already pinned");
    }

    // Pin it
    comment.isPinned = true;
    await comment.save();

    // Populate fields
    await comment.populate("author", "username avatar");
    await comment.populate("topic", "slug title");

    // Transform _id to id
    const { _id, author, topic, ...rest } = comment.toJSON();

    res.status(200).json({
      success: true,
      message: "Comment pinned successfully",
      data: {
        id: _id,
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
        topic: {
          id: topic._id,
          slug: topic.slug,
          title: topic.title,
        },
        ...rest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Unpin comment
export const unpinComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { commentId } = req.params;

    // Find comment
    const comment: any = await Comment.findById(commentId);

    // Check if comment exists
    if (!comment || comment.isDeleted) {
      throw new NotFoundError("Comment not found");
    }

    // Check if comment is already not pinned
    if (!comment.isPinned) {
      throw new BadRequestError("Comment is not pinned");
    }

    // Pin it
    comment.isPinned = false;
    await comment.save();

    // Populate fields
    await comment.populate("author", "username avatar");
    await comment.populate("topic", "slug title");

    // Transform _id to id
    const { _id, author, topic, ...rest } = comment.toJSON();

    res.status(200).json({
      success: true,
      message: "Comment unpinned successfully",
      data: {
        id: _id,
        author: {
          id: author._id,
          username: author.username,
          avatar: author.avatar,
        },
        topic: {
          id: topic._id,
          slug: topic.slug,
          title: topic.title,
        },
        ...rest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// -----------------------
//
// DASHBOARD STATS
//
// -----------------------

// Get dashboard stats
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [
      totalUsers,
      totalTopics,
      totalComments,
      totalSections,
      totalThreads,
      recentUsers,
      recentTopics,
    ] = await Promise.all([
      User.countDocuments(),
      Topic.countDocuments({ isDeleted: false }),
      Comment.countDocuments({ isDeleted: false }),
      Section.countDocuments(),
      Thread.countDocuments(),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("username avatar role createdAt"),
      Topic.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("author", "username avatar")
        .select("title slug createdAt"),
    ]);

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      data: {
        stats: {
          totalUsers,
          totalTopics,
          totalComments,
          totalSections,
          totalThreads,
        },
        recentUsers: recentUsers.map((u: any) => ({
          id: u._id,
          username: u.username,
          avatar: u.avatar,
          role: u.role,
          createdAt: u.createdAt,
        })),
        recentTopics: recentTopics.map((t: any) => ({
          id: t._id,
          title: t.title,
          slug: t.slug,
          author: {
            id: t.author._id,
            username: t.author.username,
            avatar: t.author.avatar,
          },
          createdAt: t.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
