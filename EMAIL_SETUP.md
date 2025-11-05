# Hướng dẫn cấu hình Email thông báo

Hệ thống hỗ trợ gửi email tự động khi có đơn nghỉ phép mới đến:
- **Trưởng phòng** (nếu nhân viên thuộc phòng ban có trưởng phòng)
- **Nhân sự (HR)**
- **Quản trị viên (ADMIN)**

## 🔧 Cấu hình SMTP

### 1. Sử dụng Gmail

**Bước 1:** Bật xác thực 2 bước cho tài khoản Gmail
- Vào: https://myaccount.google.com/security
- Bật "2-Step Verification"

**Bước 2:** Tạo App Password
- Vào: https://myaccount.google.com/apppasswords
- Chọn "App": Mail
- Chọn "Device": Other (custom name) → Nhập "Leave Management System"
- Copy mật khẩu được tạo ra (16 ký tự)

**Bước 3:** Cập nhật file `.env` trong thư mục `backend/`

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password-16-chars
SMTP_FROM=your-email@gmail.com
FRONTEND_URL=https://nghiphepdau.onrender.com
```

### 2. Sử dụng SMTP khác (Office 365, Custom SMTP)

**Office 365:**
```bash
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_FROM=your-email@company.com
FRONTEND_URL=https://nghiphepdau.onrender.com
```

**Custom SMTP Server:**
```bash
SMTP_HOST=mail.yourcompany.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourcompany.com
SMTP_PASS=your-password
SMTP_FROM=noreply@yourcompany.com
FRONTEND_URL=https://nghiphepdau.onrender.com
```

## 📧 Nội dung Email

Email sẽ bao gồm:
- ✅ Thông tin nhân viên (Họ tên, Email, Phòng ban)
- ✅ Loại nghỉ phép
- ✅ Ngày bắt đầu và kết thúc
- ✅ Số ngày nghỉ
- ✅ Lý do nghỉ phép (nếu có)
- ✅ Nút link trực tiếp đến trang phê duyệt

## 🔄 Cấu hình trên Render.com

1. Vào Dashboard Render.com
2. Chọn service **nghiphepdau-bk**
3. Vào **Environment** → **Environment Variables**
4. Thêm các biến môi trường:
   - `SMTP_HOST`: smtp.gmail.com
   - `SMTP_PORT`: 587
   - `SMTP_SECURE`: false
   - `SMTP_USER`: your-email@gmail.com
   - `SMTP_PASS`: your-app-password
   - `SMTP_FROM`: your-email@gmail.com
   - `FRONTEND_URL`: https://nghiphepdau.onrender.com
5. Nhấn **Save Changes**
6. Service sẽ tự động restart

## 🧪 Test Email (Development)

Nếu **KHÔNG** cấu hình SMTP, hệ thống sẽ:
- ❌ Không gửi email thật
- ✅ Log thông tin email ra console
- ✅ Hiển thị ai sẽ nhận email
- ✅ Hiển thị nội dung email

**Xem log trên Render.com:**
1. Vào service **nghiphepdau-bk**
2. Chọn tab **Logs**
3. Tạo đơn nghỉ phép mới
4. Xem log `📧 [MOCK EMAIL] Would send to: ...`

## ✅ Kiểm tra Email đã gửi

Sau khi cấu hình SMTP:
1. Đăng nhập với tài khoản nhân viên
2. Tạo đơn nghỉ phép mới
3. Kiểm tra email của HR/Admin/Manager

**Log thành công:**
```
✅ Email sent successfully to: hr@test.com, admin@test.com
```

## 🐛 Troubleshooting

**Lỗi "Authentication failed":**
- ✅ Kiểm tra lại SMTP_USER và SMTP_PASS
- ✅ Với Gmail: Đảm bảo dùng App Password, không phải mật khẩu thường
- ✅ Kiểm tra xác thực 2 bước đã bật

**Lỗi "Connection timeout":**
- ✅ Kiểm tra SMTP_HOST và SMTP_PORT
- ✅ Kiểm tra firewall/network
- ✅ Với Render.com: SMTP port 587 và 25 có thể bị chặn, thử port 465 với SMTP_SECURE=true

**Không nhận được email:**
- ✅ Kiểm tra spam folder
- ✅ Kiểm tra SMTP_FROM có đúng không
- ✅ Xem log để đảm bảo email đã được gửi

## 📝 Lưu ý

- Email chỉ được gửi khi **tạo đơn nghỉ phép mới**
- Email không được gửi khi **cập nhật** hoặc **hủy** đơn
- Nếu không cấu hình SMTP, hệ thống vẫn hoạt động bình thường (chỉ không gửi email)
- Khuyến nghị: Dùng email riêng cho hệ thống (vd: noreply@dau.edu.vn)

## 🚀 Production Checklist

- [ ] Tạo email riêng cho hệ thống (noreply@...)
- [ ] Cấu hình SMTP credentials
- [ ] Thêm environment variables trên Render.com
- [ ] Test gửi email thành công
- [ ] Kiểm tra email không vào spam
- [ ] Cập nhật SMTP_FROM thành domain chính thức
- [ ] Cập nhật FRONTEND_URL thành domain production
