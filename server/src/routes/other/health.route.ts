import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

router.get(
  "/health",
  async (req: Request, res: Response, next: NextFunction) => {
    res
      .status(200)
      .json({
        success: true,
        message: "Server is running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime,
      });
  }
);

export default router;
