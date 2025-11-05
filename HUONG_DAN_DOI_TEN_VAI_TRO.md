# 📝 HƯỚNG DẪN THAY ĐỔI TÊN VAI TRÒ

## 🎯 Mục đích

File này hướng dẫn bạn cách **thay đổi tên hiển thị** của các vai trò trong hệ thống một cách dễ dàng mà không cần sửa nhiều nơi.

---

## 📁 File cấu hình

Tất cả tên vai trò được quản lý tập trung tại:

```
frontend/src/config/roles.ts
```

---

## 🔧 Cách thay đổi

### 1. Mở file cấu hình

```typescript
// frontend/src/config/roles.ts

export const ROLE_NAMES = {
  EMPLOYEE: 'Nhân viên',      // ← Thay đổi tên ở đây
  MANAGER: 'Trưởng phòng',    // ← Thay đổi tên ở đây
  HR: 'Nhân sự',              // ← Thay đổi tên ở đây
  ADMIN: 'Quản trị viên',     // ← Thay đổi tên ở đây
} as const;
```

### 2. Thay đổi mô tả (tùy chọn)

```typescript
export const ROLE_DESCRIPTIONS = {
  EMPLOYEE: 'Quyền cơ bản: Tạo và xem đơn nghỉ phép cá nhân',
  MANAGER: 'Quyền: Phê duyệt đơn nghỉ phép, xem báo cáo',
  HR: 'Quyền: Quản lý nhân viên, phòng ban, loại phép',
  ADMIN: 'Toàn quyền: Quản lý toàn bộ hệ thống',
} as const;
```

### 3. Lưu file và reload trang

Thay đổi sẽ áp dụng **ngay lập tức** trên toàn bộ ứng dụng!

---

## 💡 Ví dụ thay đổi

### Ví dụ 1: Đổi "Manager" thành "Quản lý"

**Trước:**
```typescript
MANAGER: 'Trưởng phòng',
```

**Sau:**
```typescript
MANAGER: 'Quản lý',
```

### Ví dụ 2: Đổi "HR" thành "Phòng Nhân sự"

**Trước:**
```typescript
HR: 'Nhân sự',
```

**Sau:**
```typescript
HR: 'Phòng Nhân sự',
```

### Ví dụ 3: Đổi "Admin" thành "Người quản trị"

**Trước:**
```typescript
ADMIN: 'Quản trị viên',
```

**Sau:**
```typescript
ADMIN: 'Người quản trị',
```

---

## 📍 Các nơi sẽ tự động cập nhật

Khi bạn thay đổi tên trong file config, các nơi sau sẽ **tự động** hiển thị tên mới:

✅ **Trang Quản lý nhân viên**
- Badge vai trò trong bảng
- Dropdown chọn vai trò khi thêm/sửa
- Modal cập nhật vai trò

✅ **Trang Profile**
- Hiển thị vai trò của user

✅ **Menu Navigation**
- Hiển thị vai trò trong header

✅ **Form đăng ký/chỉnh sửa**
- Dropdown chọn vai trò

✅ **Báo cáo & Thống kê**
- Hiển thị vai trò trong reports

---

## ⚠️ Lưu ý quan trọng

### ❌ KHÔNG thay đổi key (phần bên trái)

**ĐÚNG:**
```typescript
MANAGER: 'Tên mới của bạn',  // ← Chỉ thay đổi phần này
```

**SAI:**
```typescript
QUAN_LY: 'Quản lý',  // ← KHÔNG đổi key 'MANAGER' thành 'QUAN_LY'
```

### ✅ Chỉ thay đổi value (phần bên phải)

Key (`EMPLOYEE`, `MANAGER`, `HR`, `ADMIN`) phải giữ nguyên vì:
- Backend API sử dụng key này
- Database lưu key này
- Logic phân quyền dựa vào key này

---

## 🌍 Hỗ trợ đa ngôn ngữ

Bạn có thể tạo nhiều file config cho các ngôn ngữ khác:

### Tiếng Việt (mặc định)
```typescript
// frontend/src/config/roles.ts
export const ROLE_NAMES = {
  EMPLOYEE: 'Nhân viên',
  MANAGER: 'Trưởng phòng',
  HR: 'Nhân sự',
  ADMIN: 'Quản trị viên',
};
```

### Tiếng Anh
```typescript
// frontend/src/config/roles.en.ts
export const ROLE_NAMES = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  HR: 'Human Resources',
  ADMIN: 'Administrator',
};
```

