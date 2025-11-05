import { useAuthStore } from '@/store/authStore';
import { Bell, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Chào mừng, {user?.fullName}
          </h2>
          <p className="text-sm text-gray-500">{user?.role === 'EMPLOYEE' ? 'Nhân viên' : user?.role === 'MANAGER' ? 'Quản lý' : user?.role === 'HR' ? 'Nhân sự' : 'Quản trị viên'}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <Link to="/profile" className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <User className="w-5 h-5" />
            <span>Hồ sơ</span>
          </Link>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
