// IMPORTS
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import express, { Express } from "express";
import "dotenv/config";
// DB config and error custom error middleware
import connectDB from "./config/db.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
// Rate limit
import { apiLimiter } from "./middlewares/rateLimiter.middleware.js";
// Routes
import healthRoute from "./routes/other/health.route.js";
import notFoundRoute from "./routes/other/notFound.route.js";
import adminRoutes from "./routes/admin/admin.routes.js";
import authRoutes from "./routes/auth/auth.routes.js";
import sectionRoutes from "./routes/section/section.routes.js";
import userRoutes from "./routes/user/user.routes.js";
import threadRoutes from "./routes/thread/thread.routes.js";
import topicRoutes from "./routes/topic/topic.routes.js";
import commentRoutes from "./routes/comment/comment.routes.js";

const app: Express = express();

const PORT = (process.env.PORT as string) || 8080;

// Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["'self'", "'unsafe-inline'"], // Accept inline scripts
      },
    },
  })
);
app.use(
  cors({
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api", apiLimiter); // Apply api limiter to all routes

// Routes
app.use("/api", healthRoute);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/threads", threadRoutes);
app.use("/api/v1/topics", topicRoutes);
app.use("/api/v1/comments", commentRoutes);

// Not found handler
app.use("/", notFoundRoute);

// Custom error middleware
app.use(errorMiddleware);

export default app;

// Start server (we don't want to connect to DB here when we are testing)
if (process.env.NODE_ENV !== "test") {
  const startServer = async () => {
    try {
      await connectDB();
      // Keep server instance
      const server = app.listen(PORT, () => {
        console.log(
          `Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV} mode`
        );
      });
      // Graceful shutdown
      const gracefulShutdown = async (signal: string) => {
        console.log(`\n ${signal} signal received: closing HTTP server`);
        // Close HTTP server
        server.close(async () => {
          console.log("HTTP server closed");

          try {
            // Close MongoDB connection
            await mongoose.connection.close(false);
            console.log("MongoDB connection closed");

            console.log("Graceful shutdown completed");
            process.exit(0);
          } catch (error) {
            console.error("Error during shutdown:", error);
            process.exit(1);
          }
        });

        // Force shutdown after 10 seconds if requests don't finish
        setTimeout(() => {
          console.error(
            "Could not close connections in time, forcefully shutting down"
          );
          process.exit(1);
        }, 10000);
      };

      // Listen for termination signals
      process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
      process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to start a server:\n ${error.message}`);
      } else
        console.error("An unexpected error occured while starting a server");
      process.exit(1);
    }
  };

  startServer();
}
