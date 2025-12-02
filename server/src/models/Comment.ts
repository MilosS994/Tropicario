import mongoose from "mongoose";

// Comment interface
export interface IComment extends mongoose.Document {
  content: string;
  images: string[];
  topic: mongoose.Schema.Types.ObjectId;
  author: mongoose.Schema.Types.ObjectId;
  parentComment?: mongoose.Schema.Types.ObjectId;
  likesCount: number;
  usersLiked: mongoose.Schema.Types.ObjectId[];
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Comment schema
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment can't be empty"],
      maxlength: [1750, "Comment can't be more than 1750 characters long"],
    },

    images: [
      {
        type: String,
      },
    ],

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: [true, "Topic is required"],
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Comment author is required"],
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },

    likesCount: {
      type: Number,
      default: 0,
    },

    usersLiked: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isPinned: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Don't return __v in json response
commentSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes
commentSchema.index({ topic: 1, createdAt: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
