import { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, FileText, Download, Filter } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

interface Statistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalDays: number;
  byLeaveType: {
    leaveType: string;
    count: number;
    totalDays: number;
  }[];
  byDepartment: {
    department: string;
    count: number;
    totalDays: number;
  }[];
  byStatus: {
    status: string;
    count: number;
  }[];
}

export default function Reports() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetchDepartments();
    fetchStatistics();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const params: any = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
      if (selectedDepartment !== 'ALL') {
        params.departmentId = selectedDepartment;
      }

      const response = await api.get('/reports/statistics', { params });
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      toast.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    setLoading(true);
    fetchStatistics();
  };

  const handleExport = async () => {
    try {
      const params: any = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
      if (selectedDepartment !== 'ALL') {
        params.departmentId = selectedDepartment;
      }

      const response = await api.get('/reports/export', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leave-report-${dateRange.startDate}-${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Xuất báo cáo thành công');
    } catch (error) {
      toast.error('Không thể xuất báo cáo');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
        <button
          onClick={handleExport}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Xuất báo cáo
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phòng ban
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="input-field"
            >
              <option value="ALL">Tất cả</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="btn btn-primary w-full"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <p className="text-center text-gray-600">Đang tải...</p>
        </div>
      ) : statistics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-700 font-medium">Tổng đơn</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {statistics.totalRequests}
                  </p>
                </div>
                <FileText className="w-10 h-10 text-blue-600 opacity-20" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-700 font-medium">Chờ duyệt</h3>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {statistics.pendingRequests}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-yellow-600 opacity-20" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-700 font-medium">Đã duyệt</h3>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {statistics.approvedRequests}
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-600 opacity-20" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-700 font-medium">Từ chối</h3>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {statistics.rejectedRequests}
                  </p>
                </div>
                <Users className="w-10 h-10 text-red-600 opacity-20" />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-700 font-medium">Tổng ngày nghỉ</h3>
                  <p className="text-3xl font-bold text-purple-600 mt-1">
                    {statistics.totalDays}
                  </p>
                </div>
                <Calendar className="w-10 h-10 text-purple-600 opacity-20" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Leave Type */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Theo loại phép
              </h2>
              <div className="space-y-3">
                {statistics.byLeaveType.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {item.leaveType}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.count} đơn ({item.totalDays} ngày)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(item.count / statistics.totalRequests) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {statistics.byLeaveType.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            {/* By Department */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Theo phòng ban
              </h2>
              <div className="space-y-3">
                {statistics.byDepartment.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {item.department}
                      </span>
                      <span className="text-sm text-gray-600">
                        {item.count} đơn ({item.totalDays} ngày)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${(item.count / statistics.totalRequests) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {statistics.byDepartment.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Chưa có dữ liệu</p>
                )}
              </div>
            </div>

            {/* By Status */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Theo trạng thái
              </h2>
              <div className="space-y-3">
                {statistics.byStatus.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status === 'PENDING' ? 'Chờ duyệt' : item.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{item.count}</p>
                      <p className="text-xs text-gray-500">
                        {((item.count / statistics.totalRequests) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Info */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin tổng quan
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Kỳ báo cáo</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(dateRange.startDate).toLocaleDateString('vi-VN')} -{' '}
                    {new Date(dateRange.endDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">Tỷ lệ phê duyệt</span>
                  <span className="text-sm font-semibold text-green-600">
                    {statistics.totalRequests > 0
                      ? ((statistics.approvedRequests / statistics.totalRequests) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-700">Trung bình ngày/đơn</span>
                  <span className="text-sm font-semibold text-orange-600">
                    {statistics.totalRequests > 0
                      ? (statistics.totalDays / statistics.totalRequests).toFixed(1)
                      : 0}{' '}
                    ngày
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">Phòng ban</span>
                  <span className="text-sm font-semibold text-purple-600">
                    {selectedDepartment === 'ALL' ? 'Tất cả' : departments.find(d => d.id === selectedDepartment)?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <p className="text-center text-gray-600">Không có dữ liệu</p>
        </div>
      )}
    </div>
  );
}
