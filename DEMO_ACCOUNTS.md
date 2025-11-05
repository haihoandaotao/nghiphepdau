# 🔐 TÀI KHOẢN TEST - HỆ THỐNG QUẢN LÝ NGHỈ PHÉP

## 📋 Danh sách tài khoản demo

### 1. 👨‍💼 ADMIN (Quản trị viên)
- **Email:** `admin@test.com`
- **Mật khẩu:** `bất kỳ` (nhập gì cũng được)
- **Họ tên:** Nguyễn Văn Admin
- **Phòng ban:** Phòng IT
- **Quyền:**
  - ✅ Tất cả quyền trong hệ thống
  - ✅ Quản lý nhân viên
  - ✅ Quản lý phòng ban
  - ✅ Quản lý loại phép
  - ✅ Quản lý ngày lễ
  - ✅ Phê duyệt đơn nghỉ phép
  - ✅ Xem báo cáo & thống kê

---

### 2. 👥 HR (Nhân sự)
- **Email:** `hr@test.com`
- **Mật khẩu:** `bất kỳ`
- **Họ tên:** Trần Thị HR
- **Phòng ban:** Phòng Nhân sự
- **Quyền:**
  - ✅ Quản lý nhân viên
  - ✅ Quản lý phòng ban
  - ✅ Quản lý loại phép
  - ✅ Quản lý ngày lễ
  - ✅ Phê duyệt đơn nghỉ phép
  - ✅ Xem báo cáo & thống kê
  - ✅ Tạo/xem đơn nghỉ phép cá nhân

---

### 3. 👔 MANAGER (Quản lý/Trưởng phòng)
- **Email:** `manager@test.com`
- **Mật khẩu:** `bất kỳ`
- **Họ tên:** Lê Văn Manager
- **Phòng ban:** Phòng Kinh doanh
- **Quyền:**
  - ✅ Phê duyệt đơn nghỉ phép của nhân viên
  - ✅ Xem báo cáo & thống kê
  - ✅ Tạo/xem đơn nghỉ phép cá nhân
  - ✅ Xem dashboard
  - ❌ Không có quyền quản lý hệ thống

---

### 4. 👤 EMPLOYEE (Nhân viên)
- **Email:** `employee@test.com`
- **Mật khẩu:** `bất kỳ`
- **Họ tên:** Phạm Thị Nhân Viên
- **Phòng ban:** Phòng IT
- **Quyền:**
  - ✅ Xem dashboard cá nhân
  - ✅ Tạo đơn nghỉ phép
  - ✅ Xem đơn nghỉ phép của mình
  - ✅ Hủy đơn nghỉ phép (nếu đang chờ duyệt)
  - ✅ Chỉnh sửa thông tin cá nhân
  - ❌ Không thể phê duyệt đơn
  - ❌ Không thể xem báo cáo
  - ❌ Không thể quản lý hệ thống

---

## 🎯 Hướng dẫn test

### Test với vai trò EMPLOYEE:
1. Truy cập: http://localhost:3001/login
2. Đăng nhập với:
   - Email: `employee@test.com`
   - Password: `123456` (hoặc bất kỳ)
3. Bạn sẽ thấy:
   - ✅ Menu: Dashboard, Đơn nghỉ phép
   - ❌ KHÔNG thấy: Phê duyệt, Báo cáo, Quản lý

### Test với vai trò MANAGER:
1. Đăng nhập với: `manager@test.com`
2. Bạn sẽ thấy thêm:
   - ✅ Menu: Phê duyệt, Báo cáo
   - ❌ KHÔNG thấy: Quản lý nhân viên, Phòng ban, Loại phép, Ngày lễ

### Test với vai trò HR:
1. Đăng nhập với: `hr@test.com`
2. Bạn sẽ thấy:
   - ✅ Tất cả menu của Manager
   - ✅ Menu quản lý: Nhân viên, Phòng ban, Loại phép, Ngày lễ

### Test với vai trò ADMIN:
1. Đăng nhập với: `admin@test.com`
2. Bạn sẽ thấy:
   - ✅ Tất cả menu và chức năng

---

## 🔒 Test phân quyền

### Test 1: Nhân viên cố gắng truy cập trang Phê duyệt
1. Đăng nhập với `employee@test.com`
2. Thử truy cập: http://localhost:3001/approvals
3. Kết quả: Hiển thị màn hình "🔒 Không có quyền truy cập"

### Test 2: Manager cố gắng truy cập Quản lý nhân viên
1. Đăng nhập với `manager@test.com`
2. Thử truy cập: http://localhost:3001/admin/users
3. Kết quả: Hiển thị màn hình "🔒 Không có quyền truy cập"

### Test 3: Phê duyệt đơn nghỉ phép
1. Đăng nhập với `employee@test.com` → Tạo đơn nghỉ phép
2. Đăng xuất → Đăng nhập lại với `manager@test.com`
3. Vào "Phê duyệt" → Duyệt hoặc từ chối đơn
4. Đăng xuất → Đăng nhập lại với `employee@test.com`
5. Kiểm tra trạng thái đơn đã được cập nhật

---

## 💡 Lưu ý

- ⚠️ Đây là tài khoản DEMO, mật khẩu có thể là bất kỳ gì
- 🔄 Dữ liệu sẽ reset khi restart server
- 🎭 Bạn có thể đăng nhập/đăng xuất liên tục để test các vai trò khác nhau
- 🆕 Nếu đăng nhập bằng email khác, hệ thống sẽ tự tạo tài khoản mới với role EMPLOYEE

---

## 📧 So sánh quyền truy cập

| Chức năng | EMPLOYEE | MANAGER | HR | ADMIN |
|-----------|----------|---------|-----|-------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Đơn nghỉ phép cá nhân | ✅ | ✅ | ✅ | ✅ |
| Hồ sơ cá nhân | ✅ | ✅ | ✅ | ✅ |
| **Phê duyệt đơn** | ❌ | ✅ | ✅ | ✅ |
| **Báo cáo & Thống kê** | ❌ | ✅ | ✅ | ✅ |
| **Quản lý nhân viên** | ❌ | ❌ | ✅ | ✅ |
| **Quản lý phòng ban** | ❌ | ❌ | ✅ | ✅ |
| **Quản lý loại phép** | ❌ | ❌ | ✅ | ✅ |
| **Quản lý ngày lễ** | ❌ | ❌ | ✅ | ✅ |

---

## 🚀 Quick Start

```bash
# 1. Chạy backend (mock server)
cd backend
npm run mock

# 2. Chạy frontend (terminal khác)
cd frontend
npm run dev

# 3. Truy cập
http://localhost:3001

# 4. Đăng nhập với tài khoản bất kỳ ở trên
```

---

**Chúc bạn test vui vẻ! 🎉**
