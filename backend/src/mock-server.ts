import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import QRCode from 'qrcode';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file PDF, Word, Excel, JPG, PNG'));
    }
  }
});

// Office location configuration for GPS validation
const OFFICE_LOCATION = {
  lat: 16.0544, // Latitude của văn phòng (ví dụ: Đà Nẵng)
  lng: 108.2022, // Longitude của văn phòng
  radiusMeters: 200 // Bán kính cho phép (200m)
};

// Haversine formula to calculate distance between two GPS coordinates
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Email configuration
const createEmailTransporter = () => {
  // Check if SMTP config exists
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Mock transporter for development (logs to console)
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
};

const emailTransporter = createEmailTransporter();

// Email sending function
const sendLeaveRequestNotification = async (leaveRequest: any, employee: any) => {
  try {
    // Find HR and ADMIN users
    const hrUsers = users.filter((u: any) => u.role === 'HR' || u.role === 'ADMIN');
    
    // Find manager if employee has department
    let managerUser = null;
    if (employee.departmentId) {
      const department = departments.find((d: any) => d.id === employee.departmentId);
      if (department?.managerId) {
        managerUser = users.find((u: any) => u.id === department.managerId);
      }
    }
    
    // Collect all recipients
    const recipients = [...hrUsers];
    if (managerUser) {
      recipients.push(managerUser);
    }
    
    if (recipients.length === 0) {
      console.log('⚠️  No recipients found for leave request notification');
      return;
    }
    
    const recipientEmails = recipients.map((u: any) => u.email).join(', ');
    
    const leaveTypeName = leaveTypes.find((lt: any) => lt.id === leaveRequest.leaveTypeId)?.name || 'Không xác định';
    
    const emailContent = {
      from: process.env.SMTP_FROM || 'noreply@dau.edu.vn',
      to: recipientEmails,
      subject: `[Đơn nghỉ phép mới] ${employee.fullName} - ${leaveTypeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thông báo đơn nghỉ phép mới</h1>
          </div>
          
          <div style="padding: 20px; background-color: #f9fafb;">
            <h2 style="color: #1f2937;">Thông tin nhân viên</h2>
            <p><strong>Họ tên:</strong> ${employee.fullName}</p>
            <p><strong>Email:</strong> ${employee.email}</p>
            ${employee.department ? `<p><strong>Phòng ban:</strong> ${employee.department.name}</p>` : ''}
            
            <h2 style="color: #1f2937; margin-top: 30px;">Chi tiết đơn nghỉ phép</h2>
            <p><strong>Loại nghỉ phép:</strong> ${leaveTypeName}</p>
            <p><strong>Từ ngày:</strong> ${new Date(leaveRequest.startDate).toLocaleDateString('vi-VN')}</p>
            <p><strong>Đến ngày:</strong> ${new Date(leaveRequest.endDate).toLocaleDateString('vi-VN')}</p>
            <p><strong>Số ngày:</strong> ${leaveRequest.totalDays} ngày</p>
            ${leaveRequest.reason ? `<p><strong>Lý do:</strong> ${leaveRequest.reason}</p>` : ''}
            
            <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e;">
                <strong>Lưu ý:</strong> Vui lòng vào hệ thống để xem chi tiết và phê duyệt đơn nghỉ phép.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/approvals" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Xem chi tiết và phê duyệt
              </a>
            </div>
          </div>
          
          <div style="padding: 20px; text-align: center; background-color: #f3f4f6; color: #6b7280; font-size: 12px;">
            <p>Email này được gửi tự động từ Hệ thống quản lý nghỉ phép - Trường Đại học Kiến trúc Đà Nẵng</p>
          </div>
        </div>
      `,
      text: `
Thông báo đơn nghỉ phép mới

Nhân viên: ${employee.fullName}
Email: ${employee.email}
${employee.department ? `Phòng ban: ${employee.department.name}` : ''}

Chi tiết đơn nghỉ phép:
- Loại nghỉ phép: ${leaveTypeName}
- Từ ngày: ${new Date(leaveRequest.startDate).toLocaleDateString('vi-VN')}
- Đến ngày: ${new Date(leaveRequest.endDate).toLocaleDateString('vi-VN')}
- Số ngày: ${leaveRequest.totalDays} ngày
${leaveRequest.reason ? `- Lý do: ${leaveRequest.reason}` : ''}

Vui lòng vào hệ thống để xem chi tiết và phê duyệt đơn nghỉ phép.
      `,
    };
    
    const result: any = await emailTransporter.sendMail(emailContent);
    
    // Log for mock/development mode
    if (result.message) {
      console.log('📧 [MOCK EMAIL] Would send to:', recipientEmails);
      console.log('📋 Subject:', emailContent.subject);
      console.log('📨 Message preview:', JSON.parse(result.message).html.substring(0, 200) + '...');
    } else {
      console.log('✅ Email sent successfully to:', recipientEmails);
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

app.use(cors({ 
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://nghiphepdau.onrender.com',
    /\.onrender\.com$/  // Allow all Render domains
  ], 
  credentials: true 
}));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir)); // Serve uploaded files

// Mock authentication middleware
const mockAuth = (req: any, res: Response, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  // Parse user ID from token (format: mock-jwt-token-{userId})
  const userId = token.replace('mock-jwt-token-', '');
  
  // Find user in demo accounts
  const demoUser = Object.values(demoAccounts).find((u: any) => u.id === userId);
  if (demoUser) {
    req.user = demoUser;
    next();
    return;
  }
  
  // Find in regular users
  const user = users.find((u: any) => u.id === userId);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
    return;
  }
  
  // Default fallback
  req.user = {
    id: userId,
    email: 'test@test.com',
    fullName: 'Test User',
    role: 'ADMIN',
  };
  next();
};

