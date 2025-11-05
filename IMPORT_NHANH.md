# 🚀 HƯỚNG DẪN NHANH - IMPORT NHÂN VIÊN

## ⚡ 3 Bước đơn giản

### 1️⃣ TẢI MẪU EXCEL
```
Quản lý → Nhân viên → Click "Tải mẫu Excel" 
```
File `mau_danh_sach_nhan_vien.xlsx` sẽ tải về máy

---

### 2️⃣ ĐIỀN THÔNG TIN

Mở file Excel vừa tải, điền theo mẫu:

| Họ tên (*) | Email (*) | Mật khẩu (*) | Vai trò (*) | Mã phòng ban |
|------------|-----------|--------------|-------------|--------------|
| Nguyễn Văn A | nguyenvana@company.com | 123456 | EMPLOYEE | IT |
| Trần Thị B | tranthib@company.com | 123456 | MANAGER | HR |

**Chú ý:**
- ✅ Họ tên, Email, Mật khẩu, Vai trò: **BẮT BUỘC**
- ✅ Vai trò chỉ có: `EMPLOYEE`, `MANAGER`, `HR`, `ADMIN`
- ✅ Mã phòng ban: `IT`, `HR`, `SALES`, `ADMIN` (hoặc mã trong hệ thống)

---

### 3️⃣ IMPORT VÀO HỆ THỐNG

```
Quản lý → Nhân viên → Click "Import Excel" → Chọn file → Xác nhận
```

✅ Xong! Hệ thống sẽ tự động thêm tất cả nhân viên

---

## 📌 VÍ DỤ FILE EXCEL

### Sheet: "Danh sách nhân viên"

```
Dòng 1 (Header):
Họ tên (*) | Email (*) | Mật khẩu (*) | Vai trò (*) | Mã phòng ban

Dòng 2:
Nguyễn Văn A | nguyenvana@company.com | 123456 | EMPLOYEE | IT

Dòng 3:
Trần Thị B | tranthib@company.com | abcd1234 | MANAGER | HR

Dòng 4:
Lê Văn C | levanc@company.com | xyz789 | HR | HR

Dòng 5:
Phạm Thị D | phamthid@company.com | test123 | ADMIN | IT
```

---

## ⚠️ LỖI THƯỜNG GẶP

| Lỗi | Nguyên nhân | Cách khắc phục |
|-----|-------------|----------------|
| Email đã tồn tại | Trùng email | Đổi email khác |
| Thiếu thông tin | Không điền đủ cột (*) | Điền đầy đủ |
| Vai trò sai | Không phải EMPLOYEE/MANAGER/HR/ADMIN | Sửa lại vai trò |
| Phòng ban không có | Mã phòng ban sai | Kiểm tra mã trong hệ thống |

---

## 💡 MẸO HAY

1. **Test nhỏ trước:** Import 2-3 người để test trước khi import hàng loạt
2. **Backup file Excel:** Lưu lại để import lần sau
3. **Check preview:** Xem kỹ màn hình preview trước khi xác nhận
4. **Tạo phòng ban trước:** Đảm bảo phòng ban đã có trong hệ thống

---

## 🎯 DEMO ACCOUNTS ĐỂ TEST

Đăng nhập với:
- **HR:** hr@test.com (mật khẩu: bất kỳ)
- **Admin:** admin@test.com (mật khẩu: bất kỳ)

Vào menu **Quản lý → Nhân viên** để bắt đầu!

---

**Xem hướng dẫn chi tiết tại:** `HUONG_DAN_IMPORT_EXCEL.md` 📖
