import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Shield, Calendar, Edit2, Lock, Save, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: string;
  department?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

export default function Profile() {
  const { user: authUser } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchLeaveBalance();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        phoneNumber: response.data.phoneNumber || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalance = async () => {
    try {
      const response = await api.get('/users/leave-balance');
      setLeaveBalance(response.data.leaveBalance || []);
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', formData);
      toast.success('Cập nhật thông tin thành công');
      setEditMode(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Đổi mật khẩu thành công');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Admin' },
      HR: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'HR' },
      MANAGER: { bg: 'bg-green-100', text: 'text-green-800', label: 'Manager' },
      EMPLOYEE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Nhân viên' },
    };
    const badge = badges[role as keyof typeof badges] || badges.EMPLOYEE;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Shield className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="card">
        <p className="text-center text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card">
        <p className="text-center text-gray-600">Không thể tải thông tin cá nhân</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <div className="flex gap-3">
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Chỉnh sửa
            </button>
          )}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Đổi mật khẩu
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Thông tin cá nhân
            </h2>

            {editMode ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="input-field"
                    placeholder="0123456789"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Lưu thay đổi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setFormData({
                        fullName: profile.fullName,
                        phoneNumber: profile.phoneNumber || '',
                      });
                    }}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-medium text-gray-900 text-lg">{profile.fullName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium text-gray-900">
                      {profile.phoneNumber || 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Phòng ban</p>
                    <p className="font-medium text-gray-900">
                      {profile.department?.name || 'Chưa có'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vai trò</p>
                      {getRoleBadge(profile.role)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày tham gia</p>
                    <p className="font-medium text-gray-900">{formatDate(profile.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Leave Balance Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Xin chào,</p>
                <p className="font-bold text-gray-900">{authUser?.fullName}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-primary-200">
              <p className="text-sm text-gray-600">
                Tài khoản của bạn đã được tạo từ {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>

          {/* Leave Balance */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Số dư phép nghỉ
            </h2>
            
            {leaveBalance.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-4">
                {leaveBalance.map((balance, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {balance.leaveType}
                      </span>
                      <span className="text-sm font-semibold text-primary-600">
                        {balance.remaining}/{balance.total}
                      </span>
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                        style={{
                          width: `${(balance.used / balance.total) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Đã dùng: {balance.used}</span>
                      <span>Còn lại: {balance.remaining}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3">Bảo mật tài khoản</h3>
            <p className="text-sm text-gray-600 mb-4">
              Để bảo vệ tài khoản của bạn, hãy đổi mật khẩu định kỳ và không chia sẻ mật khẩu với người khác.
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Đổi mật khẩu ngay
            </button>
          </div>

          {/* Quick Stats */}
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <h3 className="font-semibold text-gray-900 mb-3">Thống kê nhanh</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tổng số ngày phép</span>
                <span className="font-bold text-green-600">
                  {leaveBalance.reduce((sum, b) => sum + b.total, 0)} ngày
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Đã sử dụng</span>
                <span className="font-bold text-orange-600">
                  {leaveBalance.reduce((sum, b) => sum + b.used, 0)} ngày
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Còn lại</span>
                <span className="font-bold text-blue-600">
                  {leaveBalance.reduce((sum, b) => sum + b.remaining, 0)} ngày
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
          Thông tin hữu ích
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Đăng ký nghỉ phép</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tạo đơn nghỉ phép mới và theo dõi trạng thái
            </p>
            <a href="/leave-requests/create" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Tạo đơn mới →
            </a>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Bảo mật</h3>
            <p className="text-sm text-gray-600 mb-4">
              Bảo vệ tài khoản của bạn với mật khẩu mạnh
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              Đổi mật khẩu →
            </button>
          </div>

          <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Liên hệ HR</h3>
            <p className="text-sm text-gray-600 mb-4">
              Cần hỗ trợ? Liên hệ phòng Nhân sự
            </p>
            <span className="text-green-600 text-sm font-medium">
              hr@company.com
            </span>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Đổi mật khẩu</h2>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu hiện tại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="input-field"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    Đổi mật khẩu
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }}
                    className="btn btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