// Role check middleware
const checkRole = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: any) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Forbidden - Bạn không có quyền truy cập chức năng này',
        requiredRoles: allowedRoles,
        yourRole: req.user.role,
      });
    }
    next();
  };
};

// Mock data
let users: any[] = [];

// Demo accounts with different roles
const demoAccounts: any = {
  'admin@test.com': {
    id: '1',
    email: 'admin@test.com',
    fullName: 'Nguyễn Văn Admin',
    role: 'ADMIN',
    departmentId: '1',
    department: { id: '1', name: 'Phòng IT' }
  },
  'hr@test.com': {
    id: '2',
    email: 'hr@test.com',
    fullName: 'Trần Thị HR',
    role: 'HR',
    departmentId: '3',
    department: { id: '3', name: 'Phòng Nhân sự' }
  },
  'manager@test.com': {
    id: '3',
    email: 'manager@test.com',
    fullName: 'Lê Văn Manager',
    role: 'MANAGER',
    departmentId: '2',
    department: { id: '2', name: 'Phòng Kinh doanh' }
  },
  'employee@test.com': {
    id: '4',
    email: 'employee@test.com',
    fullName: 'Phạm Thị Nhân Viên',
    role: 'EMPLOYEE',
    departmentId: '1',
    department: { id: '1', name: 'Phòng IT' }
  },
  'user@test.com': {
    id: '5',
    email: 'user@test.com',
    fullName: 'User Test',
    role: 'EMPLOYEE',
    departmentId: '1',
    department: { id: '1', name: 'Phòng IT' }
  }
};

let leaveRequests: any[] = [];
let departments: any[] = [
  { id: '1', name: 'Phòng IT', code: 'IT', managerId: null },
  { id: '2', name: 'Phòng Kinh doanh', code: 'SALES', managerId: null },
  { id: '3', name: 'Phòng Nhân sự', code: 'HR', managerId: null },
];
let leaveTypes: any[] = [
  { id: '1', code: 'ANNUAL', name: 'Phép năm', description: 'Phép nghỉ hàng năm', defaultDays: 12, requiresApproval: true, maxConsecutiveDays: 30, isActive: true },
  { id: '2', code: 'SICK', name: 'Phép bệnh', description: 'Nghỉ ốm', defaultDays: 30, requiresApproval: false, maxConsecutiveDays: null, isActive: true },
  { id: '3', code: 'UNPAID', name: 'Không lương', description: 'Nghỉ không lương', defaultDays: 0, requiresApproval: true, maxConsecutiveDays: null, isActive: true },
];
let holidays: any[] = [
  { id: '1', name: 'Tết Nguyên Đán', date: '2025-01-29', description: 'Tết Âm lịch', createdAt: new Date().toISOString() },
  { id: '2', name: 'Giỗ Tổ Hùng Vương', date: '2025-04-10', description: '10/3 Âm lịch', createdAt: new Date().toISOString() },
  { id: '3', name: 'Giải phóng miền Nam', date: '2025-04-30', description: '30/4', createdAt: new Date().toISOString() },
  { id: '4', name: 'Quốc tế Lao động', date: '2025-05-01', description: '1/5', createdAt: new Date().toISOString() },
  { id: '5', name: 'Quốc khánh', date: '2025-09-02', description: '2/9', createdAt: new Date().toISOString() },
];

// Attendance records
let attendanceRecords: any[] = [];

// Attendance settings
const attendanceSettings = {
  workStartTime: '08:00',
  workEndTime: '17:00',
  lateThreshold: 15, // minutes
  enableLocation: false,
};

// Attendance Token Generation (5-minute window)
const generateAttendanceToken = () => {
  const now = Date.now();
  const interval = 5 * 60 * 1000; // 5 minutes
  const timestamp = Math.floor(now / interval);
  const secret = process.env.ATTENDANCE_SECRET || 'dau-attendance-secret-2025';
  
  const token = crypto
    .createHmac('sha256', secret)
    .update(`attendance:${timestamp}`)
    .digest('hex')
    .substring(0, 32);
  
  const expiresAt = (timestamp + 1) * interval;
  const timeLeft = Math.floor((expiresAt - now) / 1000);
  
  return { token, expiresAt, timeLeft };
};

// Validate Attendance Token
const validateAttendanceToken = (inputToken: string): boolean => {
  const secret = process.env.ATTENDANCE_SECRET || 'dau-attendance-secret-2025';
  
  // Check current token
  const currentToken = generateAttendanceToken();
  if (inputToken === currentToken.token) return true;
  
  // Check previous token (buffer for clock skew)
  const prevTimestamp = Math.floor(Date.now() / (5 * 60 * 1000)) - 1;
  const prevToken = crypto
    .createHmac('sha256', secret)
    .update(`attendance:${prevTimestamp}`)
    .digest('hex')
    .substring(0, 32);
  
  return inputToken === prevToken;
};

