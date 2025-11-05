# 🐛 HƯỚNG DẪN SỬA LỖI "User not found"

## ❌ Lỗi gặp phải

Khi click vào badge vai trò để cập nhật, hệ thống báo lỗi:
```
User not found
```

---

## 🔍 Nguyên nhân

Demo accounts (`admin@test.com`, `hr@test.com`, `manager@test.com`, `employee@test.com`) không được lưu vào array `users[]` khi đăng nhập, dẫn đến khi cập nhật không tìm thấy user.

---

## ✅ Đã khắc phục

### 1. Di chuyển `demoAccounts` ra scope global
**Trước:** `demoAccounts` nằm trong hàm `login()`  
**Sau:** `demoAccounts` được định nghĩa ở đầu file, dùng chung cho nhiều endpoints

### 2. Cập nhật endpoint `PUT /api/users/:id`
Thêm logic kiểm tra demo accounts:
```typescript
// If user not found in array, check demo accounts
if (index === -1) {
  const demoUser = Object.values(demoAccounts).find((u: any) => u.id === id);
  if (demoUser) {
    // Add demo user to users array first
    users.push({ ...demoUser });
    index = users.length - 1;
  }
}
```

### 3. Thêm logging để debug
```typescript
console.log('Updating user:', id, 'with data:', req.body);
console.log('User updated successfully:', user);
```

---

## 🎯 Cách hoạt động mới

1. User đăng nhập với demo account (vd: `manager@test.com`)
2. Khi cập nhật vai trò:
   - Backend tìm user trong array `users[]`
   - Nếu không tìm thấy → Tìm trong `demoAccounts`
   - Nếu tìm thấy trong `demoAccounts` → Thêm vào `users[]`
   - Cập nhật vai trò thành công
3. Lần sau cập nhật sẽ tìm thấy trực tiếp trong `users[]`

---

## 📝 Test lại

1. Đăng nhập: `manager@test.com` (password: bất kỳ)
2. Vào **Quản lý → Nhân viên**
3. Click vào badge vai trò của **Manager User**
4. Chọn vai trò mới (vd: HR)
5. Click **"Cập nhật vai trò"**
6. ✅ Thành công!

---

## 🔧 Thay đổi trong code

### Backend: `backend/src/mock-server.ts`

**Dòng 43-85:** Định nghĩa `demoAccounts` global
```typescript
const demoAccounts: any = {
  'admin@test.com': { id: '1', ... },
  'hr@test.com': { id: '2', ... },
  'manager@test.com': { id: '3', ... },
  'employee@test.com': { id: '4', ... },
  'user@test.com': { id: '5', ... },
};
```

**Dòng 293-309:** Cập nhật `PUT /api/users/:id`
```typescript
let index = users.findIndex(u => u.id === id);

// If user not found in array, check demo accounts
if (index === -1) {
  const demoUser = Object.values(demoAccounts).find((u: any) => u.id === id);
  if (demoUser) {
    users.push({ ...demoUser });
    index = users.length - 1;
  }
}
```

---

## 🚀 Chạy lại ứng dụng

```bash
# Terminal 1 - Backend
cd backend
npm run mock

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

Truy cập: http://localhost:3001

---

**Lỗi đã được sửa! Giờ bạn có thể cập nhật vai trò bình thường. ✅**
