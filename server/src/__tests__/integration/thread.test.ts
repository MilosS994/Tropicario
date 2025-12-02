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
import Thread from "../../models/Thread.js";

describe("Thread API Integration Tests", () => {
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

  describe("GET /api/v1/threads", () => {
    // Get all threads with pagination
    it("should get all threads with pagination", async () => {
      // Create an admin who owns sections
      const { user } = await createAndLoginUser(app, "admin");

      //   Create 2 sections
      const sections: any[] = [];
      for (let i = 1; i <= 2; i++) {
        const section: any = await Section.create({
          title: `Section ${i}`,
          description: `Section ${i} description`,
          author: user.id,
        });
        // Add section by section to sections array
        sections.push(section);
      }

      //   Create 10 threads for each section
      for (const section of sections) {
        for (let j = 1; j <= 10; j++) {
          await Thread.create({
            title: `Title ${j} of ${section.title}`,
            author: user.id,
            section: section.id,
          });
        }
      }

      const res = await request(app).get("/api/v1/threads?page=2");

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data));
      res.body.data.forEach((thread: any) => {
        expect(thread.title).toBeDefined();
        expect(thread.section).toBeDefined();
        expect(thread.author).toBeDefined();
      });
      expect(res.body.data).toHaveLength(10);
      expect(res.body.pagination.currentPage).toBe(2);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.totalItems).toBe(20);
      expect(res.body.pagination.totalPages).toBe(2);
      expect(res.body.pagination.hasNextPage).toBe(false);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });

    // Filter threads by sectionSlug
    it("should filter threads by section slug", async () => {
      // Create an admin who owns sections
      const { user } = await createAndLoginUser(app, "admin");

      //   Create 2 sections
      const sections: any[] = [];
      for (let i = 1; i <= 2; i++) {
        const section: any = await Section.create({
          title: `Section ${i}`,
          description: `Section ${i} description`,
          author: user.id,
        });
        // Add section by section to sections array
        sections.push(section);
      }

      //   Create 10 threads for each section
      for (const section of sections) {
        for (let j = 1; j <= 10; j++) {
          await Thread.create({
            title: `Title ${j} of ${section.title}`,
            author: user.id,
            section: section.id,
          });
        }
      }

      const res = await request(app)
        .get(
          `/api/v1/threads?sectionSlug=${sections[0].slug}` // Only for first section
        )
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(10);
      res.body.data.forEach((thread: any) => {
        expect(thread.section.id).toBe(sections[0].id);
        expect(thread.section.slug).toBe(sections[0].slug);
      });
    });

    // Filter threads by isActive
    it("should filter threads by isActive", async () => {
      // Create an admin who owns sections
      const { user } = await createAndLoginUser(app, "admin");

      //   Create 2 sections
      const sections: any[] = [];
      for (let i = 1; i <= 2; i++) {
        const section: any = await Section.create({
          title: `Section ${i}`,
          description: `Section ${i} description`,
          author: user.id,
        });
        // Add section by section to sections array
        sections.push(section);
      }

      //   Create 10 threads for each section
      for (const section of sections) {
        for (let j = 1; j <= 10; j++) {
          await Thread.create({
            title: `Title ${j} of ${section.title}`,
            author: user.id,
            section: section.id,
            isActive: j <= 8, // We will make 16 active threads (8 threads in each section) and 4 inactive (2 in each section)
          });
        }
      }

      const res = await request(app).get(
        "/api/v1/threads?isActive=true&limit=20"
      );

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data));
      expect(res.body.data).toHaveLength(16); // we set the limit to 20 so it should be only one page with 16 threads
      res.body.data.forEach((thread: any) => {
        expect(thread.isActive).toBe(true);
      });
      expect(res.body.pagination.totalPages).toBe(1);
      expect(res.body.pagination.currentPage).toBe(1);
      expect(res.body.pagination.hasNextPage).toBe(false);
    });

    // Get single thread by slug
    it("should get a single thread by slug", async () => {
      // Create an admin who owns sections
      const { user } = await createAndLoginUser(app, "admin");

      //   Create 2 sections
      const sections: any[] = [];
      for (let i = 1; i <= 2; i++) {
        const section: any = await Section.create({
          title: `Section ${i}`,
          description: `Section ${i} description`,
          author: user.id,
        });
        // Add section by section to sections array
        sections.push(section);
      }

      //   Create 10 threads for each section
      for (const section of sections) {
        for (let j = 1; j <= 10; j++) {
          await Thread.create({
            title: `Title ${j} of ${section.title}`,
            author: user.id,
            section: section.id,
          });
        }
      }

      const thread: any = await Thread.findOne({
        title: "Title 2 of Section 1",
      });

      const res = await request(app)
        .get(`/api/v1/threads/${thread.slug}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.title).toBe("Title 2 of Section 1");
    });

    // Fail to get a single thread by non-existent slug
    it("should fail to get a single thread by non-existent slug", async () => {
      const res = await request(app)
        .get("/api/v1/threads/non-existent-slug")
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
      expect(res.body.data).toBeUndefined();
    });
  });

  // --------------------------------
  // --------------------------------
  // ADMIN
  // --------------------------------
  // --------------------------------

  describe("POST /api/v1/threads", () => {
    // Create a new thread as admin
    it("should create a new thread as admin", async () => {
      // Create an admin and login first
      const { cookies, user } = await createAndLoginUser(app, "admin");

      //   Create a section
      const section = await Section.create({
        title: "Section 1",
        author: user.id,
      });

      const res = await request(app)
        .post("/api/v1/threads")
        .set("Cookie", cookies)
        .send({
          title: "Thread",
          sectionSlug: section.slug,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.author).toBe(user.id);
      expect(res.body.data.section).toBe(section.id);
    });

    // Fail to create a new thread as regular user
    it("should fail to create a new thread as regular user", async () => {
      // Create a regular user and login first
      const { cookies, user } = await createAndLoginUser(app, "user");

      //   Create an admin who owns section
      const admin: any = await User.create({
        username: "admin",
        email: "admin@mail.com",
        password: "Password123!",
        isVerified: true,
        role: "admin",
      });

      //   Create a section
      const section = await Section.create({
        title: "Section 1",
        author: admin.id,
      });

      const res = await request(app)
        .post("/api/v1/threads")
        .set("Cookie", cookies)
        .send({
          title: "Thread",
          sectionSlug: section.slug,
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.data).toBeUndefined();
      expect(res.body.message).toContain("Unauthorized");
    });

    // Fail to create duplicate thread
    it("should fail to create a new thread if it is a duplicate", async () => {
      // Create an admin and login first
      const { cookies, user } = await createAndLoginUser(app, "admin");

      //   Create a section
      const section = await Section.create({
        title: "Section 1",
        author: user.id,
      });

      //   Create first thread
      await request(app)
        .post("/api/v1/threads")
        .set("Cookie", cookies)
        .send({
          title: "Thread",
          sectionSlug: section.slug,
        })
        .expect(201);

      // Now try to create second thread
      const res = await request(app)
        .post("/api/v1/threads")
        .set("Cookie", cookies)
        .send({
          title: "Thread",
          sectionSlug: section.slug,
        })
        .expect(400);

      expect(res.body.data).toBeUndefined();
      expect(res.body.message).toContain("already exists");
    });
  });

  describe("PATCH /api/v1/threads/:threadId", () => {
    // Update thread as admin
    it("should update thread as admin", async () => {
      // Create an admin and login first
      const { cookies, user } = await createAndLoginUser(app, "admin");

      //   Create a section
      const section = await Section.create({
        title: "Section 1",
        author: user.id,
      });

      //   Create thread
      const thread = await Thread.create({
        title: "Thread",
        section: section.id,
        author: user.id,
      });

      const res = await request(app)
        .patch(`/api/v1/threads/${thread.id}`)
        .set("Cookie", cookies)
        .send({ title: "New Thread" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("New Thread");
    });
  });

  describe("DELETE /api/v1/threads/:threadId", () => {
    // Delete a thread as admin
    it("should delete thread as admin", async () => {
      // Create an admin and login first
      const { cookies, user } = await createAndLoginUser(app, "admin");

      //   Create a section
      const section = await Section.create({
        title: "Section 1",
        author: user.id,
      });

      //   Create thread
      const thread = await Thread.create({
        title: "Thread",
        section: section.id,
        author: user.id,
      });

      const res = await request(app)
        .delete(`/api/v1/threads/${thread.id}`)
        .set("Cookie", cookies)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("successfully");
    });
  });
});
