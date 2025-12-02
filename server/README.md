# 🌴 Tropicario Forum API

A modern forum backend with JWT authentication, role-based permissions, and comprehensive testing.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-brightgreen)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-85_passing-success)](https://jestjs.io/)

## ✨ Features

- 🔐 **JWT Authentication** - Secure login with email verification
- 👥 **Role-Based Access Control** - Admin and user permissions
- 📝 **Forum Structure** - Sections → Threads → Topics → Comments
- 📷 **Image Uploads** - Up to 20 images per topic/comment (Cloudinary)
- ✅ **85 Tests** - Unit and integration testing
- 🔍 **Advanced Filtering** - Pagination, sorting, and search
- 📧 **Email System** - Verification and password reset
- 🛡️ **Security** - Rate limiting, input validation, CORS protection
- 🗂️ **File Management** - Automatic cleanup, optimized transformations

## 🛠️ Tech Stack

**Core:**

- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose

**Security:**

- JWT (jsonwebtoken)
- bcrypt (password hashing)
- Helmet.js (HTTP headers)
- express-rate-limit
- express-validator

**File Handling:**

- Cloudinary (image storage & optimization)
- Multer (multipart/form-data)

**Testing:**

- Jest (85 tests)
- Supertest (API testing)
- MongoDB Memory Server

**Other:**

- Nodemailer (emails)
- Compression (gzip)

## 📊 Test Coverage

```
✅ 29 unit tests - User model validation
✅ 34 integration tests - Authentication API
✅ 12 integration tests - Sections API
✅ 10 integration tests - Threads API
────────────────────────────────────
📦 Total: 85 tests passing
```

## 📡 API Testing

### Insomnia (Recommended)

1. Download [Insomnia](https://insomnia.rest/download)
2. Import collections from `docs/insomnia/`
3. Environment is pre-configured (`http://localhost:8080`)
4. Login with admin credentials
5. Cookie is saved automatically - test away!

**📁 [View API Collections](./docs/insomnia/)**

## 📚 API Endpoints

### Authentication (9 endpoints)

| Method | Endpoint                             | Description            | Auth |
| ------ | ------------------------------------ | ---------------------- | ---- |
| POST   | `/api/v1/auth/register`              | Register new user      | No   |
| POST   | `/api/v1/auth/login`                 | Login user             | No   |
| POST   | `/api/v1/auth/logout`                | Logout user            | Yes  |
| GET    | `/api/v1/auth/me`                    | Get current user       | Yes  |
| GET    | `/api/v1/auth/verify-email/:token`   | Verify email           | No   |
| POST   | `/api/v1/auth/resend-verification`   | Resend verification    | No   |
| POST   | `/api/v1/auth/forgot-password`       | Request password reset | No   |
| POST   | `/api/v1/auth/reset-password/:token` | Reset password         | No   |
| POST   | `/api/v1/auth/change-password`       | Change password        | Yes  |

### Sections (6 endpoints)

| Method | Endpoint                 | Description         | Auth  |
| ------ | ------------------------ | ------------------- | ----- |
| GET    | `/api/v1/sections`       | Get all sections    | No    |
| GET    | `/api/v1/sections/:slug` | Get section by slug | No    |
| POST   | `/api/v1/sections`       | Create section      | Admin |
| PATCH  | `/api/v1/sections/:id`   | Update section      | Admin |
| DELETE | `/api/v1/sections/:id`   | Delete section      | Admin |

**Query parameters:** `page`, `limit`, `isActive`, `sortBy`, `order`

### Threads (7 endpoints)

| Method | Endpoint                | Description        | Auth  |
| ------ | ----------------------- | ------------------ | ----- |
| GET    | `/api/v1/threads`       | Get all threads    | No    |
| GET    | `/api/v1/threads/:slug` | Get thread by slug | No    |
| POST   | `/api/v1/threads`       | Create thread      | Admin |
| PATCH  | `/api/v1/threads/:id`   | Update thread      | Admin |
| DELETE | `/api/v1/threads/:id`   | Delete thread      | Admin |

**Query parameters:** `page`, `limit`, `isActive`, `sectionSlug`, `sortBy`, `order`

### Topics (5 endpoints)

| Method | Endpoint               | Description       | Auth |
| ------ | ---------------------- | ----------------- | ---- |
| GET    | `/api/v1/topics`       | Get all topics    | No   |
| GET    | `/api/v1/topics/:slug` | Get topic by slug | No   |
| POST   | `/api/v1/topics`       | Create topic      | Yes  |
| PATCH  | `/api/v1/topics/:slug` | Update topic      | Yes  |
| DELETE | `/api/v1/topics/:slug` | Delete topic      | Yes  |

**Query parameters:** `page`, `limit`, `isActive`, `threadSlug`, `sortBy`  
**Image support:** Up to 20 images per topic

### Comments (4 endpoints)

| Method | Endpoint                      | Description        | Auth |
| ------ | ----------------------------- | ------------------ | ---- |
| GET    | `/api/v1/comments/:topicSlug` | Get topic comments | No   |
| POST   | `/api/v1/comments/:topicSlug` | Create comment     | Yes  |
| PATCH  | `/api/v1/comments/:id`        | Update comment     | Yes  |
| DELETE | `/api/v1/comments/:id`        | Delete comment     | Yes  |

**Query parameters:** `page`, `limit`, `sortBy`, `sortOrder`  
**Image support:** Up to 20 images per comment

### Users & Admin

See [Insomnia collections](./docs/insomnia/) for complete documentation.

**Total Endpoints: 35+**

## 📷 Image Upload Features

**Topics & Comments:**

- Up to 20 images per topic/comment
- Automatic optimization (WebP format, quality adjustment)
- Maximum dimensions: 1200x1200px
- File size limit: 5 MB per image
- Supported formats: JPEG, PNG, WebP
- Organized Cloudinary folders: `/topics` and `/comments`

**User Avatars:**

- Single avatar per user
- Automatic optimization
- Maximum dimensions: 500x500px
- Circular crop optimization

**Storage:**

- Cloudinary CDN for fast delivery
- Automatic cleanup of temporary files
- Optimized transformations on-the-fly

## 📁 Project Structure

```
server/
├── docs/
│   └── insomnia/          # API collections (7 files)
├── uploads/               # Temporary file storage (auto-cleanup)
├── src/
│   ├── __tests__/         # 85 tests
│   │   ├── integration/
│   │   ├── unit/
│   │   └── helpers/
│   ├── config/            # Database & Cloudinary config
│   ├── controllers/       # Route handlers
│   ├── middlewares/       # Auth, upload, error handling
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── seeds/             # Database seeding
│   ├── utils/             # Helpers
│   ├── validators/        # Input validation
│   └── server.ts          # Entry point
├── .env
├── .gitignore
├── jest.config.js
├── package.json
├── tsconfig.json
├── .nvmrc
└── README.md
```

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Miloš Srejić**

- GitHub: [@MilosS994](https://github.com/MilosS994)
- LinkedIn: [Milos Srejic](https://www.linkedin.com/in/milos-srejic)

---

⭐ If you found this project helpful, please give it a star! 🙂