// Calculate work status
const calculateWorkStatus = (checkInTime: Date, checkOutTime: Date | null) => {
  const checkInDate = new Date(checkInTime);
  const [startHour, startMinute] = attendanceSettings.workStartTime.split(':').map(Number);
  const workStart = new Date(checkInDate);
  workStart.setHours(startHour, startMinute, 0, 0);
  
  const minutesLate = Math.floor((checkInDate.getTime() - workStart.getTime()) / (1000 * 60));
  
  if (minutesLate > attendanceSettings.lateThreshold) {
    return 'LATE';
  }
  
  if (checkOutTime) {
    const workHours = (new Date(checkOutTime).getTime() - checkInDate.getTime()) / (1000 * 60 * 60);
    if (workHours < 4) {
      return 'HALF_DAY';
    }
  }
  
  return 'PRESENT';
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Mock Leave Management API is running' });
});

// Auth endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, fullName } = req.body;
  const user = {
    id: Date.now().toString(),
    email,
    fullName,
    role: 'EMPLOYEE',
    departmentId: null,
  };
  users.push({ ...user, password });
  
  res.status(201).json({
    message: 'User registered successfully',
    user,
    token: 'mock-jwt-token-' + user.id,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', { email, password });
  
  // Check if it's a demo account
  if (demoAccounts[email]) {
    const demoUser = demoAccounts[email];
    // Demo accounts accept password: Admin@123, Hr@123, Manager@123, Employee@123
    const validPasswords = ['Admin@123', 'Hr@123', 'Manager@123', 'Employee@123'];
    if (!validPasswords.includes(password)) {
      console.log('❌ Invalid password for demo account');
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    console.log('✅ Demo account login successful');
    return res.json({
      message: 'Login successful',
      user: demoUser,
      token: 'mock-jwt-token-' + demoUser.id,
    });
  }

  // Check existing users
  const user = users.find(u => u.email === email);
  
  if (!user) {
    // Create a new user with EMPLOYEE role by default
    const newUser = {
      id: Date.now().toString(),
      email: email,
      fullName: 'New User',
      role: 'EMPLOYEE',
      departmentId: '1',
      department: { id: '1', name: 'Phòng IT' }
    };
    users.push({ ...newUser, password });
    
    return res.json({
      message: 'Login successful',
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id,
    });
  }
  
  const { password: _, ...userWithoutPassword } = user;
  res.json({
    message: 'Login successful',
    user: userWithoutPassword,
    token: 'mock-jwt-token-' + user.id,
  });
});

// User endpoints
app.get('/api/users/profile', (req, res) => {
  res.json({
    id: '1',
    email: 'test@test.com',
    fullName: 'Test User',
    role: 'ADMIN',
    phoneNumber: '0123456789',
    department: {
      id: '1',
      name: 'Phòng IT',
    },
    createdAt: '2024-01-15T00:00:00.000Z',
  });
});

app.put('/api/users/profile', (req, res) => {
  const { fullName, phoneNumber } = req.body;
  res.json({
    message: 'Profile updated successfully',
    user: {
      id: '1',
      email: 'test@test.com',
      fullName,
      phoneNumber,
      role: 'ADMIN',
      department: {
        id: '1',
        name: 'Phòng IT',
      },
      createdAt: '2024-01-15T00:00:00.000Z',
    },
  });
});

app.put('/api/users/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Mock validation - in real app, verify currentPassword
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Thiếu thông tin mật khẩu' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  res.json({ message: 'Password changed successfully' });
});

app.get('/api/users/leave-balance', (req, res) => {
  // Tính toán số ngày đã sử dụng từ các đơn đã được duyệt
  const approvedRequests = leaveRequests.filter(r => r.status === 'APPROVED');
  
  // Lấy danh sách loại phép đang active
  const activeLeaveTypes = leaveTypes.filter(lt => lt.isActive);
  
  // Tính tổng số ngày đã dùng theo từng loại phép
  const usedDays: { [key: string]: number } = {};
  
  activeLeaveTypes.forEach(lt => {
    usedDays[lt.name] = 0;
  });
  
  approvedRequests.forEach(request => {
    const leaveTypeName = request.leaveType?.name;
    if (leaveTypeName && usedDays[leaveTypeName] !== undefined) {
      const days = parseInt(request.totalDays) || 0;
      usedDays[leaveTypeName] += days;
    }
  });
  
  // Tạo response từ dữ liệu thực tế của leaveTypes
  const leaveBalance = activeLeaveTypes.map(lt => ({
    leaveType: lt.name,
    total: parseInt(lt.defaultDays) || 0,
    used: usedDays[lt.name] || 0,
    remaining: (parseInt(lt.defaultDays) || 0) - (usedDays[lt.name] || 0)
  }));
  
  res.json({ leaveBalance });
});

// User management endpoints (HR/Admin only)
app.get('/api/users', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  // Combine demo accounts and dynamic users
  const demoUsersList = Object.values(demoAccounts);
  
  // Create a map to track which users have been updated or deleted
  const userMap = new Map();
  
  // First, add all dynamic users (these are updated versions)
  users.forEach((user: any) => {
    userMap.set(user.id, user);
  });
  
  // Then, add demo accounts only if they haven't been updated or deleted
  demoUsersList.forEach((user: any) => {
    if (!userMap.has(user.id)) {
      userMap.set(user.id, user);
    }
  });
  
  // Convert map to array and filter out deleted users
  const allUsers = Array.from(userMap.values()).filter((user: any) => !user._deleted);
  
  // Populate department info for all users
  const usersWithDepartment = allUsers.map((user: any) => {
    const userCopy = { ...user };
    if (userCopy.departmentId && !userCopy.department) {
      const dept = departments.find(d => d.id === userCopy.departmentId);
      if (dept) {
        userCopy.department = { id: dept.id, name: dept.name };
      }
    }
    const { password, ...userWithoutPassword } = userCopy;
    return userWithoutPassword;
  });
  
  res.json({ users: usersWithDepartment });
});

