import mongoose from "mongoose";

// Section interface
export interface ISection extends mongoose.Document {
  title: string;
  slug: string;
  description?: string;
  author: mongoose.Schema.Types.ObjectId;
  threads: mongoose.Schema.Types.ObjectId[];
  threadsCount: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Section schema
const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      minlength: [2, "Section title must be more than 2 characters long"],
      maxlength: [55, "Section title can't be more than 55 characters long"],
      required: [true, "Section title is required"],
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: [
        255,
        "Section description can't be more than 255 characters long",
      ],
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
      required: [true, "Section author is required"],
    },

    threads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Thread",
      },
    ],

    threadsCount: {
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
  },
  { timestamps: true }
);

// Before we save title, we want to automatically generate slug
sectionSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/[^\w\-]+/g, "") // Remove special characters
      .replace(/\-\-+/g, "-") // Multiple dashes => single dashes
      .replace(/^-+/, "") // Remove dash at the beggining
      .replace(/-+$/, ""); // Remove dash at the end
  }
  next();
});

// Don't return __v in json response
sectionSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

// Indexes
sectionSchema.index({ threadsCount: 1 });
sectionSchema.index({ createdAt: -1 });
sectionSchema.index({ order: 1 });
sectionSchema.index({ isActive: 1 });

const Section = mongoose.model<ISection>("Section", sectionSchema);

export default Section;
