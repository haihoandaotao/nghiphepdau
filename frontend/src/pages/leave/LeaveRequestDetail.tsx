import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { LeaveRequest } from '@/types';
import { toast } from 'react-toastify';

export default function LeaveRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLeaveRequest();
    }
  }, [id]);

  const fetchLeaveRequest = async () => {
    try {
      const response = await api.get(`/leave-requests/${id}`);
      setLeaveRequest(response.data.leaveRequest);
    } catch (error) {
      console.error('Error fetching leave request:', error);
      toast.error('Không thể tải thông tin đơn nghỉ phép');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn nghỉ phép này?')) {
      return;
    }

    try {
      await api.delete(`/leave-requests/${id}`);
      toast.success('Đã hủy đơn nghỉ phép');
      navigate('/leave-requests');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn');
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
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-5 h-5" />
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

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="card">
        <p className="text-center text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!leaveRequest) {
    return (
      <div className="card">
        <p className="text-center text-gray-600">Không tìm thấy đơn nghỉ phép</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/leave-requests')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </button>
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn nghỉ phép</h1>
          {getStatusBadge(leaveRequest.status)}
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Main Information */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Thông tin chính</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Loại phép</p>
                <p className="font-medium text-gray-900">{leaveRequest.leaveType?.name || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Người yêu cầu</p>
                <p className="font-medium text-gray-900">{leaveRequest.user?.fullName || 'N/A'}</p>
                <p className="text-sm text-gray-500">{leaveRequest.user?.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Ngày bắt đầu</p>
                <p className="font-medium text-gray-900">{formatDate(leaveRequest.startDate)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Ngày kết thúc</p>
                <p className="font-medium text-gray-900">{formatDate(leaveRequest.endDate)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Tổng số ngày</p>
                <p className="font-medium text-primary-600 text-lg">{leaveRequest.totalDays} ngày</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Ngày tạo</p>
                <p className="font-medium text-gray-900">{formatDateTime(leaveRequest.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500 mb-2">Lý do nghỉ phép</p>
            <p className="text-gray-900 leading-relaxed">{leaveRequest.reason}</p>
          </div>

          {/* Attachments */}
          {leaveRequest.attachments && leaveRequest.attachments.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-3">File đính kèm ({leaveRequest.attachments.length})</p>
              <div className="space-y-2">
                {leaveRequest.attachments.map((file: any, index: number) => (
                  <a
                    key={index}
                    href={`http://localhost:5000${file.path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Approval History */}
        {leaveRequest.approvals && leaveRequest.approvals.length > 0 && (
          <div className="card space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 border-b pb-3">Lịch sử phê duyệt</h2>
            
            <div className="space-y-4">
              {leaveRequest.approvals.map((approval) => (
                <div key={approval.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {approval.status === 'APPROVED' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : approval.status === 'REJECTED' ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-900">{approval.approver.fullName}</p>
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
                    <p className="text-sm text-gray-500 mb-2">
                      {approval.approvedAt && formatDateTime(approval.approvedAt)}
                    </p>
                    {approval.comments && (
                      <p className="text-sm text-gray-700 italic">"{approval.comments}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {leaveRequest.status === 'PENDING' && (
          <div className="card">
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="btn btn-danger"
              >
                Hủy đơn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
