# 🏢 Hệ thống Quản lý Nghỉ Phép - Leave Management System

## 📋 Mục lục
- [Tổng quan](#tổng-quan)
- [Tính năng chính](#tính-năng-chính)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Hướng dẫn cài đặt](#hướng-dẫn-cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy dự án](#chạy-dự-án)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Screenshots](#screenshots)

## 🎯 Tổng quan

Hệ thống quản lý nghỉ phép (Leave Management System) là một ứng dụng web full-stack giúp doanh nghiệp quản lý hiệu quả các đơn nghỉ phép của nhân viên.

### Đối tượng sử dụng:
- **Nhân viên (EMPLOYEE)**: Tạo và quản lý đơn nghỉ phép cá nhân
- **Quản lý (MANAGER)**: Phê duyệt đơn nghỉ phép của nhân viên trong team
- **Nhân sự (HR)**: Quản lý toàn bộ hệ thống, cấu hình, và báo cáo
- **Quản trị viên (ADMIN)**: Quản lý người dùng và cấu hình hệ thống

## ✨ Tính năng chính

### 1. Module Xác thực & Phân quyền
- ✅ Đăng ký/ Đăng nhập với JWT
- ✅ Phân quyền theo vai trò (Role-Based Access Control)
- ✅ Bảo mật API endpoints
- ✅ Quản lý phiên đăng nhập

### 2. Module Quản lý Nhân viên
- ✅ Hồ sơ cá nhân
- ✅ Quản lý số ngày phép (phép năm, phép bệnh)
- ✅ Lịch sử công tác
- ✅ Phân quyền và gán phòng ban

### 3. Module Đăng ký Nghỉ phép
- ✅ Tạo đơn nghỉ phép với nhiều loại phép
- ✅ Kiểm tra số ngày phép còn lại
- ✅ Upload file đính kèm
- ✅ Chỉnh sửa/Hủy đơn đang chờ duyệt

### 4. Module Phê duyệt
- ✅ Danh sách đơn chờ phê duyệt
- ✅ Xem chi tiết đơn với lịch sử
- ✅ Chấp nhận/Từ chối với ghi chú
- ✅ Thông báo tự động cho nhân viên

### 5. Module Báo cáo & Thống kê
- ✅ Báo cáo ngày phép theo nhân viên
- ✅ Thống kê theo phòng ban/thời gian
- ✅ Dashboard với biểu đồ
- ✅ Export báo cáo (Excel/PDF)

### 6. Module Thông báo
- ✅ Thông báo real-time
- ✅ Đánh dấu đã đọc/chưa đọc
- ✅ Lịch sử thông báo

### 7. Module Cài đặt Hệ thống
- ✅ Quản lý loại phép
- ✅ Quản lý phòng ban
- ✅ Quản lý ngày lễ
- ✅ Cấu hình quy trình phê duyệt

## 🛠 Công nghệ sử dụng

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Express Validator
- **Security**: bcryptjs, CORS

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **API Client**: Axios
- **UI Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Toastify
- **Data Fetching**: TanStack React Query
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Date**: date-fns

## 📁 Cấu trúc dự án

```
nghiphep/
├── backend/                    # Backend API
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts    # Prisma client config
│   │   ├── controllers/       # Request handlers
│   │   │   ├── auth.controller.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── leaveRequest.controller.ts
│   │   │   ├── leaveType.controller.ts
│   │   │   ├── department.controller.ts
│   │   │   ├── report.controller.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── holiday.controller.ts
│   │   ├── middlewares/       # Middleware functions
│   │   │   ├── auth.middleware.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/            # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── leaveRequest.routes.ts
│   │   │   ├── leaveType.routes.ts
│   │   │   ├── department.routes.ts
│   │   │   ├── report.routes.ts
│   │   │   ├── notification.routes.ts
│   │   │   └── holiday.routes.ts
│   │   └── server.ts          # Express server
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   └── layout/
│   │   │       ├── Layout.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Header.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── leave/
│   │   │   │   ├── MyLeaveRequests.tsx
│   │   │   │   ├── CreateLeaveRequest.tsx
│   │   │   │   └── LeaveRequestDetail.tsx
│   │   │   ├── approval/
│   │   │   │   └── ApprovalManagement.tsx
│   │   │   ├── admin/
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   ├── DepartmentManagement.tsx
│   │   │   │   ├── LeaveTypeManagement.tsx
│   │   │   │   └── HolidayManagement.tsx
│   │   │   ├── reports/
│   │   │   │   └── Reports.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   └── Profile.tsx
│   │   ├── store/             # State management
│   │   │   └── authStore.ts
│   │   ├── lib/               # Utilities
│   │   │   └── axios.ts
│   │   ├── types/             # TypeScript types
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── package.json               # Root package.json (monorepo)
├── .gitignore
└── README.md
```

## 🚀 Hướng dẫn cài đặt

### Yêu cầu hệ thống
- **Node.js**: v18.0.0 trở lên
- **npm**: v9.0.0 trở lên
- **PostgreSQL**: v14.0 trở lên

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd nghiphep
```

### Bước 2: Cài đặt dependencies

#### Cài đặt tất cả packages (Backend + Frontend)
```bash
npm install
npm run install:all
```

Hoặc cài đặt riêng từng phần:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Bước 3: Cấu hình PostgreSQL Database

1. **Tạo database mới:**
```sql
CREATE DATABASE leave_management;
```

2. **Tạo user (optional):**
```sql
CREATE USER leave_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE leave_management TO leave_user;
```

## ⚙️ Cấu hình

### Backend Configuration

1. **Copy file `.env.example` thành `.env`:**
```bash
cd backend
cp .env.example .env
```

2. **Cập nhật file `.env`:**
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/leave_management?schema=public"

# JWT Secret (đổi thành chuỗi ngẫu nhiên phức tạp)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
JWT_EXPIRES_IN=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email (Optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourcompany.com
```

3. **Chạy Prisma migrations:**
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

4. **Seed database (Optional - Thêm dữ liệu mẫu):**
Bạn có thể tạo file `prisma/seed.ts` để thêm dữ liệu mẫu.

### Frontend Configuration

1. **Copy file `.env.example` thành `.env`:**
```bash
cd frontend
cp .env.example .env
```

2. **Cập nhật file `.env`:**
```env
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Chạy dự án

### Development Mode

#### Chạy cả Backend và Frontend cùng lúc (từ thư mục root):
```bash
npm run dev
```

#### Hoặc chạy riêng từng phần:

**Backend:**
```bash
cd backend
npm run dev
# Server chạy tại: http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App chạy tại: http://localhost:3000
```

### Production Mode

#### Build cả hai phần:
```bash
npm run build
```

#### Build riêng:

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn A",
  "departmentId": "uuid-here" (optional)
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "Nguyễn Văn A",
    "role": "EMPLOYEE"
  },
  "token": "jwt-token-here"
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "jwt-token-here"
}
```

### User Endpoints

Tất cả endpoints yêu cầu header:
```
Authorization: Bearer <jwt-token>
```

#### Get Current User Profile
```http
GET /api/users/profile
```

#### Update Profile
```http
PUT /api/users/profile
Content-Type: application/json

{
  "fullName": "New Name",
  "phoneNumber": "0123456789",
  "currentPassword": "old-pass",
  "newPassword": "new-pass"
}
```

#### Get Leave Balance
```http
GET /api/users/leave-balance
```

**Response:**
```json
{
  "annualLeave": {
    "total": 12,
    "used": 5,
    "remaining": 7
  },
  "sickLeave": {
    "total": 30,
    "used": 2,
    "remaining": 28
  }
}
```

### Leave Request Endpoints

#### Create Leave Request
```http
POST /api/leave-requests
Content-Type: application/json

{
  "leaveTypeId": "uuid",
  "startDate": "2024-01-15",
  "endDate": "2024-01-17",
  "totalDays": 3,
  "reason": "Nghỉ phép thăm gia đình",
  "attachment": "url-to-file" (optional)
}
```

#### Get My Leave Requests
```http
GET /api/leave-requests/my-requests?page=1&limit=10&status=PENDING
```

#### Get All Leave Requests (Manager/HR/Admin)
```http
GET /api/leave-requests?page=1&limit=10&status=PENDING
```

#### Get Leave Request Detail
```http
GET /api/leave-requests/:id
```

#### Update Leave Request
```http
PUT /api/leave-requests/:id
Content-Type: application/json

{
  "reason": "Updated reason",
  "totalDays": 2
}
```

#### Cancel Leave Request
```http
DELETE /api/leave-requests/:id
```

#### Approve Leave Request (Manager/HR/Admin)
```http
POST /api/leave-requests/:id/approve
Content-Type: application/json

{
  "comments": "Approved" (optional)
}
```

#### Reject Leave Request (Manager/HR/Admin)
```http
POST /api/leave-requests/:id/reject
Content-Type: application/json

{
  "comments": "Reason for rejection"
}
```

### Leave Type Endpoints

#### Get All Leave Types
```http
GET /api/leave-types
```

#### Create Leave Type (HR/Admin)
```http
POST /api/leave-types
Content-Type: application/json

{
  "code": "ANNUAL",
  "name": "Phép năm",
  "description": "Phép nghỉ hàng năm",
  "maxDays": 12
}
```

### Department Endpoints

#### Get All Departments
```http
GET /api/departments
```

#### Create Department (HR/Admin)
```http
POST /api/departments
Content-Type: application/json

{
  "name": "Phòng IT",
  "description": "Phòng công nghệ thông tin"
}
```

### Report Endpoints (Manager/HR/Admin)

#### Get Leave Statistics
```http
GET /api/reports/leave-statistics?startDate=2024-01-01&endDate=2024-12-31&departmentId=uuid
```

#### Get Department Report
```http
GET /api/reports/department-report?departmentId=uuid&year=2024
```

#### Get User Leave History
```http
GET /api/reports/user-leave-history/:userId?year=2024
```

### Notification Endpoints

#### Get My Notifications
```http
GET /api/notifications?page=1&limit=20&isRead=false
```

#### Mark Notification as Read
```http
PUT /api/notifications/:id/read
```

#### Mark All as Read
```http
PUT /api/notifications/read-all
```

## 🗄 Database Schema

### Main Tables

#### Users
- id (UUID, PK)
- email (String, Unique)
- password (String, Hashed)
- fullName (String)
- role (Enum: EMPLOYEE, MANAGER, HR, ADMIN)
- departmentId (UUID, FK)
- managerId (UUID, FK)
- annualLeaveQuota (Int, default: 12)
- sickLeaveQuota (Int, default: 30)
- phoneNumber (String, Optional)
- avatar (String, Optional)
- isActive (Boolean, default: true)
- createdAt (DateTime)
- updatedAt (DateTime)

#### Departments
- id (UUID, PK)
- name (String, Unique)
- description (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

#### LeaveTypes
- id (UUID, PK)
- code (Enum: ANNUAL, SICK, UNPAID, MATERNITY, PATERNITY, BEREAVEMENT, OTHER)
- name (String)
- description (String, Optional)
- maxDays (Int, Optional)
- isActive (Boolean, default: true)
- createdAt (DateTime)
- updatedAt (DateTime)

#### LeaveRequests
- id (UUID, PK)
- userId (UUID, FK)
- leaveTypeId (UUID, FK)
- startDate (DateTime)
- endDate (DateTime)
- totalDays (Float)
- reason (String)
- status (Enum: PENDING, APPROVED, REJECTED, CANCELLED)
- attachment (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

#### Approvals
- id (UUID, PK)
- leaveRequestId (UUID, FK)
- approverId (UUID, FK)
- status (Enum: PENDING, APPROVED, REJECTED)
- comments (String, Optional)
- approvedAt (DateTime)

#### Notifications
- id (UUID, PK)
- userId (UUID, FK)
- title (String)
- message (String)
- isRead (Boolean, default: false)
- link (String, Optional)
- createdAt (DateTime)

#### Holidays
- id (UUID, PK)
- name (String)
- date (DateTime)
- description (String, Optional)
- createdAt (DateTime)
- updatedAt (DateTime)

## 🔐 Roles & Permissions

### EMPLOYEE
- Xem và cập nhật hồ sơ cá nhân
- Tạo, xem, chỉnh sửa đơn nghỉ phép của mình
- Xem số ngày phép còn lại
- Nhận thông báo

### MANAGER
- Tất cả quyền của EMPLOYEE
- Phê duyệt/Từ chối đơn nghỉ phép của nhân viên trong team
- Xem báo cáo của team

### HR
- Tất cả quyền của MANAGER
- Quản lý tất cả đơn nghỉ phép
- Quản lý phòng ban
- Quản lý loại phép
- Quản lý ngày lễ
- Xem tất cả báo cáo

### ADMIN
- Tất cả quyền trong hệ thống
- Quản lý người dùng (tạo, sửa, xóa, phân quyền)
- Cấu hình hệ thống

## 🧪 Testing

### Tạo tài khoản test
Bạn có thể đăng ký trực tiếp qua UI hoặc sử dụng API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123",
    "fullName": "Admin Test"
  }'
```

Sau đó cập nhật role trong database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@test.com';
```

## 📝 Notes

### Lưu ý khi triển khai

1. **Security:**
   - Đổi `JWT_SECRET` thành chuỗi phức tạp
   - Sử dụng HTTPS trong production
   - Cấu hình CORS đúng origin

2. **Database:**
   - Backup database định kỳ
   - Sử dụng connection pool
   - Tối ưu indexes cho performance

3. **Frontend:**
   - Build production với `npm run build`
   - Cấu hình environment variables đúng
   - Sử dụng CDN cho static assets

## 🤝 Contributing

Nếu bạn muốn đóng góp vào dự án:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Contact

Nếu có câu hỏi hoặc góp ý, vui lòng liên hệ qua:
- Email: your-email@example.com
- GitHub Issues: [Create an issue](<repository-issues-url>)

---

**Happy Coding! 🚀**
