import nodemailer from "nodemailer";
import "dotenv/config";

// For development (JSON transport)
export const createDevTransporter = () => {
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

// For production (gmail account)
const createProdTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Gmail App Password
    },
  });
};

// Export transporter depending on environment
export const emailTransporter =
  process.env.NODE_ENV !== "production"
    ? createDevTransporter()
    : createProdTransporter();
