import rateLimit from "express-rate-limit";
import "dotenv/config";

const isDevelopment = process.env.NODE_ENV === "development";
const isTest = process.env.NODE_ENV === "test";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 10000 : isDevelopment ? 1000 : 100, // 1000 for dev, 100 for production
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // skip for development
});

// Auth endpoints (login)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isTest ? 500 : isDevelopment ? 100 : 5, // 100 for dev, 5 for production
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  skip: () => isDevelopment, // skip for development
});

// Registration
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isTest ? 500 : isDevelopment ? 50 : 3, // 50 for dev, 3 for production
  message: {
    success: false,
    message: "Too many accounts created, please try again later.",
  },
  skip: () => isDevelopment, // skip for development
});
