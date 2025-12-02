import "dotenv/config";
import User, { IUser } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import {
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} from "../utils/customErrors.js";

class AuthService {
  // REGISTER USER SERVICE
  async registerUser(username: string, email: string, password: string) {
    // Checking if there is a JWT_SECRET
    if (!process.env.JWT_SECRET) {
      throw new InternalServerError("JWT_SECRET missing");
    }

    // If everything was okay, create a new user and save it to database
    const user: IUser = await User.create({ username, email, password });
    // Generate JWT token for new user
    const token = generateToken(user);

    return { user, token };
  }

  // LOGIN USER SERVICE
  async loginUser(email: string, password: string) {
    // Find user
    const user = await User.findOne({ email }).select("+password");

    // Check if user really exists
    if (!user) {
      throw new NotFoundError("You don't have an account");
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if user email is verified
    if (!user.isVerified) {
      throw new ForbiddenError("Please verify your email before logging in");
    }

    // If user is banned, don't let him login
    if (user.status === "banned") {
      throw new ForbiddenError("Your account is banned");
    }

    // Update user lastActive field
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: true });

    // Generate token
    const token = generateToken(user);

    return { user, token };
  }
}

export const authService = new AuthService();