### Tiếng Nhật
```typescript
// frontend/src/config/roles.ja.ts
export const ROLE_NAMES = {
  EMPLOYEE: '社員',
  MANAGER: 'マネージャー',
  HR: '人事',
  ADMIN: '管理者',
};
```

---

## 🔍 Test sau khi thay đổi

1. **Reload trang web** (Ctrl + R hoặc F5)
2. **Kiểm tra các trang:**
   - Quản lý → Nhân viên (bảng và modal)
   - Profile (vai trò hiển thị)
   - Đăng nhập (nếu hiển thị vai trò)
3. **Tạo/Sửa nhân viên** để test dropdown

---

## 📊 So sánh trước và sau

### TRƯỚC KHI THAY ĐỔI:

```
┌────────────────────────────────────┐
│ Vai trò:  [Manager]               │
└────────────────────────────────────┘
```

### SAU KHI THAY ĐỔI (ví dụ đổi thành "Quản lý"):

```
┌────────────────────────────────────┐
│ Vai trò:  [Quản lý]               │
└────────────────────────────────────┘
```

---

## 🎨 Tùy chỉnh thêm

Ngoài tên và mô tả, bạn có thể thêm:

### Icon cho từng vai trò
```typescript
export const ROLE_ICONS = {
  EMPLOYEE: '👤',
  MANAGER: '👔',
  HR: '👥',
  ADMIN: '👑',
};
```

### Màu sắc cho từng vai trò
```typescript
export const ROLE_COLORS = {
  EMPLOYEE: { bg: 'bg-gray-100', text: 'text-gray-800' },
  MANAGER: { bg: 'bg-green-100', text: 'text-green-800' },
  HR: { bg: 'bg-blue-100', text: 'text-blue-800' },
  ADMIN: { bg: 'bg-purple-100', text: 'text-purple-800' },
};
```

---

## 🆘 Troubleshooting

### Lỗi: Không thấy thay đổi sau khi sửa

**Giải pháp:**
1. Hard reload: `Ctrl + Shift + R` (Windows) hoặc `Cmd + Shift + R` (Mac)
2. Xóa cache trình duyệt
3. Kiểm tra file đã lưu chưa
4. Restart dev server: `npm run dev`

### Lỗi: Build bị lỗi

**Nguyên nhân:** Syntax sai trong file TypeScript

**Giải pháp:**
1. Kiểm tra dấu phẩy, ngoặc
2. Kiểm tra dấu nháy đơn/kép
3. Xem terminal có báo lỗi gì không

---

## 📚 Ví dụ file hoàn chỉnh

```typescript
// frontend/src/config/roles.ts

// Định nghĩa tên vai trò
export const ROLE_NAMES = {
  EMPLOYEE: 'Nhân viên',
  MANAGER: 'Trưởng phòng',
  HR: 'Nhân sự',
  ADMIN: 'Quản trị viên',
} as const;

// Định nghĩa mô tả vai trò
export const ROLE_DESCRIPTIONS = {
  EMPLOYEE: 'Quyền cơ bản: Tạo và xem đơn nghỉ phép cá nhân',
  MANAGER: 'Quyền: Phê duyệt đơn nghỉ phép, xem báo cáo',
  HR: 'Quyền: Quản lý nhân viên, phòng ban, loại phép',
  ADMIN: 'Toàn quyền: Quản lý toàn bộ hệ thống',
} as const;

export type RoleType = keyof typeof ROLE_NAMES;

// Hàm helper lấy tên vai trò
export const getRoleName = (role: RoleType): string => {
  return ROLE_NAMES[role] || role;
};

// Hàm helper lấy mô tả vai trò
export const getRoleDescription = (role: RoleType): string => {
  return ROLE_DESCRIPTIONS[role] || '';
};
```

---

## ✅ Checklist

- [ ] Đã mở file `frontend/src/config/roles.ts`
- [ ] Đã thay đổi tên vai trò trong `ROLE_NAMES`
- [ ] Đã thay đổi mô tả vai trò trong `ROLE_DESCRIPTIONS` (nếu cần)
- [ ] Đã lưu file
- [ ] Đã reload trang web
- [ ] Đã kiểm tra trang Quản lý nhân viên
- [ ] Đã kiểm tra modal cập nhật vai trò
- [ ] Tên hiển thị đã đúng như mong muốn

---

**Chúc bạn tùy chỉnh thành công! 🎉**