app.post('/api/users', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const newUser: any = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  
  // Populate department info if departmentId is provided
  if (newUser.departmentId) {
    const department = departments.find(d => d.id === newUser.departmentId);
    if (department) {
      newUser.department = {
        id: department.id,
        name: department.name,
      };
    }
  }
  
  users.push(newUser);
  const { password, ...userWithoutPassword } = newUser;
  res.status(201).json({ message: 'User created', user: userWithoutPassword });
});

app.put('/api/users/:id', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { id } = req.params;
  console.log('Updating user:', id, 'with data:', req.body);
  
  let index = users.findIndex(u => u.id === id);
  
  // If user not found in array, check demo accounts
  if (index === -1) {
    const demoUser = Object.values(demoAccounts).find((u: any) => u.id === id);
    if (demoUser) {
      // Add demo user to users array first
      users.push(Object.assign({}, demoUser));
      index = users.length - 1;
    }
  }
  
  if (index >= 0) {
    // Merge data, but preserve important fields like id and email
    const updatedUser = {
      ...users[index],
      ...req.body,
      id: users[index].id, // Preserve ID
      email: users[index].email, // Preserve email (shouldn't change in update)
    };
    
    // Populate department info if departmentId is provided
    if (updatedUser.departmentId) {
      const department = departments.find(d => d.id === updatedUser.departmentId);
      if (department) {
        updatedUser.department = {
          id: department.id,
          name: department.name,
        };
      }
    } else {
      // Clear department if departmentId is null/empty
      updatedUser.department = null;
    }
    
    users[index] = updatedUser;
    
    const { password, ...user } = updatedUser;
    console.log('User updated successfully:', user);
    res.json({ message: 'User updated', user });
  } else {
    console.log('User not found:', id);
    res.status(404).json({ message: 'User not found' });
  }
});

app.delete('/api/users/:id', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { id } = req.params;
  console.log('Deleting user:', id);
  
  // Remove from users array
  const beforeLength = users.length;
  users = users.filter(u => u.id !== id);
  const afterLength = users.length;
  
  // Check if user was a demo account - if so, mark it as deleted
  const isDemoAccount = Object.values(demoAccounts).some((u: any) => u.id === id);
  if (isDemoAccount) {
    // Add a deleted marker to users array so GET won't return it
    users.push({ id, _deleted: true });
    console.log('Demo account marked as deleted:', id);
  } else {
    console.log(`Deleted ${beforeLength - afterLength} user(s) from array`);
  }
  
  res.json({ message: 'User deleted' });
});

// Bulk import users
app.post('/api/users/bulk', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { users: importUsers } = req.body;
  
  if (!importUsers || !Array.isArray(importUsers) || importUsers.length === 0) {
    return res.status(400).json({ message: 'Không có dữ liệu để import' });
  }

  const errors: any[] = [];
  let successCount = 0;

  importUsers.forEach((userData, index) => {
    try {
      // Validate required fields
      if (!userData.email || !userData.fullName) {
        errors.push({ 
          row: index + 1, 
          email: userData.email,
          error: 'Thiếu thông tin bắt buộc (email, họ tên)' 
        });
        return;
      }

      // Check if email already exists
      const existingUser = users.find(u => u.email === userData.email);
      if (existingUser) {
        errors.push({ 
          row: index + 1, 
          email: userData.email,
          error: 'Email đã tồn tại trong hệ thống' 
        });
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now().toString() + '-' + index,
        email: userData.email,
        fullName: userData.fullName,
        password: userData.password || '123456', // Default password
        role: userData.role || 'EMPLOYEE',
        departmentId: userData.departmentId || null,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      successCount++;
    } catch (error) {
      errors.push({ 
        row: index + 1, 
        email: userData.email,
        error: 'Lỗi không xác định' 
      });
    }
  });

  res.json({
    message: `Import thành công ${successCount}/${importUsers.length} nhân viên`,
    successCount,
    totalCount: importUsers.length,
    errors: errors.length > 0 ? errors : undefined,
  });
});

// Bulk upsert (update or insert) users
app.post('/api/users/bulk-upsert', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { users: importUsers } = req.body;
  
  if (!importUsers || !Array.isArray(importUsers) || importUsers.length === 0) {
    return res.status(400).json({ message: 'Không có dữ liệu để import' });
  }

  const errors: any[] = [];
  let createdCount = 0;
  let updatedCount = 0;

  importUsers.forEach((userData, index) => {
    try {
      // Validate required fields
      if (!userData.email || !userData.fullName) {
        errors.push({ 
          row: index + 1, 
          email: userData.email,
          error: 'Thiếu thông tin bắt buộc (email, họ tên)' 
        });
        return;
      }

      // Check if email already exists
      const existingUserIndex = users.findIndex(u => u.email === userData.email);
      
      if (existingUserIndex >= 0) {
        // Update existing user
        const existingUser = users[existingUserIndex];
        users[existingUserIndex] = {
          ...existingUser,
          fullName: userData.fullName,
          role: userData.role || existingUser.role,
          departmentId: userData.departmentId !== undefined ? userData.departmentId : existingUser.departmentId,
          // Only update password if provided
          ...(userData.password && { password: userData.password }),
        };
        updatedCount++;
      } else {
        // Create new user
        const newUser = {
          id: Date.now().toString() + '-' + index,
          email: userData.email,
          fullName: userData.fullName,
          password: userData.password || '123456', // Default password
          role: userData.role || 'EMPLOYEE',
          departmentId: userData.departmentId || null,
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        createdCount++;
      }
    } catch (error) {
      errors.push({ 
        row: index + 1, 
        email: userData.email,
        error: 'Lỗi không xác định' 
      });
    }
  });

  res.json({
    message: `Import thành công: ${createdCount} mới, ${updatedCount} cập nhật`,
    successCount: createdCount + updatedCount,
    createdCount,
    updatedCount,
    totalCount: importUsers.length,
    errors: errors.length > 0 ? errors : undefined,
  });
});

