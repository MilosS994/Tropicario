import { jest } from "@jest/globals";

// We already have it in json config, but just for safety
process.env.NODE_ENV = "test";

// JWT
process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-only-12345";

// Email FROM (used in email templates)
process.env.EMAIL_FROM = "Tropicario Forum <noreply@tropicario-test.com>";

// Backend URL (for email verification links)
process.env.BACKEND_URL = "http://localhost:8080";

// Cloudinary (mock values)
process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key-12345";
process.env.CLOUDINARY_API_SECRET = "test-secret-12345";

// Suppress console output during tests, except for warnings and errors
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: originalConsole.warn,
  error: originalConsole.error,
};
