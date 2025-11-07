import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp, QrCode, ClipboardCheck } from 'lucide-react';
import api from '@/lib/axios';
import { LeaveRequest } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface LeaveBalance {
  leaveType: string;
  total: number;
  used: number;
  remaining: number;
}

interface TodayAttendance {
  date: string;
  record: {
    checkInTime: string | null;
    checkOutTime: string | null;
    status: string;
    workingHours: number | null;
  } | null;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
}

interface TodayStats {
  totalEmployees: number;
  checkedInOnTime: number;
  checkedInLate: number;
  notCheckedIn: number;
  checkedOutOnTime: number;
  checkedOutLate: number;
  notCheckedOut: number;
}

interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  approvedByType: Array<{
    leaveType: string;
    count: number;
    totalDays: number;
  }>;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [leaveStats, setLeaveStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const promises: Promise<any>[] = [
        api.get('/users/leave-balance'),
        api.get('/leave-requests/my-requests'),
        api.get('/attendance/today'),
      ];

      // Nếu là HR hoặc ADMIN, lấy thêm thống kê
      if (user?.role === 'HR' || user?.role === 'ADMIN') {
        promises.push(api.get('/attendance/today-stats'));
        promises.push(api.get('/leave-requests/stats'));
      }

      const results = await Promise.all(promises);
      
      setLeaveBalance(results[0].data.leaveBalance || []);
      setRecentRequests((results[1].data.leaveRequests || []).slice(0, 5));
      setTodayAttendance(results[2].data);
      
      if (results[3]) {
        setTodayStats(results[3].data);
      }
      if (results[4]) {
        setLeaveStats(results[4].data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const total = leaveBalance.reduce((sum, item) => sum + item.total, 0);
    const used = leaveBalance.reduce((sum, item) => sum + item.used, 0);
    const remaining = leaveBalance.reduce((sum, item) => sum + item.remaining, 0);
    return { total, used, remaining };
  };

  const getPendingCount = () => {
    return recentRequests.filter(r => r.status === 'PENDING').length;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Chờ duyệt' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Đã duyệt' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Từ chối' },
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const stats = getTotalStats();
  const pendingCount = getPendingCount();

  if (loading) {
    return (
      <div className="card">
        <p className="text-center text-gray-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chào, {user?.fullName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Tổng quan về chấm công và nghỉ phép của bạn</p>
      </div>

      {/* Attendance Today Section */}
      <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary-600" />
              Điểm danh hôm nay
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(), 'EEEE, dd/MM/yyyy', { locale: vi })}
            </p>
          </div>
          <Link
            to="/attendance/scan"
            className="btn btn-primary flex items-center gap-2 text-sm"
          >
            <QrCode className="w-4 h-4" />
            Điểm danh
          </Link>
        </div>

        {todayAttendance?.hasCheckedIn ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Check-in</p>
              <p className="text-lg font-bold text-green-600">
                {todayAttendance.record?.checkInTime
                  ? format(new Date(todayAttendance.record.checkInTime), 'HH:mm:ss')
                  : '-'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Check-out</p>
              <p className="text-lg font-bold text-blue-600">
                {todayAttendance.record?.checkOutTime
                  ? format(new Date(todayAttendance.record.checkOutTime), 'HH:mm:ss')
                  : 'Chưa check-out'}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Trạng thái</p>
              <p className="text-sm font-semibold text-gray-900">
                {todayAttendance.record?.status === 'PRESENT' && '✅ Đúng giờ'}
                {todayAttendance.record?.status === 'LATE' && '⚠️ Đi muộn'}
                {todayAttendance.record?.status === 'HALF_DAY' && '⏰ Nửa ngày'}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-white rounded-lg">
            <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Bạn chưa điểm danh hôm nay</p>
            <Link
              to="/attendance/scan"
              className="inline-flex items-center gap-2 mt-3 text-primary-600 hover:text-primary-700 font-medium"
            >
              Điểm danh ngay <span>→</span>
            </Link>
          </div>
        )}
      </div>

      {/* Today Stats for HR/Admin */}
      {todayStats && (user?.role === 'HR' || user?.role === 'ADMIN') && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Thống kê chấm công hôm nay
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Check-in stats */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-green-700 font-semibold mb-2">Check-in đúng giờ</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-green-600">{todayStats.checkedInOnTime}</p>
                <p className="text-sm text-green-600 font-medium">
                  {todayStats.totalEmployees > 0
                    ? ((todayStats.checkedInOnTime / todayStats.totalEmployees) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-xs text-yellow-700 font-semibold mb-2">Check-in trễ</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-yellow-600">{todayStats.checkedInLate}</p>
                <p className="text-sm text-yellow-600 font-medium">
                  {todayStats.totalEmployees > 0
                    ? ((todayStats.checkedInLate / todayStats.totalEmployees) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Check-out stats */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-xs text-blue-700 font-semibold mb-2">Check-out đúng giờ</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-blue-600">{todayStats.checkedOutOnTime}</p>
                <p className="text-sm text-blue-600 font-medium">
                  {todayStats.totalEmployees > 0
                    ? ((todayStats.checkedOutOnTime / todayStats.totalEmployees) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-xs text-orange-700 font-semibold mb-2">Check-out trễ</p>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-bold text-orange-600">{todayStats.checkedOutLate}</p>
                <p className="text-sm text-orange-600 font-medium">
                  {todayStats.totalEmployees > 0
                    ? ((todayStats.checkedOutLate / todayStats.totalEmployees) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Summary row */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-600 mb-1">Tổng nhân viên</p>
                <p className="text-lg font-bold text-gray-900">{todayStats.totalEmployees}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Chưa check-in</p>
                <p className="text-lg font-bold text-red-600">{todayStats.notCheckedIn}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Chưa check-out</p>
                <p className="text-lg font-bold text-amber-600">{todayStats.notCheckedOut}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-700 text-sm font-medium">Tổng ngày phép</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-700 text-sm font-medium">Đã sử dụng</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.used}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-700 text-sm font-medium">Còn lại</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.remaining}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-700 text-sm font-medium">Chờ duyệt</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Leave Balance by Type - Employees only */}
      {!leaveStats && leaveBalance.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Số dư phép theo loại</h2>
          </div>
        
        {leaveBalance.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-3">
            {leaveBalance.map((balance, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{balance.leaveType}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-600">
                      Tổng: <span className="font-semibold">{balance.total}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Đã dùng: <span className="font-semibold text-orange-600">{balance.used}</span>
                    </span>
                    <span className="text-sm text-gray-600">
                      Còn lại: <span className="font-semibold text-green-600">{balance.remaining}</span>
                    </span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all"
                      style={{ width: `${(balance.used / balance.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Recent Leave Requests */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Đơn nghỉ phép gần đây</h2>
          <Link to="/leave-requests" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Xem tất cả →
          </Link>
        </div>
        
        {recentRequests.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Chưa có đơn nghỉ phép nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((request) => (
              <Link
                key={request.id}
                to={`/leave-requests/${request.id}`}
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">{request.leaveType?.name}</p>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(request.startDate)} - {formatDate(request.endDate)} ({request.totalDays} ngày)
                    </p>
                  </div>
                  <span className="text-primary-600 text-sm font-medium">Chi tiết →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
