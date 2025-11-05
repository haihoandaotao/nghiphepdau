import { useState, useEffect } from 'react';
import { Calendar, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/lib/axios';
import { LeaveRequest } from '@/types';
import { toast } from 'react-toastify';

export default function ApprovalManagement() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('PENDING');
  const [approvalComment, setApprovalComment] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchLeaveRequests();
  }, [filter]);

  const fetchLeaveRequests = async () => {
    try {
      const url = filter === 'ALL'
        ? '/leave-requests'
        : `/leave-requests?status=${filter}`;
      const response = await api.get(url);
      setLeaveRequests(response.data.leaveRequests || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error('Không thể tải danh sách đơn nghỉ phép');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn phê duyệt đơn này?')) {
      return;
    }

    try {
      await api.post(`/leave-requests/${requestId}/approve`, {
        comments: approvalComment[requestId] || '',
      });
      toast.success('Đã phê duyệt đơn nghỉ phép');
      setApprovalComment({ ...approvalComment, [requestId]: '' });
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi phê duyệt');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn từ chối đơn này?')) {
      return;
    }

    const comment = approvalComment[requestId];
    if (!comment || comment.trim() === '') {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      await api.post(`/leave-requests/${requestId}/reject`, {
        comments: comment,
      });
      toast.success('Đã từ chối đơn nghỉ phép');
      setApprovalComment({ ...approvalComment, [requestId]: '' });
      fetchLeaveRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối');
    }
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
      day: 'numeric',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quản lý phê duyệt</h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
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
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Không có đơn nghỉ phép nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaveRequests.map((request) => (
            <div key={request.id} className="card space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.leaveType?.name || 'Phép năm'}
                    </h3>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Người yêu cầu</p>
                        <p className="font-medium text-gray-900">{request.user?.fullName}</p>
                        <p className="text-sm text-gray-500">{request.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Thời gian nghỉ</p>
                        <p className="font-medium text-gray-900">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        </p>
                        <p className="text-sm text-primary-600 font-medium">
                          ({request.totalDays} ngày)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Lý do nghỉ phép</p>
                        <p className="text-gray-900">{request.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Section */}
              {request.status === 'PENDING' && (
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nhận xét (tùy chọn cho phê duyệt, bắt buộc cho từ chối)
                    </label>
                    <textarea
                      value={approvalComment[request.id] || ''}
                      onChange={(e) =>
                        setApprovalComment({ ...approvalComment, [request.id]: e.target.value })
                      }
                      rows={2}
                      className="input-field resize-none"
                      placeholder="Nhập nhận xét của bạn..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="btn btn-danger flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                </div>
              )}

              {/* Approval History */}
              {request.approvals && request.approvals.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Lịch sử phê duyệt:</p>
                  {request.approvals.map((approval) => (
                    <div key={approval.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{approval.approver.fullName}</p>
                          <p className="text-sm text-gray-500">{approval.approver.email}</p>
                        </div>
                        <span className={`text-sm px-2 py-1 rounded ${
                          approval.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : approval.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {approval.status === 'APPROVED' ? 'Đã duyệt' : approval.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
                        </span>
                      </div>
                      {approval.comments && (
                        <p className="text-sm text-gray-700 mt-2 italic">"{approval.comments}"</p>
                      )}
                      {approval.approvedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(approval.approvedAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
