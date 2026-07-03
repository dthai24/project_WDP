# S.T.A.R Learning Path — Danh sách API Endpoints

> Tài liệu được tổng hợp từ backend Express (`backend/server.js` và các file trong `backend/routes/`).  
> **Base URL mặc định:** `http://localhost:5000`  
> **Port:** `5000` (hoặc giá trị `process.env.PORT`)

---

## Mục lục

1. [Thông tin chung](#1-thông-tin-chung)
2. [Health Check & Static](#2-health-check--static)
3. [Auth — `/api/auth`](#3-auth--apiauth)
4. [Users — `/api/users`](#4-users--apiusers)
5. [Lookup — `/api`](#5-lookup--api)
6. [Courses — `/api/courses`](#6-courses--apicourses)
7. [Mentor — `/api/mentor`](#7-mentor--apimentor)
8. [Materials — `/api/materials`](#8-materials--apimaterials)
9. [Question Bank — `/api/question-bank`](#9-question-bank--apiquestion-bank)
10. [Admin — `/api/admin`](#10-admin--apiadmin)
11. [API chưa triển khai (frontend mock/TODO)](#11-api-chưa-triển-khai-frontend-mocktodo)

---

## 1. Thông tin chung

### Response format

Hầu hết endpoint trả JSON dạng:

```json
{
  "success": true | false,
  "message": "...",
  "data": { ... }
}
```

Một số endpoint (auth login, streak, profile…) có cấu trúc field riêng — xem chi tiết từng endpoint bên dưới.

### Xác thực

| Loại | Mô tả |
|------|--------|
| **Public** | Không cần đăng nhập |
| **protect** | Cần JWT hoặc `x-user-id` (middleware `authMiddleware.js`) |
| **optionalAuth** | Không bắt buộc; nếu có `x-user-id` hoặc `?userId=` thì gắn `req.user` |
| **adminOnly** | Cần role Admin (header `x-role-name: Admin` hoặc kiểm tra DB) |

### Headers thường dùng

| Header | Mô tả |
|--------|--------|
| `Authorization` | `Bearer <JWT>` — từ login |
| `x-user-id` | ID người dùng (fallback khi chưa dùng JWT) |
| `x-role-name` | Tên role (Admin check) |
| `Content-Type` | `application/json` hoặc `multipart/form-data` (upload file) |

---

## 2. Health Check & Static

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/ping` | Public | Kiểm tra server còn sống |
| `GET` | `/uploads/*` | Public | File avatar đã upload (static) |
| `GET` | `/assets/*` | Public | Ảnh thumbnail khóa học (static) |

**Ví dụ response `/api/ping`:**

```json
{ "status": "ok", "message": "S.T.A.R Backend is running" }
```

---

## 3. Auth — `/api/auth`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `POST` | `/api/auth/login` | Public | Đăng nhập (Admin, Mentor, Student) |
| `POST` | `/api/auth/register` | Public | Đăng ký Student — gửi OTP qua email |
| `POST` | `/api/auth/verify-otp` | Public | Xác thực OTP đăng ký |
| `POST` | `/api/auth/onboarding` | Public | Lưu khảo sát 3 bước sau đăng ký |
| `POST` | `/api/auth/forgot-password` | Public | Gửi OTP đặt lại mật khẩu |
| `POST` | `/api/auth/reset-password` | Public | Xác nhận OTP và đổi mật khẩu |

### `POST /api/auth/login`

**Body:**

```json
{
  "email": "user@example.com",
  "password": "..."
}
```

**Response thành công:**

```json
{
  "success": true,
  "message": "Đăng nhập thành công!",
  "token": "<JWT>",
  "user": {
    "userId": 1,
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "isFirstLogin": false,
    "roles": ["Student"]
  }
}
```

### `POST /api/auth/register`

**Body:** `{ fullName, dateOfBirth, phone, email, password }`

### `POST /api/auth/verify-otp`

**Body:** `{ email, otpCode }` — OTP hết hạn sau 3 phút.

### `POST /api/auth/onboarding`

**Body:**

```json
{
  "userId": 1,
  "categoryIds": [1, 2],
  "levelId": 1,
  "goal": "Mục tiêu học tập"
}
```

### `POST /api/auth/forgot-password`

**Body:** `{ email }` — OTP hết hạn sau 5 phút.

### `POST /api/auth/reset-password`

**Body:** `{ email, otpCode, newPassword }`

---

## 4. Users — `/api/users`

Tất cả endpoint yêu cầu **protect** (JWT hoặc `x-user-id`).

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/users/profile` | Lấy hồ sơ cá nhân |
| `PUT` | `/api/users/profile` | Cập nhật hồ sơ |
| `PUT` | `/api/users/change-password` | Đổi mật khẩu |
| `POST` | `/api/users/avatar` | Upload avatar (multipart, field `avatar`) |
| `PUT` | `/api/users/goals` | Cập nhật mục tiêu & lĩnh vực quan tâm |

### `GET /api/users/profile`

**Response:** `{ success, profile: { name, email, phone, dateOfBirth, joinedAt, currentLevel, learningGoal, avatarUrl, categories, stats } }`

### `PUT /api/users/profile`

**Body:** `{ name, phone, dateOfBirth }` — không cho sửa email.

### `PUT /api/users/change-password`

**Body:** `{ currentPassword, newPassword }`

### `PUT /api/users/goals`

**Body:** `{ learningGoal, categoryIds: [1, 2, 3] }`

---

## 5. Lookup — `/api`

Dữ liệu tra cứu công khai (danh mục, trình độ).

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/categories` | Public | Danh sách lĩnh vực / category |
| `GET` | `/api/levels` | Public | Danh sách trình độ / level |

---

## 6. Courses — `/api/courses`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/courses/top` | Public | Dummy — top courses (trả mảng rỗng) |
| `GET` | `/api/courses/continue/:userId` | Public | Khóa học đang học gần nhất |
| `GET` | `/api/courses/featured` | Public | Khóa học nổi bật |
| `GET` | `/api/courses/featured-paths` | Public | Lộ trình nổi bật |
| `GET` | `/api/courses/student` | optionalAuth | Catalog — danh sách khóa học |
| `POST` | `/api/courses/my-courses` | Public* | Khóa học của tôi (theo role) |
| `GET` | `/api/courses/my-courses/:courseId/chapters` | optionalAuth | Mục lục chương/bài |
| `GET` | `/api/courses/my-courses/:courseId` | Public* | Chi tiết khóa học theo tab |
| `POST` | `/api/courses/mentor/courses/save/draft` | Public* | Mentor — lưu nháp bước 1 |
| `POST` | `/api/courses/mentor/courses/createCourse` | Public* | Mentor — tạo khóa học hoàn chỉnh |
| `POST` | `/api/courses/enroll` | Public* | Đăng ký khóa học |
| `GET` | `/api/courses/:courseId/comments` | optionalAuth | Danh sách bình luận |
| `POST` | `/api/courses/:courseId/comments` | optionalAuth | Tạo bình luận / đánh giá |
| `GET` | `/api/courses/:id/learning` | Public* | Lộ trình học + tiến độ |
| `POST` | `/api/courses/:id/progress` | Public* | Đánh dấu bài học hoàn thành |
| `GET` | `/api/courses/streak` | Public* | Streak học tập (header `x-user-id`) |

> *Không dùng middleware `protect` nhưng nhiều endpoint cần `x-user-id` trong header hoặc body.

### `GET /api/courses/student`

**Query params:** `search`, `category`, `level`, `status`, `sort` (mặc định `newest`)

### `POST /api/courses/my-courses`

**Body:** `{ userId, roleName }`  
**Query:** `?status=all` (Student filter)

### `GET /api/courses/my-courses/:courseId`

**Query bắt buộc:** `?tab=course` hoặc `?tab=content`  
**Header tùy chọn:** `x-user-id`

### `POST /api/courses/mentor/courses/save/draft`

**Body (bước 1):**

```json
{
  "CourseName": "...",
  "Description": "...",
  "Thumbnail": "data:image/... hoặc null",
  "CategoryId": 1,
  "LevelId": 1,
  "InstructorId": 2,
  "IsPublished": false
}
```

### `POST /api/courses/mentor/courses/createCourse`

**Body:**

```json
{
  "course": {
    "CourseName": "...",
    "Description": "...",
    "Thumbnail": "...",
    "CategoryId": 1,
    "LevelId": 1,
    "InstructorId": 2,
    "IsPublished": true
  },
  "paths": [
    {
      "PathName": "...",
      "Description": "...",
      "PathOrder": 1,
      "nodes": []
    }
  ]
}
```

### `POST /api/courses/enroll`

**Body:** `{ userId, courseId }`

### `POST /api/courses/:courseId/comments`

**Header:** `x-user-id` (bắt buộc)  
**Body:** `{ content, rating?, parentCommentId? }` — rating 1–5, content tối đa 250 ký tự. Cần học ít nhất 1 bài mới được đánh giá.

### `GET /api/courses/:id/learning`

**Header:** `x-user-id`

**Response:** `{ success, courseTitle, instructor, data }`

### `POST /api/courses/:id/progress`

**Header:** `x-user-id`  
**Body:** `{ nodeId }`

### `GET /api/courses/streak`

**Header:** `x-user-id`

**Response:** `{ success, streak, hasStudiedToday }`

---

## 7. Mentor — `/api/mentor`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/mentor/courses/:courseId/students` | Public* | Danh sách học viên trong khóa |
| `GET` | `/api/mentor/courses/:courseId/comments` | optionalAuth | Bình luận (mentor view) |
| `POST` | `/api/mentor/courses/:courseId/comments` | optionalAuth | Mentor tạo bình luận |
| `PATCH` | `/api/mentor/courses/:courseId/comments/:commentId/reply` | optionalAuth | Mentor trả lời bình luận |
| `PATCH` | `/api/mentor/courses/:courseId` | optionalAuth | Cập nhật thông tin khóa học |
| `PUT` | `/api/mentor/courses/:courseId/content` | optionalAuth | Cập nhật nội dung (chương/bài) |
| `GET` | `/api/mentor/courses/:courseId/setPublic` | Public* | Xuất bản khóa học |
| `GET` | `/api/mentor/courses/:courseId/setDraft` | Public* | Chuyển khóa về nháp |

### `PATCH /api/mentor/courses/:courseId`

**Body:** `{ CourseName, Description, Thumbnail?, CategoryId, LevelId, IsPublished, InstructorId? }`

### `PUT /api/mentor/courses/:courseId/content`

**Body:** cấu trúc paths/nodes nội dung khóa học (cây chương-bài-học liệu).

### `PATCH /api/mentor/courses/:courseId/comments/:commentId/reply`

**Body:** `{ content }`

---

## 8. Materials — `/api/materials`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/materials/text-content` | Public | Proxy lấy HTML từ Cloudinary |
| `POST` | `/api/materials/upload` | Public* | Upload học liệu lên Cloudinary |

### `GET /api/materials/text-content`

**Query:** `?url=<cloudinary_url>` — chỉ chấp nhận URL `*.cloudinary.com`

### `POST /api/materials/upload`

**Body theo loại:**

| type | Content-Type | Body / Field |
|------|--------------|--------------|
| `TEXT` | `application/json` | `{ type: "TEXT", html/content, title? }` |
| `DOC` | `multipart/form-data` | field file + `{ type: "DOC" }` |
| `AUDIO` | `multipart/form-data` | field file + `{ type: "AUDIO" }` |

Giới hạn file: **10 MB**.

---

## 9. Question Bank — `/api/question-bank`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|--------|
| `GET` | `/api/question-bank/getAllBankOfMentor` | optionalAuth | Danh sách ngân hàng câu hỏi của mentor |
| `GET` | `/api/question-bank/getBankById/:bankId` | optionalAuth | Chi tiết question bank theo ID |
| `GET` | `/api/question-bank/courses/:courseId/paths/:pathId/sections` | optionalAuth | Danh sách section trong chương |
| `GET` | `/api/question-bank/sections/:sectionId/questions` | optionalAuth | Câu hỏi trong section |

### `GET /api/question-bank/getAllBankOfMentor`

**Query bắt buộc:** `?userId=<mentorId>`

### `GET /api/question-bank/sections/:sectionId/questions`

**Query tùy chọn:** `?courseId=&pathId=` — validate section thuộc course/path

---

## 10. Admin — `/api/admin`

Tất cả endpoint yêu cầu **protect** + **adminOnly**.

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| `GET` | `/api/admin/dashboard` | Thống kê dashboard |
| `GET` | `/api/admin/users` | Danh sách users |
| `POST` | `/api/admin/users` | Tạo user mới |
| `GET` | `/api/admin/users/:userId` | Chi tiết user + roles |
| `PUT` | `/api/admin/users/:userId` | Cập nhật user |
| `DELETE` | `/api/admin/users/:userId` | Xóa user |
| `PUT` | `/api/admin/users/:userId/roles` | Cập nhật roles |
| `GET` | `/api/admin/roles` | Danh sách roles |
| `GET` | `/api/admin/categories` | Danh sách categories (admin) |
| `POST` | `/api/admin/categories` | Tạo category |
| `PUT` | `/api/admin/categories/:categoryId` | Cập nhật category |
| `DELETE` | `/api/admin/categories/:categoryId` | Xóa category |
| `GET` | `/api/admin/levels` | Danh sách levels (admin) |
| `POST` | `/api/admin/levels` | Tạo level |
| `PUT` | `/api/admin/levels/:levelId` | Cập nhật level |
| `DELETE` | `/api/admin/levels/:levelId` | Xóa level |
| `GET` | `/api/admin/courses` | Danh sách khóa học (admin) |
| `PUT` | `/api/admin/courses/:courseId` | Cập nhật khóa học |
| `DELETE` | `/api/admin/courses/:courseId` | Xóa khóa học |

### `POST /api/admin/users`

**Body:** `{ FullName, Email, Phone?, DateOfBirth?, Password, Role? }`

### `PUT /api/admin/users/:userId`

**Body:** `{ FullName, Email, Phone?, DateOfBirth?, LearningGoal?, CurrentLevelId? }`

### `PUT /api/admin/users/:userId/roles`

**Body:** `{ roleIds: [1, 2] }`

### `POST /api/admin/categories` / `PUT .../:categoryId`

**Body:** `{ DisplayName, Description?, Color?, Icon? }` (tùy model)

### `POST /api/admin/levels` / `PUT .../:levelId`

**Body:** `{ DisplayName, Description?, Order? }` (tùy model)

---

## 11. API chưa triển khai (frontend mock/TODO)

Các endpoint dưới đây **chưa có trong backend** — frontend đang dùng mock hoặc ghi TODO:

| Method | Endpoint (dự kiến) | Ghi chú |
|--------|-------------------|---------|
| `GET` | `/api/mentor/courses` | Danh sách khóa mentor (filter, pagination) |
| `GET` | `/api/mentor/courses/:courseId` | Chi tiết khóa mentor |
| `GET` | `/api/mentor/courses/:courseId/students/stats` | Thống kê học viên |
| `GET` | `/api/courses/:courseId/tests/:scope/meta` | Meta bài test |
| `POST` | `/api/courses/:courseId/tests/:scope/start` | Bắt đầu làm bài test |
| `POST` | `/api/courses/:courseId/tests/attempts/:attemptId/submit` | Nộp bài test |
| CRUD | `/api/admin/news/*` | Quản lý tin tức (mock trong `adminNewsService.js`) |

---

## Tổng hợp nhanh theo số lượng

| Nhóm | Số endpoint |
|------|-------------|
| Health & Static | 3 |
| Auth | 6 |
| Users | 5 |
| Lookup | 2 |
| Courses | 16 |
| Mentor | 8 |
| Materials | 2 |
| Question Bank | 4 |
| Admin | 19 |
| **Tổng (đã triển khai)** | **65** |

---

*Tài liệu cập nhật: 02/07/2026 — chỉ phản ánh code backend hiện tại, không sửa source code.*
