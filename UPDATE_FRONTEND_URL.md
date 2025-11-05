# Hướng dẫn cập nhật Frontend

## Sau khi có Backend URL, làm theo các bước sau:

1. Copy Backend URL (ví dụ: https://nghiphepdau-backend.onrender.com)

2. Mở file: frontend/.env.production

3. Thay đổi:
   ```
   VITE_API_URL=https://nghiphepdau-backend.onrender.com/api
   ```
   (Thêm /api vào cuối URL!)

4. Commit và push:
   ```powershell
   git add frontend/.env.production
   git commit -m "Update production API URL"
   git push
   ```

Sau đó tiếp tục deploy frontend trên Render.
