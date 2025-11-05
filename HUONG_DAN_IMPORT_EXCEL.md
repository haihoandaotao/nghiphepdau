# 📊 HƯỚNG DẪN IMPORT NHÂN VIÊN TỪ FILE EXCEL

## 🎯 Tính năng

Cho phép HR/Admin import hàng loạt nhân viên từ file Excel vào hệ thống một cách nhanh chóng và dễ dàng.

---

## 📝 Các bước thực hiện

### Bước 1: Tải file mẫu Excel

1. Đăng nhập với tài khoản HR hoặc ADMIN
2. Vào menu **"Quản lý" → "Nhân viên"**
3. Click nút **"Tải mẫu Excel"** (màu xanh lá)
4. File `mau_danh_sach_nhan_vien.xlsx` sẽ được tải về

### Bước 2: Điền thông tin vào file Excel

Mở file Excel và điền thông tin theo các cột sau:

| Cột | Bắt buộc | Mô tả | Ví dụ |
|-----|----------|-------|-------|
| **Họ tên (*)** | ✅ Có | Họ và tên đầy đủ | Nguyễn Văn A |
| **Email (*)** | ✅ Có | Email duy nhất | nguyenvana@company.com |
| **Mật khẩu (*)** | ✅ Có | Mật khẩu đăng nhập | 123456 |
| **Vai trò (*)** | ✅ Có | EMPLOYEE, MANAGER, HR, hoặc ADMIN | EMPLOYEE |
| **Mã phòng ban** | ❌ Không | Mã phòng ban (nếu có) | IT, HR, SALES |

#### 📌 Lưu ý quan trọng:

- ✅ Các cột có dấu (*) là **BẮT BUỘC**
- ✅ Email phải **duy nhất**, không trùng với nhân viên đã có
- ✅ Vai trò chỉ nhận các giá trị: `EMPLOYEE`, `MANAGER`, `HR`, `ADMIN`
- ✅ Mã phòng ban phải khớp với mã trong hệ thống (IT, HR, SALES, etc.)
- ✅ Nếu không điền mật khẩu, mặc định là `123456`
- ✅ Nếu vai trò không hợp lệ, mặc định là `EMPLOYEE`

### Bước 3: Import file Excel

1. Sau khi điền xong, lưu file Excel
2. Quay lại trang **Quản lý nhân viên**
3. Click nút **"Import Excel"** (màu xanh dương)
4. Chọn file Excel đã chuẩn bị
5. Hệ thống sẽ hiển thị **Xem trước dữ liệu**

### Bước 4: Xem trước và xác nhận

Màn hình xem trước sẽ hiển thị:
- ✅ Số lượng nhân viên sẽ được import
- ✅ Bảng chi tiết từng nhân viên
- ✅ Phòng ban được gán (nếu có)
- ⚠️ Các cảnh báo và lưu ý

Kiểm tra kỹ thông tin, sau đó:
- Click **"Xác nhận Import"** để thực hiện
- Click **"Hủy"** để bỏ qua

### Bước 5: Kiểm tra kết quả

Sau khi import:
- ✅ Thông báo số lượng import thành công
- ⚠️ Thông báo số lượng bị lỗi (nếu có)
- ✅ Danh sách nhân viên được cập nhật tự động

---

## 🔍 Ví dụ file Excel

```
| Họ tên (*)        | Email (*)                | Mật khẩu (*) | Vai trò (*) | Mã phòng ban |
|-------------------|--------------------------|--------------|-------------|--------------|
| Nguyễn Văn A      | nguyenvana@company.com   | 123456       | EMPLOYEE    | IT           |
| Trần Thị B        | tranthib@company.com     | 123456       | MANAGER     | HR           |
| Lê Văn C          | levanc@company.com       | 123456       | EMPLOYEE    | SALES        |
| Phạm Thị D        | phamthid@company.com     | 123456       | HR          | HR           |
| Hoàng Văn E       | hoangvane@company.com    | 123456       | ADMIN       | IT           |
```

---

## ⚠️ Xử lý lỗi

### Lỗi thường gặp:

#### 1. **Email đã tồn tại**
- **Nguyên nhân:** Email bị trùng với nhân viên đã có trong hệ thống
- **Giải pháp:** Kiểm tra và sửa email hoặc xóa dòng đó

#### 2. **Thiếu thông tin bắt buộc**
- **Nguyên nhân:** Không điền Họ tên hoặc Email
- **Giải pháp:** Điền đầy đủ các cột có dấu (*)

#### 3. **Vai trò không hợp lệ**
- **Nguyên nhân:** Vai trò không phải EMPLOYEE, MANAGER, HR, ADMIN
- **Giải pháp:** Hệ thống tự động đặt về EMPLOYEE

#### 4. **Mã phòng ban không tìm thấy**
- **Nguyên nhân:** Mã phòng ban không có trong hệ thống
- **Giải pháp:** Nhân viên được tạo nhưng không thuộc phòng ban nào

#### 5. **Không đọc được file Excel**
- **Nguyên nhân:** File bị lỗi hoặc không đúng định dạng
- **Giải pháp:** Tải lại file mẫu và copy dữ liệu vào

---

## 💡 Mẹo sử dụng hiệu quả

### ✅ Chuẩn bị trước:

1. **Tạo phòng ban trước** khi import nhân viên
2. **Kiểm tra mã phòng ban** trong menu Quản lý → Phòng ban
3. **Chuẩn bị danh sách** email công ty chính xác

### ✅ Import hiệu quả:

1. **Import từ ít đến nhiều**: Test với 2-3 nhân viên trước
2. **Phân nhóm**: Import theo từng phòng ban để dễ quản lý
3. **Backup**: Lưu file Excel để còn sử dụng sau này
4. **Double check**: Xem kỹ màn hình preview trước khi xác nhận

### ✅ Sau import:

1. **Kiểm tra danh sách**: Xem lại nhân viên đã được tạo
2. **Thông báo nhân viên**: Gửi email thông báo tài khoản và mật khẩu
3. **Yêu cầu đổi mật khẩu**: Nhân viên nên đổi mật khẩu ngay lần đăng nhập đầu

---

## 📊 Giới hạn và quy tắc

| Mục | Giới hạn / Quy tắc |
|-----|-------------------|
| Số lượng tối đa mỗi lần | Không giới hạn (khuyến nghị < 1000) |
| Định dạng file | .xlsx, .xls |
| Kích thước file | < 10MB |
| Email | Phải unique, định dạng email hợp lệ |
| Mật khẩu | Tối thiểu 6 ký tự |
| Vai trò | Chỉ: EMPLOYEE, MANAGER, HR, ADMIN |

---

## 🎓 Video hướng dẫn

*(Sẽ cập nhật sau)*

---

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ:
- 📧 Email: support@company.com
- 📞 Hotline: 1900-xxxx
- 💬 Chat: Góc dưới phải màn hình

---

## 📋 Checklist Import thành công

- [ ] Đã tải file mẫu Excel
- [ ] Đã điền đầy đủ thông tin bắt buộc
- [ ] Đã kiểm tra email không trùng
- [ ] Đã kiểm tra mã phòng ban chính xác
- [ ] Đã xem preview trước khi import
- [ ] Đã kiểm tra kết quả sau import
- [ ] Đã thông báo cho nhân viên về tài khoản

---

**Chúc bạn import thành công! 🎉**