// Leave request endpoints
app.get('/api/leave-requests/my-requests', (req, res) => {
  res.json({
    leaveRequests: leaveRequests,
    pagination: { page: 1, limit: 10, total: leaveRequests.length, totalPages: 1 },
  });
});

app.post('/api/leave-requests', upload.array('attachments', 5), async (req: any, res) => {
  const files = req.files as Express.Multer.File[];
  
  // Lưu thông tin file đính kèm
  const attachments = files ? files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    path: `/uploads/${file.filename}`,
    size: file.size,
    mimetype: file.mimetype
  })) : [];

  // Get employee info
  const employee = users.find((u: any) => u.id === req.body.userId) || req.user;
  const leaveType = leaveTypes.find((lt: any) => lt.id === req.body.leaveTypeId);

  const newRequest = {
    id: Date.now().toString(),
    ...req.body,
    attachments: attachments,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    user: employee ? { 
      id: employee.id, 
      fullName: employee.fullName, 
      email: employee.email,
      department: employee.departmentId ? departments.find((d: any) => d.id === employee.departmentId) : null
    } : { id: '1', fullName: 'Test User', email: 'test@test.com' },
    leaveType: leaveType ? { id: leaveType.id, name: leaveType.name, code: leaveType.code } : { id: '1', name: 'Phép năm', code: 'ANNUAL' },
  };
  leaveRequests.push(newRequest);
  
  // Send email notification
  if (employee) {
    sendLeaveRequestNotification(newRequest, employee).catch(err => {
      console.error('Failed to send email notification:', err);
    });
  }
  
  res.status(201).json({
    message: 'Leave request created successfully',
    leaveRequest: newRequest,
  });
});

app.get('/api/leave-requests/:id', (req, res) => {
  const { id } = req.params;
  const request = leaveRequests.find(r => r.id === id);
  if (request) {
    res.json({ leaveRequest: request });
  } else {
    res.status(404).json({ message: 'Leave request not found' });
  }
});

app.delete('/api/leave-requests/:id', (req, res) => {
  const { id } = req.params;
  leaveRequests = leaveRequests.filter(r => r.id !== id);
  res.json({ message: 'Leave request cancelled' });
});

// Approval endpoints (Manager/HR/Admin only)
app.post('/api/leave-requests/:id/approve', mockAuth, checkRole(['MANAGER', 'HR', 'ADMIN']), (req: any, res) => {
  const { id } = req.params;
  const { comments } = req.body;
  const index = leaveRequests.findIndex(r => r.id === id);
  if (index >= 0) {
    leaveRequests[index].status = 'APPROVED';
    leaveRequests[index].approvals = [{
      id: Date.now().toString(),
      status: 'APPROVED',
      comments: comments || '',
      approver: { id: req.user.id, fullName: req.user.fullName, email: req.user.email },
      approvedAt: new Date().toISOString(),
    }];
    res.json({ message: 'Approved', leaveRequest: leaveRequests[index] });
  } else {
    res.status(404).json({ message: 'Leave request not found' });
  }
});

app.post('/api/leave-requests/:id/reject', mockAuth, checkRole(['MANAGER', 'HR', 'ADMIN']), (req: any, res) => {
  const { id } = req.params;
  const { comments } = req.body;
  const index = leaveRequests.findIndex(r => r.id === id);
  if (index >= 0) {
    leaveRequests[index].status = 'REJECTED';
    leaveRequests[index].approvals = [{
      id: Date.now().toString(),
      status: 'REJECTED',
      comments: comments || '',
      approver: { id: req.user.id, fullName: req.user.fullName, email: req.user.email },
      approvedAt: new Date().toISOString(),
    }];
    res.json({ message: 'Rejected', leaveRequest: leaveRequests[index] });
  } else {
    res.status(404).json({ message: 'Leave request not found' });
  }
});

app.get('/api/leave-requests', (req, res) => {
  const { status } = req.query;
  let filtered = leaveRequests;
  if (status && status !== 'ALL') {
    filtered = leaveRequests.filter(r => r.status === status);
  }
  res.json({
    leaveRequests: filtered,
    pagination: { page: 1, limit: 10, total: filtered.length, totalPages: 1 },
  });
});

// Leave types (HR/Admin can modify, all can view)
app.get('/api/leave-types', (req, res) => {
  res.json({ leaveTypes });
});

app.post('/api/leave-types', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const newType = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  leaveTypes.push(newType);
  res.status(201).json({ message: 'Leave type created', leaveType: newType });
});

