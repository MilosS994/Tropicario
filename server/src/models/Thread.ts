import mongoose from "mongoose";

// Thread interface
export interface IThread extends mongoose.Document {
  title: string;
  description?: string;
  section: mongoose.Schema.Types.ObjectId;
  slug: string;
  author: mongoose.Schema.Types.ObjectId;
  topics: mongoose.Schema.Types.ObjectId[];
  topicsCount: number;
  isActive: boolean;
  order: number;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Thread schema
const threadSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Thread title is required"],
      unique: true,
      minlength: [3, "Thread title must be at least 3 characters long"],
      maxlength: [75, "Thread title can't be more than 75 characters long"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        255,
        "Thread description can't be more than 255 characters long",
      ],
    },

    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Section is required"],
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
      required: [true, "Thread author is required"],
    },

    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
      },
    ],

    topicsCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Before we save title, we want to automatically generate slug
threadSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/[^\w\-]+/g, "") // Remove special characters
      .replace(/\-\-+/g, "-") // Multiple dashes => single dashes
      .replace(/^-+/, "") // Remove dash at the beginning
      .replace(/-+$/, ""); // Remove dash at the end
  }
  next();
});

// Don't return __v in json response
threadSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes
threadSchema.index({ author: 1 });
threadSchema.index({ section: 1 });
threadSchema.index({ order: 1 });
threadSchema.index({ createdAt: -1 });
threadSchema.index({ isActive: 1 });

const Thread = mongoose.model<IThread>("Thread", threadSchema);

export default Thread;
