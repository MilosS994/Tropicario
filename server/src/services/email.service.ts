import { IUser } from "../models/User.js";
import { emailTransporter } from "../config/email.config.js";
import "dotenv/config";

class EmailService {
  // Function for sending verification email
  async sendVerificationEmail(user: IUser, verificationToken: string) {
    const verificationUrl = `${process.env.BACKEND_URL}/api/v1/auth/verify-email/${verificationToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@tropicario.com",
      to: user.email,
      subject: "Verify your Tropicario account",
      html: this.getVerificationEmailTemplate(user.username, verificationUrl),
    };

    const info = await emailTransporter.sendMail(mailOptions);

    // Development - log info
    if (process.env.NODE_ENV !== "production") {
      console.log("Email would be sent to:", user.email);
      console.log("Verification URL:", verificationUrl);
    }

    return info;
  }

  // Send reset link
  async sendResetLink(user: IUser, resetToken: string) {
    const resetLinkUrl = `${process.env.BACKEND_URL}/api/v1/auth/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@tropicario.com",
      to: user.email,
      subject: "Reset your Tropicario account password",
      html: this.getPasswordResetEmailTemplate(user.username, resetLinkUrl),
    };

    const info = await emailTransporter.sendMail(mailOptions);

    // Development - log info
    if (process.env.NODE_ENV !== "production") {
      console.log("Password reset email sent to:", user.email);
      console.log("Reset URL:", resetLinkUrl);
    }

    return info;
  }

  // Get HTML template for verificatiom email
  private getVerificationEmailTemplate(
    username: string,
    verificationUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { 
              display: inline-block; 
              background: #4CAF50; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌴 Welcome to Tropicario!</h1>
            </div>
            <div class="content">
              <h2>Hi ${username}! 👋</h2>
              <p>Thank you for registering! Please verify your email address to activate your account.</p>
              <p>Click the button below to verify:</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p>Or copy this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
              <p><strong>This link expires in 24 hours.</strong></p>
              <p>If you didn't create this account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Tropicario Forum. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Get HTML template for password reset
  private getPasswordResetEmailTemplate(
    username: string,
    resetLinkUrl: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f44336; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 30px; }
            .button { 
              display: inline-block; 
              background: #4CAF50; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password reset link</h1>
            </div>
            <div class="content">
              <h2>Hi ${username}!</h2>
              <p>Click the button below to reset your password:</p>
              <a href="${resetLinkUrl}" class="button">Reset</a>
              <p>Or copy this link into your browser:</p>
              <p style="word-break: break-all; color: #666;">${resetLinkUrl}</p>
              <p><strong>This link expires in 10 minutes.</strong></p>
              <p>If you didn't ask for password reset, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Tropicario Forum. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
