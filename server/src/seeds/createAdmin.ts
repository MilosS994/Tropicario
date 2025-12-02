import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";
import "dotenv/config";

export const createAdmin = async () => {
  try {
    await connectDB();

    // Create new admin
    await User.create({
      username: "administrator",
      email: "admin@tropicario.com",
      password: "Admin123!",
      role: "admin",
      isVerified: true,
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

createAdmin();
