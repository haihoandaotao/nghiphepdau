import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Users, 
  Building2, 
  Calendar, 
  Settings,
  BarChart3,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuthStore();
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
    { path: '/leave-requests', label: 'Đơn nghỉ phép', icon: FileText, roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
    { path: '/approvals', label: 'Phê duyệt', icon: CheckSquare, roles: ['MANAGER', 'HR', 'ADMIN'] },
    { path: '/reports', label: 'Báo cáo', icon: BarChart3, roles: ['MANAGER', 'HR', 'ADMIN'] },
    { path: '/admin/users', label: 'Quản lý nhân viên', icon: Users, roles: ['HR', 'ADMIN'] },
    { path: '/admin/departments', label: 'Phòng ban', icon: Building2, roles: ['HR', 'ADMIN'] },
    { path: '/admin/leave-types', label: 'Loại phép', icon: Settings, roles: ['HR', 'ADMIN'] },
    { path: '/admin/holidays', label: 'Ngày lễ', icon: Calendar, roles: ['HR', 'ADMIN'] },
  ];

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-30
      w-64 bg-white border-r border-gray-200
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3">
          <img src="/Logo.png" alt="Logo DAU" className="w-12 h-12 object-contain" />
          <div className="flex-1">
            <h1 className="text-lg font-bold text-primary-600 leading-tight">Hệ thống quản lý nghỉ phép</h1>
          </div>
          {/* Nút đóng trên mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-xs font-medium text-gray-700 pl-[60px]">Trường Đại học Kiến trúc Đà Nẵng</p>
      </div>
      
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          if (!user || !item.roles.includes(user.role)) return null;
          
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
