import mongoose from "mongoose";

// Topic interface
export interface ITopic extends mongoose.Document {
  title: string;
  content: string;
  images: string[];
  thread: mongoose.Schema.Types.ObjectId;
  slug: string;
  author: mongoose.Schema.Types.ObjectId;
  commentsCount: number;
  likesCount: number;
  isActive: boolean;
  isPinned: boolean;
  isLocked: boolean;
  lastActivityAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Topic schema
const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Topic title is required"],
      minlength: [3, "Topic title must be at least 3 characters long"],
      maxlength: [175, "Topic title can't be more than 175 characters long"],
    },

    content: {
      type: String,
      trim: true,
      required: [true, "Topic content is required"],
      minlength: [1, "Topic description must be at least 1 character long"],
      maxlength: [
        1750,
        "Topic description can't be more than 1750 characters long",
      ],
    },

    images: [{ type: String }],

    thread: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: [true, "Thread is required"],
    },

    slug: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Topic author is required"],
    },

    commentsCount: {
      type: Number,
      default: 0,
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isPinned: {
      type: Boolean,
      default: false,
    },

    isLocked: {
      type: Boolean,
      default: false,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Before we save title, we want to automatically generate slug but only when creating new (not when updating)
topicSchema.pre("save", function (next) {
  if (this.isNew && this.isModified("title")) {
    this.slug =
      this.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-") // Replace spaces with dashes
        .replace(/[^\w\-]+/g, "") // Remove special characters
        .replace(/\-\-+/g, "-") // Multiple dashes => single dashes
        .replace(/^-+/, "") // Remove dash at the beginning
        .replace(/-+$/, "") + // Remove dash at the end
      `-${Date.now()}`; // If somehow happens for two or more topics to have the same title, we need to make slugs different
  }
  next();
});

// Don't return __v in json response
topicSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes
topicSchema.index({ author: 1 });
topicSchema.index({ createdAt: -1 });
topicSchema.index({ thread: 1 });
topicSchema.index({ isActive: 1 });
topicSchema.index({ isPinned: -1, lastActivityAt: -1 });

const Topic = mongoose.model<ITopic>("Topic", topicSchema);

export default Topic;
