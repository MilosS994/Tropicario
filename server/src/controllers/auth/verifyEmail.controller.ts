import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import User from "../../models/User.js";

export const verifyEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from params
    const { token } = req.params;

    // Hash token because it is hashed in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(token!)
      .digest("hex");

    // Find user with that token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    // If user doesn't exist, return a page with an error
    if (!user) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Verification Failed</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              .container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 500px;
              }
              .icon { font-size: 60px; margin-bottom: 20px; }
              h1 { color: #e74c3c; margin-bottom: 20px; }
              p { color: #555; line-height: 1.6; margin-bottom: 30px; }
              .button {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="icon">❌</div>
              <h1>Verification Failed</h1>
              <p>This verification link is invalid or has expired.</p>
              <p>Please request a new verification email.</p>
            </div>
          </body>
        </html>`);
    }

    // If it is ok, verify user and remove tokens
    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      $unset: {
        emailVerificationToken: "",
        emailVerificationExpires: "",
      },
    });

    // Return HTML page with success message
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Verified</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.3);
              text-align: center;
              max-width: 500px;
            }
            .icon { font-size: 60px; margin-bottom: 20px; }
            h1 { color: #27ae60; margin-bottom: 20px; }
            p { color: #555; line-height: 1.6; margin-bottom: 30px; }
            .redirect-text {
              margin-top: 20px;
              color: #888;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✅</div>
            <h1>Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now login to your account.</p>
            <p class="redirect-text">You can close this window now.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};
