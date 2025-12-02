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
import { createAndLoginUser } from "../helpers/auth-helper.js";
import Section from "../../models/Section.js";

describe("Section API Integration Tests", () => {
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

  // --------------------------------
  // --------------------------------
  // PUBLIC
  // --------------------------------
  // --------------------------------

  describe("GET /api/v1/sections", () => {
    // Get all sections with pagination
    it("should get all sections with pagination", async () => {
      // Create admin first with helper function
      await createAndLoginUser(app, "admin");

      // Find created admin
      const admin: any = await User.findOne({ role: "admin" }); // There is only 1 user (admin) created

      // Create 30 sections
      for (let i = 1; i <= 30; i++) {
        await Section.create({
          title: `Section ${i}`,
          author: admin._id,
        });
      }

      const res = await request(app).get("/api/v1/sections");

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.length).toBe(10);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination.currentPage).toBe(1); // first page
      expect(res.body.pagination.limit).toBe(10); // default limit
      expect(res.body.pagination.totalItems).toBe(30);
      expect(res.body.pagination.totalPages).toBe(3);
      if (res.body.data.length > 10) {
        expect(res.body.pagination.hasNextPage).toBe(true);
      }
    });

    // Filter sections by isActive
    it("should filter sections by isActive", async () => {
      // Create admin first with helper function
      await createAndLoginUser(app, "admin");

      // Find created admin
      const admin: any = await User.findOne({ role: "admin" }); // There is only 1 user (admin) created

      // Create 30 sections: 10 inactive, 20 active
      for (let i = 1; i <= 30; i++) {
        await Section.create({
          title: `Section ${i}`,
          author: admin._id,
          isActive: i > 10, // First 10 are inactive, rest are active
        });
      }

      const res = await request(app).get("/api/v1/sections?isActive=true");

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination.totalItems).toBe(20);
    });

    // Sort sections by order
    it("should sort sections by order", async () => {
      // Create admin first with helper function
      await createAndLoginUser(app, "admin");

      // Find created admin
      const admin: any = await User.findOne({ role: "admin" }); // There is only 1 user (admin) created

      // Create 30 sections
      for (let i = 1; i <= 30; i++) {
        await Section.create({
          title: `Section ${i}`,
          author: admin._id,
          order: i,
        });
      }

      // From 30 to 1, with limit of 30 (one page)
      const res = await request(app).get(
        "/api/v1/sections?order=desc&limit=30"
      );

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(30);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.totalPages).toBe(1);
      expect(res.body.data[0].order).toBe(30);
      expect(res.body.data[29].order).toBe(1);
    });
  });

  describe("GET /api/v1/sections/:slug", () => {
    // Get single section by slug
    it("should get single section by slug", async () => {
      // Create admin first with helper function
      await createAndLoginUser(app, "admin");

      // Find created admin
      const admin: any = await User.findOne({ role: "admin" }); // There is only 1 user (admin) created

      // Create 5 sections
      for (let i = 1; i <= 5; i++) {
        await Section.create({
          title: `Section ${i}`,
          author: admin._id,
        });
      }

      // Find section with title Section 5
      const section: any = await Section.findOne({ title: "Section 5" });

      const res = await request(app).get(`/api/v1/sections/${section.slug}`);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe("Section 5");
    });

    // Fail to get section with non-existent slug
    it("should fail to get section with non-existent slug", async () => {
      // Create admin first with helper function
      await createAndLoginUser(app, "admin");

      // Find created admin
      const admin: any = await User.findOne({ role: "admin" }); // There is only 1 user (admin) created

      // Create 2 sections
      for (let i = 1; i <= 2; i++) {
        await Section.create({
          title: `Section ${i}`,
          author: admin._id,
        });
      }

      const res = await request(app)
        .get("/api/v1/sections/:non-existent-slug")
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
    });
  });

  // --------------------------------
  // --------------------------------
  // ADMIN
  // --------------------------------
  // --------------------------------

  describe("POST /api/v1/sections", () => {
    // Create section as admin
    it("should create section as admin", async () => {
      // Create admin first and get cookies
      const { cookies } = await createAndLoginUser(app, "admin");

      const res = await request(app)
        .post("/api/v1/sections")
        .set("Cookie", cookies)
        .send({
          title: "Section 1",
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe("Section 1");
    });

    // Fail to create section as regular user
    it("should fail to create section as regular user", async () => {
      // Create user first and get cookies
      const { cookies } = await createAndLoginUser(app, "user");

      const res = await request(app)
        .post("/api/v1/sections")
        .set("Cookie", cookies)
        .send({
          title: "Section 1",
        })
        .expect(401);

      expect(res.body.message).toContain("Unauthorized");
      expect(res.body.data).toBeUndefined();
    });

    // Fail to create section without authentication
    it("should fail to create section without authentication", async () => {
      // Create admin first and get cookies
      await createAndLoginUser(app, "admin");

      const res = await request(app)
        .post("/api/v1/sections")
        .send({
          title: "Section 1",
        })
        .expect(401);

      expect(res.body.message).toContain("Not authenticated");
      expect(res.body.data).toBeUndefined();
    });
  });

  describe("PATCH /api/v1/sections/:sectionId", () => {
    // Update section as admin
    it("should update section as admin", async () => {
      // Create admin first and get cookies
      const { cookies } = await createAndLoginUser(app, "admin");

      // Create a section
      await request(app)
        .post("/api/v1/sections")
        .set("Cookie", cookies)
        .send({
          title: "Section 1",
        })
        .expect(201);

      // Find section by title
      const section: any = await Section.findOne({ title: "Section 1" });

      // Update section
      const res = await request(app)
        .patch(`/api/v1/sections/${section.id}`)
        .set("Cookie", cookies)
        .send({ title: "New section" })
        .expect(200);

      expect(res.body.data.title).toBe("New section");
    });

    // Fail to update section as regular user
    it("should fail to update section as regular user", async () => {
      // Create user first, login and get cookies
      const { cookies } = await createAndLoginUser(app, "user");

      // Create admin who owns the section
      const admin: any = await User.create({
        username: "admin",
        email: "admin@mail.com",
        password: "Password123!",
        role: "admin",
        isVerified: true,
      });

      // Create a section
      const section: any = await Section.create({
        title: "Section 1",
        author: admin.id,
      });

      // Logged user tries to update section
      const res = await request(app)
        .patch(`/api/v1/sections/${section.id}`)
        .set("Cookie", cookies)
        .send({
          title: "New section",
        })
        .expect(401);

      expect(res.body.message).toContain("Unauthorized");
    });

    // Delete section as admin
    it("should delete section as admin", async () => {
      // Create admin first and get cookies
      const { cookies } = await createAndLoginUser(app, "admin");

      // Create section
      await request(app)
        .post("/api/v1/sections")
        .set("Cookie", cookies)
        .send({
          title: "Section 1",
        })
        .expect(201);

      // Find section
      const section: any = await Section.findOne({ title: "Section 1" });

      const res = await request(app)
        .delete(`/api/v1/sections/${section.id}`)
        .set("Cookie", cookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("successfully");
    });

    // Fail to delete section as regular user
    it("should fail to delete section as regular user", async () => {
      // Create user first, login and get cookies
      const { cookies } = await createAndLoginUser(app, "user");

      // Create admin so we can create section
      const admin: any = await User.create({
        username: "admin",
        email: "admin@mail.com",
        password: "Password123!",
        role: "admin",
        isVerified: true,
      });

      // Create a section
      const section: any = await Section.create({
        title: "Section 1",
        author: admin.id,
      });

      const res = await request(app)
        .delete(`/api/v1/sections/${section.id}`)
        .set("Cookie", cookies)
        .expect(401);

      expect(res.body.message).toContain("Unauthorized");
    });
  });
});