app.put('/api/leave-types/:id', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { id } = req.params;
  const index = leaveTypes.findIndex(t => t.id === id);
  if (index >= 0) {
    leaveTypes[index] = { ...leaveTypes[index], ...req.body };
    res.json({ message: 'Leave type updated', leaveType: leaveTypes[index] });
  } else {
    res.status(404).json({ message: 'Leave type not found' });
  }
});

app.delete('/api/leave-types/:id', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { id } = req.params;
  leaveTypes = leaveTypes.filter(t => t.id !== id);
  res.json({ message: 'Leave type deleted' });
});

// Departments (HR/Admin can modify, all can view)
app.get('/api/departments', (req, res) => {
  // Populate manager info and count employees
  const deptWithManagers = departments.map(dept => {
    const manager = dept.managerId ? users.find((u: any) => u.id === dept.managerId) : null;
    // Count actual employees in this department
    const employeeCount = users.filter((u: any) => u.departmentId === dept.id).length;
    
    return {
      ...dept,
      manager: manager ? {
        id: manager.id,
        fullName: manager.fullName,
        email: manager.email
      } : null,
      _count: { employees: employeeCount }
    };
  });
  res.json({ departments: deptWithManagers });
});

app.post('/api/departments', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const newDept = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  departments.push(newDept);
  
  // Populate manager info and count employees
  const manager = newDept.managerId ? users.find((u: any) => u.id === newDept.managerId) : null;
  const employeeCount = users.filter((u: any) => u.departmentId === newDept.id).length;
  
  const deptWithManager = {
    ...newDept,
    manager: manager ? {
      id: manager.id,
      fullName: manager.fullName,
      email: manager.email
    } : null,
    _count: { employees: employeeCount }
  };
  
  res.status(201).json({ message: 'Department created', department: deptWithManager });
});

app.put('/api/departments/:id', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { id } = req.params;
  const index = departments.findIndex(d => d.id === id);
  if (index >= 0) {
    departments[index] = { ...departments[index], ...req.body };
    
    // Populate manager info and count employees
    const dept = departments[index];
    const manager = dept.managerId ? users.find((u: any) => u.id === dept.managerId) : null;
    const employeeCount = users.filter((u: any) => u.departmentId === dept.id).length;
    
    const deptWithManager = {
      ...dept,
      manager: manager ? {
        id: manager.id,
        fullName: manager.fullName,
        email: manager.email
      } : null,
      _count: { employees: employeeCount }
    };
    
    res.json({ message: 'Department updated', department: deptWithManager });
  } else {
    res.status(404).json({ message: 'Department not found' });
  }
});

app.delete('/api/departments/:id', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { id } = req.params;
  departments = departments.filter(d => d.id !== id);
  res.json({ message: 'Department deleted' });
});

// Holidays (HR/Admin can modify, all can view)
app.get('/api/holidays', (req, res) => {
  res.json({ holidays });
});

app.post('/api/holidays', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const newHoliday = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
  };
  holidays.push(newHoliday);
  res.status(201).json({ message: 'Holiday created', holiday: newHoliday });
});

app.put('/api/holidays/:id', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { id } = req.params;
  const index = holidays.findIndex(h => h.id === id);
  if (index >= 0) {
    holidays[index] = { ...holidays[index], ...req.body };
    res.json({ message: 'Holiday updated', holiday: holidays[index] });
  } else {
    res.status(404).json({ message: 'Holiday not found' });
  }
});

app.delete('/api/holidays/:id', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  const { id } = req.params;
  holidays = holidays.filter(h => h.id !== id);
  res.json({ message: 'Holiday deleted' });
});

// Reports (Manager/HR/Admin only)
app.get('/api/reports/statistics', mockAuth, checkRole(['MANAGER', 'HR', 'ADMIN']), (req, res) => {
  const totalRequests = leaveRequests.length;
  const pendingRequests = leaveRequests.filter(r => r.status === 'PENDING').length;
  const approvedRequests = leaveRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedRequests = leaveRequests.filter(r => r.status === 'REJECTED').length;
  const totalDays = leaveRequests.reduce((sum, r) => sum + (r.totalDays || 0), 0);

  const byLeaveType = leaveTypes.map(type => ({
    leaveType: type.name,
    count: leaveRequests.filter(r => r.leaveType?.name === type.name).length,
    totalDays: leaveRequests.filter(r => r.leaveType?.name === type.name).reduce((sum, r) => sum + (r.totalDays || 0), 0),
  })).filter(item => item.count > 0);

  const byDepartment = departments.map(dept => ({
    department: dept.name,
    count: leaveRequests.filter(r => r.user?.department?.name === dept.name).length,
    totalDays: leaveRequests.filter(r => r.user?.department?.name === dept.name).reduce((sum, r) => sum + (r.totalDays || 0), 0),
  })).filter(item => item.count > 0);

  const byStatus = [
    { status: 'PENDING', count: pendingRequests },
    { status: 'APPROVED', count: approvedRequests },
    { status: 'REJECTED', count: rejectedRequests },
  ].filter(item => item.count > 0);

  res.json({
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    totalDays,
    byLeaveType,
    byDepartment,
    byStatus,
  });
});

app.get('/api/reports/export', mockAuth, checkRole(['MANAGER', 'HR', 'ADMIN']), (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=leave-report.csv');
  
  let csv = 'ID,User,Leave Type,Start Date,End Date,Total Days,Status\n';
  leaveRequests.forEach(r => {
    csv += `${r.id},${r.user?.fullName},${r.leaveType?.name},${r.startDate},${r.endDate},${r.totalDays},${r.status}\n`;
  });
  
  res.send(csv);
});

