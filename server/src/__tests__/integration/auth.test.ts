import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import app from "../../server.js";
import User from "../../models/User.js";
import { connectDB, disconnectDB, clearDB } from "../helpers/db-setup.js";

describe("Auth API Integration Tests", () => {
  //   Run in-memory MongoDB server before all tests
  beforeAll(async () => {
    await connectDB();
  });

  //   Close connection after all tests
  afterAll(async () => {
    await disconnectDB();
  });

  //   Clear database after each test
  afterEach(async () => {
    await clearDB();
  });

  //   -------------------- TESTS ----------------------- //

  //   ---------------------
  //   REGISTER
  //   ---------------------

  describe("POST /api/v1/auth/register", () => {
    // Register a new user with valid data
    it("should register a new user with valid data", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "user",
          email: "user@mail.com",
          password: "Password123!",
        })
        .expect(201);

      expect(res.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("username", "user");
      expect(res.body.data).toHaveProperty("email", "user@mail.com");
      expect(res.body).toHaveProperty("token");
      expect(res.body.data.password).toBeUndefined();
    });

    // Fail registration with missing username
    it("should fail registration with missing username", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          email: "user@mail.com",
          password: "Password123!",
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);

      //   Look for username error in the errors array
      const usernameError = res.body.errors.find(
        (error: any) => error.field === "username"
      );

      expect(usernameError).toBeDefined();
      expect(usernameError.message).toContain("required");
    });

    // Fail registration with missing password
    it("should fail registration with missing password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "user",
          email: "user@mail.com",
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);

      //   Look for password error in the errors array
      const passwordError = res.body.errors.find(
        (error: any) => error.field === "password"
      );

      expect(passwordError).toBeDefined();
      expect(passwordError.message).toContain("required");
    });

    // Fail registration with invalid email format
    it("should fail registration with invalid email format", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "user",
          email: "usermail.com",
          password: "Password123!",
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);

      //   Look for email error in the errors array
      const emailError = res.body.errors.find(
        (error: any) => error.field === "email"
      );

      expect(emailError).toBeDefined();
      expect(emailError.message).toContain("valid");
    });

    // Fail with too short password
    it("should fail registration with password less than 8 characters long", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "user",
          email: "usermail.com",
          password: "Pass1!",
        })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);

      //   Look for password error in the errors array
      const passwordError = res.body.errors.find(
        (error: any) => error.field === "password"
      );

      expect(passwordError).toBeDefined();
      expect(passwordError.message).toContain("long");
    });

    // Fail with duplicate email
    it("should fail registration with duplicate email", async () => {
      // First registration
      await request(app).post("/api/v1/auth/register").send({
        username: "user1",
        email: "duplicate@mail.com",
        password: "Password123!",
      });

      //   Try to register again with the same email
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "user2",
          email: "duplicate@mail.com",
          password: "Password123!",
        })
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    // Fail with duplicate username
    it("should fail registration with duplicate username", async () => {
      // First registration
      await request(app).post("/api/v1/auth/register").send({
        username: "user",
        email: "user1@mail.com",
        password: "Password123!",
      });

      //   Try to register again with the same email
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "user",
          email: "user2@mail.com",
          password: "Password123!",
        })
        .expect(409);

      expect(res.body.success).toBe(false);
    });
  });

  //   ---------------------
  //   LOGIN
  //   ---------------------

  describe("POST /api/v1/auth/login", () => {
    //   Login successfully with valid credentials
    it("should login successfully with valid credentials", async () => {
      // Create user first
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@mail.com", password: "Password123!" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.data.email).toBe("user@mail.com");
    });

    // Fail login with wrong email
    it("should fail login with wrong email", async () => {
      // Create user first
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user22@mail.com", password: "Password123!" })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    // Fail login with wrong password
    it("should fail login with wrong password", async () => {
      // Create user first
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@mail.com", password: "Password" })
        .expect(401);

      expect(res.body.success).toBe(false);
    });

    // Fail login with not verified email address
    it("should fail login without verified email address", async () => {
      // Create user first
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@mail.com", password: "Password123!" })
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    // Fail login without email address
    it("should fail login without an email address", async () => {
      // Create user first
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ password: "Password123!" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);

      const emailError = res.body.errors.find(
        (error: any) => error.field === "email"
      );

      expect(emailError).toBeDefined();
      expect(emailError.message).toContain("required");
    });

    // Fail login without password
    it("should fail login without a password", async () => {
      // Create user first
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@mail.com" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);

      const passwordError = res.body.errors.find(
        (error: any) => error.field === "password"
      );

      expect(passwordError).toBeDefined();
      expect(passwordError.message).toContain("required");
    });
  });

  //   ---------------------
  //   VERIFY EMAIL
  //   ---------------------

  describe("GET /verify-email/:token", () => {
    //   Verify email address with valid token
    it("should verify email address with valid token", async () => {
      // Create user first
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: false,
      });

      //   Generate verify token
      const token = user.createEmailVerificationToken();
      await user.save();

      // Verify email
      const res = await request(app)
        .get(`/api/v1/auth/verify-email/${token}`)
        .expect(200);

      //   Check HTML response
      expect(res.text).toContain("Email Verified Successfully");

      // Check if user is verified in DB
      const verifiedUser: any = await User.findById(user._id);
      expect(verifiedUser.isVerified).toBe(true);
      expect(verifiedUser.emailVerificationToken).toBeUndefined();
      expect(verifiedUser.emailVerificationTokenExpires).toBeUndefined();
    });

    // Fail email verification with invalid token
    it("should fail email verification with invalid token", async () => {
      // Create user first
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: false,
      });

      //   Create invalid token
      const token = "invalidtoken12345";

      // Verify email
      const res = await request(app)
        .get(`/api/v1/auth/verify-email/${token}`)
        .expect(400);

      expect(res.text).toContain("Verification Failed");
    });

    // Fail email verification with expired token
    it("should fail email verification with expired token", async () => {
      // Create user first
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: false,
      });

      //   Create  token
      const token = user.createEmailVerificationToken();

      user.emailVerificationExpires = new Date(Date.now() - 1000); // 1 second ago, just to be expired
      await user.save();

      // Verify email
      const res = await request(app)
        .get(`/api/v1/auth/verify-email/${token}`)
        .expect(400);

      expect(res.text).toContain("Verification Failed");
    });

    // Fail email verification if already verified
    it("should fail email verification if already verified", async () => {
      // Create user first
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: false,
      });

      //   Create token
      const token = user.createEmailVerificationToken();
      await user.save();

      // Verify email
      const resFirst = await request(app)
        .get(`/api/v1/auth/verify-email/${token}`)
        .expect(200);

      expect(resFirst.text).toContain("Email Verified Successfully");

      //   Now try again to verify
      const resSecond = await request(app)
        .get(`/api/v1/auth/verify-email/${token}`)
        .expect(400);

      expect(resSecond.text).toContain("Verification Failed");
    });
  });

  //   ---------------------
  //   RESEND VERIFICATION
  //   ---------------------

  describe("POST /api/v1/resend-verification", () => {
    // Resend verification email
    it("should resend verification email", async () => {
      // Create unverified user
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: false,
      });

      // Resend verification
      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({ email: "user@mail.com" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Verification email sent");

      //  Check database, new token should be created
      const user: any = await User.findOne({ email: "user@mail.com" }).select(
        "+emailVerificationToken +emailVerificationExpires"
      );

      expect(user.emailVerificationToken).toBeDefined();
      expect(user.emailVerificationExpires).toBeDefined();
      expect(user.emailVerificationExpires.getTime()).toBeGreaterThan(
        Date.now()
      );
    });

    // Fail when user is already verified
    it("should fail if user is already verified", async () => {
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true, // user is already verified
      });

      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({ email: "user@mail.com" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already verified");
    });

    // Fail when user enters non-existent email
    it("should fail with non-existent email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({ email: "nonexistent@mail.com" })
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    // Fail when user doesn't enter email address
    it("should fail with missing email address", async () => {
      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({}) // we don't send email
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);

      const emailError = res.body.errors.find(
        (error: any) => error.field === "email"
      );

      expect(emailError).toBeDefined();
      expect(emailError.message).toContain("required");
    });
  });

  //   ---------------------
  //   FORGOT PASSWORD
  //   ---------------------

  describe("GET /forgot-password", () => {
    // Send reset email for valid email
    it("should send reset email for a valid email address", async () => {
      // Create user
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      //   User forgets password and asks for reset link
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "user@mail.com" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Reset link sent");

      //   Check if token is created in database
      const foundUser: any = await User.findById(user._id).select(
        "+passwordResetToken +passwordResetExpires"
      );
      expect(foundUser.passwordResetToken).toBeDefined();
      expect(foundUser.passwordResetExpires).toBeDefined();
      expect(foundUser.passwordResetExpires.getTime()).toBeGreaterThan(
        Date.now()
      );
    });

    // Fail to send reset email with non-existing email address (it is successfull anyway, but user doesn't get reset email)
    it("should fail to send reset email if an email address is non-existent", async () => {
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({ email: "nonexistent@mail.com" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("password reset link");
    });

    // Fail to send reset email without email address
    it("should fail with missing email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/forgot-password")
        .send({})
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  //   ---------------------
  //   RESET PASSWORD
  //   ---------------------

  describe("POST /api/v1/auth/reset-password/:resetToken", () => {
    // Reset password with valid token
    it("should reset password with valid token", async () => {
      // Create user first
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "OldPassword123!",
        isVerified: true,
      });

      // Generate reset token
      const token = user.createPasswordResetToken();
      await user.save();

      // Reset password
      const res = await request(app)
        .post(`/api/v1/auth/reset-password/${token}`)
        .send({ newPassword: "NewPassword123!" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("reset successful");

      // Check if password is changed and token removed
      const updatedUser: any = await User.findById(user._id).select(
        "+password +passwordResetToken"
      );

      // Old password should NOT work anymore
      const oldMatch = await updatedUser.comparePassword("OldPassword123!");
      expect(oldMatch).toBe(false);

      // New password SHOULD work now
      const newMatch = await updatedUser.comparePassword("NewPassword123!");
      expect(newMatch).toBe(true);

      // Token should be removed
      expect(updatedUser.passwordResetToken).toBeUndefined();
    });

    // Fail to reset password with invalid token
    it("should fail reset password with invalid token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/reset-password/invalid-token")
        .send({ newPassword: "NewPassword123!" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    // Fail to reset password with expired token
    it("should fail reset password with expired token", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      const token = user.createPasswordResetToken();
      user.passwordResetExpires = new Date(Date.now() - 1000); // Expired 1 second ago
      await user.save();

      const res = await request(app)
        .post(`/api/v1/auth/reset-password/${token}`)
        .send({ newPassword: "NewPassword123!" })
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    // Fail to reset password without new password
    it("should fail reset password with missing new password", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      const token = user.createPasswordResetToken();
      await user.save();

      const res = await request(app)
        .post(`/api/v1/auth/reset-password/${token}`)
        .send({}) // don't send new password
        .expect(400);

      expect(res.body.success).toBe(false);
    });

    // Fail to reset password with too short new password
    it("should fail reset password with too short password", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      const token = user.createPasswordResetToken();
      await user.save();

      const res = await request(app)
        .post(`/api/v1/auth/reset-password/${token}`)
        .send({ password: "Pass1!" }) // too short password
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  //   ---------------------
  //   LOGOUT
  //   ---------------------

  describe("POST /api/v1/auth/logout", () => {
    //   Log out user successfully if logged in
    it("should log out user if logged in", async () => {
      // Create user
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      //   Login user
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@mail.com", password: "Password123!" })
        .expect(200);

      // Extract cookies from login response
      const cookies = loginRes.headers["set-cookie"];

      // Logout user
      const res = await request(app)
        .post("/api/v1/auth/logout")
        .set("Cookie", cookies as string)
        .expect(200);

      expect(res.body.success).toBe(true);
    });

    // Fail to log out if not logged in
    it("should not log out user if not logged in", async () => {
      // Create user
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      // Logout user without logging in
      const res = await request(app).post("/api/v1/auth/logout").expect(401);

      expect(res.body.success).toBe(false);
    });
  });

  //   ---------------------
  //   GET CURRENT USER
  //   ---------------------

  describe("GET /api/v1/auth/me", () => {
    //   Return user info with valid token
    it("should return user with valid token", async () => {
      // Create user
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      //   Login user
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@mail.com", password: "Password123!" })
        .expect(200);

      // Extract cookies from login response
      const cookies = loginRes.headers["set-cookie"];

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", cookies as string)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });

    // Fail to return user info without valid token
    it("should not return user without valid token", async () => {
      // Create user
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      const invalidToken = "ar32tt394t3984893h9g4hg29834hf243";

      const res = await request(app)
        .get("/api/v1/auth/me")
        .set("Cookie", invalidToken)
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.data).toBeUndefined();
    });

    // Fail to return user info without token at all
    it("should not return user without token", async () => {
      // Create user
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        isVerified: true,
      });

      //   Login user
      await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "user@mail.com", password: "Password123!" })
        .expect(200);

      const res = await request(app).get("/api/v1/auth/me").expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.data).toBeUndefined();
    });
  });
});
