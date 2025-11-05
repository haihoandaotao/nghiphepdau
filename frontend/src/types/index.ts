export interface LeaveRequest {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  attachment?: string;
  attachments?: {
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
  }[];
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    department?: {
      id: string;
      name: string;
    };
  };
  leaveType?: {
    id: string;
    name: string;
    code: string;
  };
  approvals?: Approval[];
}

export interface Approval {
  id: string;
  leaveRequestId: string;
  approverId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comments?: string;
  approvedAt: string;
  approver: {
    id: string;
    fullName: string;
    email: string;
  };
}

export interface LeaveType {
  id: string;
  code: string;
  name: string;
  description?: string;
  maxDays?: number;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  _count?: {
    users: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  description?: string;
}

export interface LeaveBalance {
  annualLeave: {
    total: number;
    used: number;
    remaining: number;
  };
  sickLeave: {
    total: number;
    used: number;
    remaining: number;
  };
}
