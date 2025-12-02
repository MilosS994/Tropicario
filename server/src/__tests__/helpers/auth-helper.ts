import { Express } from "express";
import request from "supertest";
import User from "../../models/User.js";

export const createAndLoginUser = async (
  app: Express,
  role: "user" | "admin" = "user"
) => {
  await User.create({
    username: role === "admin" ? "admin" : "user",
    email: role === "admin" ? "admin@mail.com" : "user@mail.com",
    password: "Password123!",
    isVerified: true,
    role,
  });

  const loginRes = await request(app)
    .post("/api/v1/auth/login")
    .send({
      email: role === "admin" ? "admin@mail.com" : "user@mail.com",
      password: "Password123!",
    });

  return {
    cookies: loginRes.headers["set-cookie"] as string,
    user: loginRes.body.data,
  };
};
