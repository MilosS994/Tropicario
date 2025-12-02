import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import User from "../../models/User.js";
import { connectDB, disconnectDB, clearDB } from "../helpers/db-setup.js";

describe("User Model Test", () => {
  //   Run in-memory MongoDB server before all tests
  beforeAll(async () => {
    await connectDB();
  });

  //   Close connection after all tests
  afterAll(async () => {
    await disconnectDB();
  });

  //   Clear db after each test
  afterEach(async () => {
    await clearDB();
  });

  //   -------------------- TESTS ----------------------- //

  //   ---------------------
  //   BASIC CRUD OPERATIONS
  //   ---------------------

  describe("Basic CRUD Operations", () => {
    //   Create and save user successfully
    it("should create and save user successfully", async () => {
      const validUser = await User.create({
        username: "testuser",
        email: "test@example.com",
        password: "Password123!",
      });

      const user: any = await User.findOne({ email: "test@example.com" });

      expect(user.username).toBe(validUser.username);
      expect(user.email).toBe(validUser.email);
      expect(user.password).not.toBe(validUser.password); // Password should be hashed
      expect(user.role).toBe("user"); // default
      expect(user.status).toBe("active"); // default
      expect(user.isVerified).toBe(false); // default
    });

    //   Fail to create user without required fields
    it("should fail to create user without required fields", async () => {
      const userWithoutRequiredFields = {
        username: "testuser",
      };

      await expect(User.create(userWithoutRequiredFields)).rejects.toThrow();
    });

    //   Fail to create user wth invalid email format
    it("should fail to create user with invalid email format", async () => {
      const userWithInvalidEmail = {
        username: "testuser",
        email: "testexample",
        password: "Password123!",
      };

      await expect(User.create(userWithInvalidEmail)).rejects.toThrow();
    });

    //   Fail with duplicate email
    it("should fail to create user with duplicate email", async () => {
      const user1 = await User.create({
        username: "userone",
        email: "user@mail.com",
        password: "Password123!",
      });

      const user2 = {
        username: "usertwo",
        email: "user@mail.com",
        password: "Password123!",
      };

      await expect(User.create(user2)).rejects.toThrow();
    });

    //   Fail with duplicate username
    it("should fail to create user with duplicate username", async () => {
      const user1 = await User.create({
        username: "duplicateuser",
        email: "user1@mail.com",
        password: "Password123!",
      });

      const user2 = {
        username: "duplicateuser",
        email: "user2@mail.com",
        password: "Password123!",
      };

      await user1.save();
      await expect(User.create(user2)).rejects.toThrow();
    });
  });

  //   ---------------------
  //   PASSWORD HANDLING
  //   ---------------------

  describe("Password Handling", () => {
    //   Password should be hashed before saving
    it("password should be hashed before saving", async () => {
      const rawPassword = "Password123!";
      await User.create({
        username: "hashuser",
        email: "user@mail.com",
        password: rawPassword,
      });

      const savedUser: any = await User.findOne({
        email: "user@mail.com",
      }).select("+password");

      expect(savedUser.password).not.toBe(rawPassword);

      // Verify hashed password
      const isMatch = await savedUser.comparePassword(rawPassword);
      expect(isMatch).toBe(true);
    });

    //   Password should not be returned in json response
    it("password should not be returned in json response", async () => {
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      const foundUser: any = await User.findOne({ email: "user@mail.com" });

      expect(foundUser.password).toBeUndefined();
    });

    //   Fail with password shorter than min length
    it("should fail to create user with password shorter than 8 characters", async () => {
      const userWithShortPassword = {
        username: "user",
        email: "user@mail.com",
        password: "Pass1!",
      };

      await expect(User.create(userWithShortPassword)).rejects.toThrow();
    });
  });

  //   ---------------------
  //   DEFAULT VALUES
  //   ---------------------

  describe("Default Values", () => {
    //   Default role should be user
    it("default role should be user", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      expect(user.role).toBe("user");
    });

    //   Default status should be active
    it("default status should be active", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      expect(user.status).toBe("active");
    });

    //   Default isVerified should be false
    it("default isVerified should be false", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      expect(user.isVerified).toBe(false);
    });

    //   Default avatar should be set (empty string)
    it("default avatar should be set to empty string", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      expect(user.avatar).toBe("");
    });

    //   createdAt and updatedAt should be set automatically
    it("createdAt and updatedAt should be set automatically", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });
  });

  //   ---------------------
  //   VALIDATIONS
  //   ---------------------

  describe("Field Validations", () => {
    //   Username should be trimmed
    it("username should be trimmed", async () => {
      const user = await User.create({
        username: "   user   ",
        email: "user@mail.com",
        password: "Password123!",
      });

      expect(user.username).toBe("user");
    });

    //   Email should be trimmed and lowercase
    it("email should be trimmed and lowercase", async () => {
      const user = await User.create({
        username: "user",
        email: "  uSEr@mail.COM ",
        password: "Password123!",
      });

      expect(user.email).toBe("user@mail.com");
    });

    //   Fail with username shorter than min length
    it("should fail to create user with username shorter than 2 characters", async () => {
      const userWithShortUsername = {
        username: "a",
        email: "user@mail.com",
        password: "Password123!",
      };

      await expect(User.create(userWithShortUsername)).rejects.toThrow();
    });

    //   Fail with username longer than max length
    it("should fail to create user with username longer than 55 characters", async () => {
      const userWithLongUsername = {
        username: "user".repeat(20),
        email: "user@mail.com",
        password: "Password123!",
      };

      await expect(User.create(userWithLongUsername)).rejects.toThrow();
    });

    //   Fail with age less than min
    it("should fail to create user with age less than 13", async () => {
      const underageUser = {
        username: "younguser",
        email: "younguser@mail.com",
        password: "Password123!",
        age: 10,
      };

      await expect(User.create(underageUser)).rejects.toThrow();
    });

    //   Fail with age greater than max
    it("should fail to create user with age greater than 120", async () => {
      const overageUser = {
        username: "olduser",
        email: "olduser@mail.com",
        password: "Password123!",
        age: 130,
      };

      await expect(User.create(overageUser)).rejects.toThrow();
    });
  });

  //   ---------------------
  //   UNIQUE CONSTRAINTS
  //   ---------------------

  describe("Unique Constraints", () => {
    //   Fail to create two users with same email
    it("should fail to create two users with same email", async () => {
      await User.create({
        username: "user1",
        email: "user@mail.com",
        password: "Password123!",
      });

      const user2 = {
        username: "user2",
        email: "user@mail.com",
        password: "Password123!",
      };

      await expect(User.create(user2)).rejects.toThrow();
    });

    //   Fail to create two users with same username
    it("should fail to create two users with same username", async () => {
      await User.create({
        username: "user",
        email: "user1@mail.com",
        password: "Password123!",
      });

      const user2 = {
        username: "user",
        email: "user2@mail.com",
        password: "Password123!",
      };

      await expect(User.create(user2)).rejects.toThrow();
    });
  });

  //   ---------------------
  //   OPTIONAL FIELDS
  //   ---------------------

  describe("Optional Fields Handling", () => {
    //   Should create user without optional fields
    it("should create user without optional fields", async () => {
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      const foundUser: any = await User.findOne({ email: "user@mail.com" });

      expect(foundUser.age).toBeUndefined();
      expect(foundUser.fullName).toBeUndefined();
      expect(foundUser.bio).toBeUndefined();
      expect(foundUser.location).toBeUndefined();
    });

    //   Should accept valid optional fields
    it("should accept valid optional fields", async () => {
      await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
        fullName: "Test User",
        age: 25,
        location: "Test Location",
        bio: "This is a test bio.",
      });

      const foundUser: any = await User.findOne({ email: "user@mail.com" });

      expect(foundUser.fullName).toBe("Test User");
      expect(foundUser.age).toBe(25);
      expect(foundUser.location).toBe("Test Location");
      expect(foundUser.bio).toBe("This is a test bio.");
    });
  });

  //   ---------------------
  //   EMAIL VERIFICATION
  //   ---------------------

  describe("Email Verification Functionality", () => {
    //   Verification token and verificationTokenExpires should be generated correctly when user is created
    it("verification token should be generated correctly when user is created", async () => {
      const user = new User({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      // Create token
      const plainToken = user.createEmailVerificationToken();

      await user.save();

      expect(plainToken).toBeDefined();
      expect(plainToken).toHaveLength(64);

      const foundUser: any = await User.findOne({
        email: "user@mail.com",
      }).select("+emailVerificationToken +emailVerificationExpires");

      expect(foundUser.emailVerificationToken).toBeDefined();
      expect(foundUser.emailVerificationToken).toHaveLength(64);
      expect(foundUser.emailVerificationExpires).toBeDefined();
    });

    //   isVerified should be updated after email is verified
    it("isVerified should be updated after email is verified", async () => {
      const user = new User({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      user.createEmailVerificationToken();

      await user.save();

      // Simulate email verification
      const foundUser: any = await User.findOne({ email: "user@mail.com" });
      foundUser.isVerified = true;
      foundUser.emailVerificationToken = undefined;
      foundUser.emailVerificationExpires = undefined;

      await foundUser.save();

      const verifiedUser: any = await User.findOne({ email: "user@mail.com" });

      expect(verifiedUser.isVerified).toBe(true);
      expect(verifiedUser.emailVerificationToken).toBeUndefined();
      expect(verifiedUser.emailVerificationExpires).toBeUndefined();
    });
  });

  //   ---------------------
  //   PASSWORD RESET
  //   ---------------------
  describe("Password Reset Functionality", () => {
    //   resetPasswordToken and resetPasswordExpires should be stored
    it("resetPasswordToken should be stored", async () => {
      const user = new User({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      user.createPasswordResetToken();

      await user.save();

      const foundUser: any = await User.findOne({
        email: "user@mail.com",
      }).select("+passwordResetToken +passwordResetExpires");

      expect(foundUser.passwordResetToken).toBeDefined();
      expect(foundUser.passwordResetToken).toHaveLength(64);
      expect(foundUser.passwordResetExpires).toBeDefined();
    });

    //   resetPasswordToken should be clearable after password is reset
    it("resetPasswordToken should be clearable after password is reset", async () => {
      const user = new User({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      user.createPasswordResetToken();

      await user.save();

      // Simulate password reset
      const foundUser: any = await User.findOne({
        email: "user@mail.com",
      }).select("+passwordResetToken +passwordResetExpires");

      foundUser.password = "NewPassword123!";
      foundUser.passwordResetToken = undefined;
      foundUser.passwordResetExpires = undefined;
      await foundUser.save();

      const updatedUser: any = await User.findOne({
        email: "user@mail.com",
      });

      expect(updatedUser.passwordResetToken).toBeUndefined();
      expect(updatedUser.passwordResetExpires).toBeUndefined();
    });
  });

  //   ---------------------
  //   SOFT DELETE
  //   ---------------------
  describe("Soft Delete Functionality", () => {
    //   User status can be changed to 'disabled'
    it("user status should be changed to 'disabled'", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      user.status = "disabled";
      await user.save();

      const updatedUser: any = await User.findOne({ email: "user@mail.com" });

      expect(updatedUser.status).toBe("disabled");
    });

    //   Disabled user should still be in database
    it("disabled user should still be in database", async () => {
      const user = await User.create({
        username: "user",
        email: "user@mail.com",
        password: "Password123!",
      });

      user.status = "disabled";
      await user.save();

      const disabledUser: any = await User.findOne({ email: "user@mail.com" });

      expect(disabledUser).not.toBeNull();
      expect(disabledUser.status).toBe("disabled");
    });
  });
});