// Notifications
app.get('/api/notifications', (req, res) => {
  res.json({
    notifications: [],
    unreadCount: 0,
    pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  });
});

// ==================== ATTENDANCE APIs ====================

// Get current QR token (for display on screen/print)
app.get('/api/attendance/qr-token', mockAuth, checkRole(['HR', 'ADMIN']), async (req, res) => {
  try {
    const { token, expiresAt, timeLeft } = generateAttendanceToken();
    
    // Generate QR code image (base64)
    const qrCodeDataUrl = await QRCode.toDataURL(token, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    res.json({
      token,
      qrCodeDataUrl,
      expiresAt,
      timeLeft,
      refreshInterval: 5 * 60, // 5 minutes in seconds
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// Check-in
app.post('/api/attendance/check-in', mockAuth, async (req: any, res) => {
  try {
    const { token, location, latitude, longitude } = req.body;
    const userId = req.user.id;
    
    // Validate GPS location
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Vui lòng bật GPS để điểm danh' });
    }
    
    const distance = calculateDistance(latitude, longitude, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
    
    if (distance > OFFICE_LOCATION.radiusMeters) {
      return res.status(403).json({ 
        message: `Bạn phải ở trong phạm vi văn phòng để điểm danh (khoảng cách: ${Math.round(distance)}m)`,
        distance: Math.round(distance),
        maxDistance: OFFICE_LOCATION.radiusMeters
      });
    }
    
    // Validate token
    if (!validateAttendanceToken(token)) {
      return res.status(400).json({ message: 'QR code không hợp lệ hoặc đã hết hạn' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if already checked in today
    const existingRecord = attendanceRecords.find(
      (r: any) => r.userId === userId && r.date === today
    );
    
    if (existingRecord && existingRecord.checkInTime) {
      return res.status(400).json({ 
        message: 'Bạn đã check-in hôm nay rồi',
        checkInTime: existingRecord.checkInTime,
      });
    }
    
    const checkInTime = new Date();
    const locationData = `${location || ''} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
    
    if (existingRecord) {
      // Update existing record
      existingRecord.checkInTime = checkInTime.toISOString();
      existingRecord.checkInLocation = locationData;
      existingRecord.status = calculateWorkStatus(checkInTime, null);
    } else {
      // Create new record
      const newRecord = {
        id: Date.now().toString(),
        userId,
        date: today,
        checkInTime: checkInTime.toISOString(),
        checkInLocation: locationData,
        checkOutTime: null,
        checkOutLocation: null,
        status: calculateWorkStatus(checkInTime, null),
        workingHours: null,
        notes: null,
        createdAt: new Date().toISOString(),
      };
      attendanceRecords.push(newRecord);
    }
    
    res.json({
      message: 'Check-in thành công',
      checkInTime: checkInTime.toISOString(),
      status: calculateWorkStatus(checkInTime, null),
      distance: Math.round(distance),
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// Check-out
app.post('/api/attendance/check-out', mockAuth, async (req: any, res) => {
  try {
    const { token, location, latitude, longitude } = req.body;
    const userId = req.user.id;
    
    // Validate GPS location
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Vui lòng bật GPS để điểm danh' });
    }
    
    const distance = calculateDistance(latitude, longitude, OFFICE_LOCATION.lat, OFFICE_LOCATION.lng);
    
    if (distance > OFFICE_LOCATION.radiusMeters) {
      return res.status(403).json({ 
        message: `Bạn phải ở trong phạm vi văn phòng để điểm danh (khoảng cách: ${Math.round(distance)}m)`,
        distance: Math.round(distance),
        maxDistance: OFFICE_LOCATION.radiusMeters
      });
    }
    
    // Validate token
    if (!validateAttendanceToken(token)) {
      return res.status(400).json({ message: 'QR code không hợp lệ hoặc đã hết hạn' });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's record
    const record = attendanceRecords.find(
      (r: any) => r.userId === userId && r.date === today
    );
    
    if (!record || !record.checkInTime) {
      return res.status(400).json({ message: 'Bạn chưa check-in hôm nay' });
    }
    
    if (record.checkOutTime) {
      return res.status(400).json({ 
        message: 'Bạn đã check-out hôm nay rồi',
        checkOutTime: record.checkOutTime,
      });
    }
    
    const checkOutTime = new Date();
    const checkInTime = new Date(record.checkInTime);
    const workingHours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const locationData = `${location || ''} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
    
    record.checkOutTime = checkOutTime.toISOString();
    record.checkOutLocation = locationData;
    record.workingHours = Math.round(workingHours * 100) / 100;
    record.status = calculateWorkStatus(checkInTime, checkOutTime);
    
    res.json({
      message: 'Check-out thành công',
      checkOutTime: checkOutTime.toISOString(),
      workingHours: record.workingHours,
      status: record.status,
      distance: Math.round(distance),
    });
  } catch (error: any) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// Get today's attendance status
app.get('/api/attendance/today', mockAuth, (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    const record = attendanceRecords.find(
      (r: any) => r.userId === userId && r.date === today
    );
    
    res.json({
      date: today,
      record: record || null,
      hasCheckedIn: !!record?.checkInTime,
      hasCheckedOut: !!record?.checkOutTime,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// Get today's attendance statistics (for HR/Admin dashboard)
app.get('/api/attendance/today-stats', mockAuth, checkRole(['HR', 'ADMIN']), (req: any, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter((r: any) => r.date === today);
    
    // Lấy tổng số nhân viên (demo accounts + dynamic users)
    const allUsers = [...Object.values(demoAccounts), ...users.filter((u: any) => !u._deleted)];
    const totalEmployees = allUsers.length;
    
    // Thống kê check-in
    const checkedInOnTime = todayRecords.filter((r: any) => 
      r.checkInTime && r.status === 'PRESENT'
    ).length;
    
    const checkedInLate = todayRecords.filter((r: any) => 
      r.checkInTime && (r.status === 'LATE' || r.status === 'HALF_DAY')
    ).length;
    
    const notCheckedIn = totalEmployees - todayRecords.filter((r: any) => r.checkInTime).length;
    
    // Thống kê check-out (giả định check-out đúng giờ là sau 17:00)
    const workEndHour = 17;
    const checkedOutOnTime = todayRecords.filter((r: any) => {
      if (!r.checkOutTime) return false;
      const checkOutHour = new Date(r.checkOutTime).getHours();
      return checkOutHour >= workEndHour;
    }).length;
    
    const checkedOutLate = todayRecords.filter((r: any) => {
      if (!r.checkOutTime) return false;
      const checkOutHour = new Date(r.checkOutTime).getHours();
      return checkOutHour < workEndHour;
    }).length;
    
    const notCheckedOut = totalEmployees - todayRecords.filter((r: any) => r.checkOutTime).length;
    
    res.json({
      totalEmployees,
      checkedInOnTime,
      checkedInLate,
      notCheckedIn,
      checkedOutOnTime,
      checkedOutLate,
      notCheckedOut,
    });
  } catch (error: any) {
    console.error('Error getting today stats:', error);
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// Get leave request statistics (HR/Admin only)
app.get('/api/leave-requests/stats', mockAuth, checkRole(['HR', 'ADMIN']), (req: any, res) => {
  try {
    const totalRequests = leaveRequests.length;
    const pendingRequests = leaveRequests.filter(r => r.status === 'PENDING').length;
    const approvedRequests = leaveRequests.filter(r => r.status === 'APPROVED').length;
    const rejectedRequests = leaveRequests.filter(r => r.status === 'REJECTED').length;
    
    // Group approved requests by leave type
    const approvedByType = leaveTypes.map(type => {
      const approved = leaveRequests.filter(r => r.status === 'APPROVED' && r.leaveTypeId === type.id);
      return {
        leaveType: type.name,
        count: approved.length,
        totalDays: approved.reduce((sum, r) => sum + (r.totalDays || 0), 0)
      };
    }).filter(item => item.count > 0);
    
    res.json({
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      approvedByType
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// Get attendance history
app.get('/api/attendance/history', mockAuth, (req: any, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    
    let records = attendanceRecords.filter((r: any) => r.userId === userId);
    
    if (month && year) {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      records = records.filter((r: any) => r.date.startsWith(monthStr));
    }
    
    // Sort by date descending
    records.sort((a: any, b: any) => b.date.localeCompare(a.date));
    
    res.json({
      records,
      total: records.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// Get all attendance records (HR/Admin only)
app.get('/api/attendance/all', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  try {
    const { date, userId, status } = req.query;
    
    let records = [...attendanceRecords];
    
    if (date) {
      records = records.filter((r: any) => r.date === date);
    }
    
    if (userId) {
      records = records.filter((r: any) => r.userId === userId);
    }
    
    if (status) {
      records = records.filter((r: any) => r.status === status);
    }
    
    // Populate user info
    const recordsWithUser = records.map((r: any) => {
      const user = users.find((u: any) => u.id === r.userId);
      return {
        ...r,
        user: user ? {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          department: user.departmentId ? departments.find((d: any) => d.id === user.departmentId) : null,
        } : null,
      };
    });
    
    // Sort by date and checkInTime descending
    recordsWithUser.sort((a: any, b: any) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (b.checkInTime || '').localeCompare(a.checkInTime || '');
    });
    
    res.json({
      records: recordsWithUser,
      total: recordsWithUser.length,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// Get attendance statistics (HR/Admin only)
app.get('/api/attendance/stats', mockAuth, checkRole(['HR', 'ADMIN']), (req, res) => {
  try {
    const { month, year } = req.query;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    
    const monthRecords = attendanceRecords.filter((r: any) => r.date.startsWith(monthStr));
    
    const stats = {
      totalDays: monthRecords.length,
      present: monthRecords.filter((r: any) => r.status === 'PRESENT').length,
      late: monthRecords.filter((r: any) => r.status === 'LATE').length,
      absent: monthRecords.filter((r: any) => r.status === 'ABSENT').length,
      halfDay: monthRecords.filter((r: any) => r.status === 'HALF_DAY').length,
    };
    
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// Delete all attendance records (Admin only - for testing)
app.delete('/api/attendance/all', mockAuth, checkRole(['ADMIN']), (req, res) => {
  try {
    const count = attendanceRecords.length;
    attendanceRecords = [];
    res.json({ 
      message: `Đã xóa ${count} bản ghi điểm danh`,
      deletedCount: count 
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Có lỗi xảy ra' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Mock Server is running on port ${PORT}`);
  console.log(`📍 Test the API at: http://localhost:${PORT}/api/health`);
});
