import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export type UserStatus = "active" | "banned" | "disabled";
export type UserRole = "user" | "admin";

// User interface
export interface IUser extends mongoose.Document {
  username: string;
  password: string;
  email: string;
  fullName?: string;
  avatar?: string;
  age?: number;
  location?: string;
  bio?: string;
  lastActive: Date;
  status: UserStatus;
  role: UserRole;
  postsCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Email verification
  isVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;

  // Password reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
  createEmailVerificationToken(): string;
  createPasswordResetToken(): string;
}

// User schema
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
      required: [true, "Username is required"],
      unique: true,
      minlength: [2, "Username must be at least 2 characters long"],
      maxlength: [55, "Username can't be more than 55 characters long"],
      match: [
        /^[\w-]+$/,
        "Username can only contain letters, numbers, hyphens and underscores",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: function (value: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
        },
        message: "Please provide a valid email address",
      },
    },

    fullName: {
      type: String,
      trim: true,
      maxlength: [75, "Full name can't be more than 75 characters long"],
    },

    avatar: {
      type: String,
      default: "",
    },

    age: {
      type: Number,
      min: [13, "User must be at least 13 years old"],
      max: [120, "Please enter a valid age"],
    },

    location: {
      type: String,
      trim: true,
      maxlength: [125, "Location can't be more than 75 characters long"],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio can't be more than 500 characters long"],
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["active", "banned", "disabled"],
      default: "active",
    },

    // Forum specific
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    postsCount: {
      type: Number,
      default: 0,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash the password before saving to database
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method for comparing passwords
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method for generating verification token
userSchema.methods.createEmailVerificationToken = function (): string {
  // Random token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and keep it in the databse
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  // Token will expire in 24 hours
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  // Return plain token for an email message
  return verificationToken;
};

// Method for generating password reset token
userSchema.methods.createPasswordResetToken = function (): string {
  // Random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and keep it in the databse
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Token will expire in 10 minutes
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

  // Return plain token
  return resetToken;
};

// Don't return __v in json response
userSchema.set("toJSON", {
  transform: (_doc: any, ret: any) => {
    delete ret.__v;
    return ret;
  },
});

userSchema.index({ fullName: 1 });
userSchema.index({ lastActive: -1 });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
