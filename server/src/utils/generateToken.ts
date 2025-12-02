import jwt, { SignOptions } from "jsonwebtoken";
import "dotenv/config";

import { IUser } from "../models/User.js";

export const generateToken = (user: IUser) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be defined");
  }

  const options: SignOptions = {
    expiresIn: "1d",
  };

  return jwt.sign(
    { userId: String(user._id) },
    process.env.JWT_SECRET,
    options
  );
};
