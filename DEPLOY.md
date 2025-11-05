# 🚀 Hướng dẫn Deploy lên Render.com

## Bước 1: Chuẩn bị

### 1.1 Push code lên GitHub
```powershell
# Khởi tạo Git (nếu chưa có)
git init

# Thêm tất cả files
git add .

# Commit
git commit -m "Ready for deployment"

# Tạo repository mới trên GitHub, sau đó:
git remote add origin https://github.com/your-username/nghiphep.git
git branch -M main
git push -u origin main
```

## Bước 2: Deploy Backend

### 2.1 Tạo PostgreSQL Database
1. Đăng nhập https://render.com
2. Click **"New +"** → **"PostgreSQL"**
3. Đặt tên: `nghiphep-db`
4. Chọn **Free** plan
5. Click **"Create Database"**
6. **Copy Internal Database URL** (bắt đầu bằng postgres://...)

### 2.2 Deploy Backend API
1. Click **"New +"** → **"Web Service"**
2. Connect GitHub repository
3. Điền thông tin:
   - **Name:** `nghiphep-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start:mock`
   - **Instance Type:** Free

4. **Environment Variables** - Click "Advanced" → "Add Environment Variable":
   ```
   NODE_ENV=production
   DATABASE_URL=<paste-database-url-here>
   JWT_SECRET=DAU_nghiphep_2025_secret_key_change_this
   PORT=5000
   ```

5. Click **"Create Web Service"**
6. Đợi 5-10 phút để deploy
7. **Copy URL của backend** (ví dụ: https://nghiphep-backend.onrender.com)

## Bước 3: Deploy Frontend

### 3.1 Cập nhật API URL
1. Mở file `frontend/.env.production`
2. Thay thế URL:
   ```
   VITE_API_URL=https://nghiphep-backend.onrender.com/api
   ```
3. Commit và push:
   ```powershell
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push
   ```

### 3.2 Deploy Frontend
1. Click **"New +"** → **"Static Site"**
2. Connect cùng GitHub repository
3. Điền thông tin:
   - **Name:** `nghiphep-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **Environment Variables:**
   ```
   VITE_API_URL=https://nghiphep-backend.onrender.com/api
   ```

5. Click **"Create Static Site"**
6. Đợi 5-10 phút để deploy

## Bước 4: Kiểm tra

### 4.1 Test Backend
Mở trình duyệt và truy cập:
```
https://nghiphep-backend.onrender.com/api/health
```
Kết quả: `{"status":"OK","message":"Mock Leave Management API is running"}`

### 4.2 Test Frontend
Truy cập URL frontend (ví dụ: https://nghiphep-frontend.onrender.com)

### 4.3 Đăng nhập
Sử dụng tài khoản demo:
- **Email:** admin@test.com
- **Password:** bất kỳ (mock server không check password)

## ⚠️ Lưu ý

### Free Plan Limitations
- Backend sleep sau 15 phút không sử dụng
- Lần đầu truy cập sẽ mất 30-60 giây để wake up
- Có giới hạn 750 giờ/tháng (đủ dùng)

### Cập nhật code
Mỗi khi push code mới lên GitHub, Render sẽ tự động deploy lại:
```powershell
git add .
git commit -m "Your update message"
git push
```

### Custom Domain (Tùy chọn)
1. Vào Settings của Web Service/Static Site
2. Click "Custom Domain"
3. Thêm domain của bạn (ví dụ: nghiphep.dau.edu.vn)
4. Cập nhật DNS records theo hướng dẫn

## 🎉 Hoàn thành!

Ứng dụng của bạn đã được deploy và có thể truy cập từ bất kỳ đâu!

**URLs:**
- Frontend: https://nghiphep-frontend.onrender.com
- Backend API: https://nghiphep-backend.onrender.com/api

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check logs trong Render Dashboard
2. Kiểm tra Environment Variables
3. Đảm bảo DATABASE_URL đúng format
4. Verify Build & Start commands
