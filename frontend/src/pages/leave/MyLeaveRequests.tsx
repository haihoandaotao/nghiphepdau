import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { LeaveRequest } from '@/types';

export default function MyLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  const fetchLeaveRequests = async () => {
    try {
      const url = filter === 'ALL' 
        ? '/leave-requests/my-requests'
        : `/leave-requests/my-requests?status=${filter}`;
      const response = await api.get(url);
      setLeaveRequests(response.data.leaveRequests || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Chờ duyệt' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Đã duyệt' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Từ chối' },
      CANCELLED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle, label: 'Đã hủy' },
    };
    const badge = badges[status as keyof typeof badges];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đơn nghỉ phép của tôi</h1>
        <Link to="/leave-requests/create" className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Tạo đơn mới
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {status === 'ALL' ? 'Tất cả' : status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
          </button>
        ))}
      </div>

      {/* Leave Requests List */}
      {loading ? (
        <div className="card">
          <p className="text-center text-gray-600">Đang tải...</p>
        </div>
      ) : leaveRequests.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Chưa có đơn nghỉ phép nào</p>
          <Link to="/leave-requests/create" className="btn btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Tạo đơn mới
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {leaveRequests.map((request) => (
            <div key={request.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.leaveType?.name || 'Phép năm'}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </span>
                      <span className="text-primary-600 font-medium">
                        ({request.totalDays} ngày)
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <span className="flex-1">{request.reason}</span>
                    </div>
                  </div>

                  {request.approvals && request.approvals.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
                        Phê duyệt bởi: <span className="font-medium">{request.approvals[0].approver.fullName}</span>
                        {request.approvals[0].comments && (
                          <span className="block mt-1 italic">"{request.approvals[0].comments}"</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <Link 
                    to={`/leave-requests/${request.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Chi tiết →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
