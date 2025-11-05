// Cấu hình tên vai trò trong hệ thống
// Bạn có thể thay đổi tên hiển thị ở đây

export const ROLE_NAMES = {
  EMPLOYEE: 'Nhân viên',
  MANAGER: 'Trưởng phòng',
  HR: 'Nhân sự',
  ADMIN: 'Quản trị viên',
} as const;

export const ROLE_DESCRIPTIONS = {
  EMPLOYEE: 'Quyền cơ bản: Tạo và xem đơn nghỉ phép cá nhân',
  MANAGER: 'Quyền: Phê duyệt đơn nghỉ phép, xem báo cáo',
  HR: 'Quyền: Quản lý nhân viên, phòng ban, loại phép',
  ADMIN: 'Toàn quyền: Quản lý toàn bộ hệ thống',
} as const;

export type RoleType = keyof typeof ROLE_NAMES;

// Helper function để lấy tên vai trò
export const getRoleName = (role: RoleType): string => {
  return ROLE_NAMES[role] || role;
};

// Helper function để lấy mô tả vai trò
export const getRoleDescription = (role: RoleType): string => {
  return ROLE_DESCRIPTIONS[role] || '';
};
