import { useState, useEffect } from 'react';
import { Calendar, Download, Users, TrendingUp, Filter, Search } from 'lucide-react';
import api from '@/lib/axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as XLSX from 'xlsx';

interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  workingHours: number | null;
  user?: {
    id: string;
    fullName: string;
    email: string;
    employeeId: string;
    department: { name: string };
  };
}

interface MonthStats {
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  averageWorkingHours: number;
}

export default function AttendanceManagement() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<MonthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchRecords();
    fetchStats();
  }, [selectedMonth, selectedYear]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance/all', {
        params: { month: selectedMonth, year: selectedYear },
      });
      setRecords(response.data.records || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/attendance/stats', {
        params: { month: selectedMonth, year: selectedYear },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user?.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportToExcel = () => {
    const data = filteredRecords.map((record) => ({
      'Mã NV': record.user?.employeeId || '',
      'Họ tên': record.user?.fullName || '',
      'Phòng ban': record.user?.department?.name || '',
      'Ngày': format(new Date(record.date), 'dd/MM/yyyy'),
      'Check-in': record.checkInTime ? format(new Date(record.checkInTime), 'HH:mm:ss') : '-',
      'Check-out': record.checkOutTime ? format(new Date(record.checkOutTime), 'HH:mm:ss') : '-',
      'Giờ làm': record.workingHours ? record.workingHours.toFixed(1) : '-',
      'Trạng thái': getStatusText(record.status),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Điểm danh');
    XLSX.writeFile(wb, `DiemDanh_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PRESENT: 'Đúng giờ',
      LATE: 'Đi muộn',
      HALF_DAY: 'Nửa ngày',
      ABSENT: 'Vắng mặt',
    };
    return texts[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      PRESENT: { bg: 'bg-green-100', text: 'text-green-800' },
      LATE: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      HALF_DAY: { bg: 'bg-orange-100', text: 'text-orange-800' },
      ABSENT: { bg: 'bg-red-100', text: 'text-red-800' },
    };
    const badge = badges[status] || badges.PRESENT;
    return (
      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {getStatusText(status)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📊 Quản lý chuyên cần</h1>
        <p className="text-gray-600 mt-1">
          Xem và quản lý điểm danh của toàn bộ nhân sự
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Tổng số bản ghi</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-2">Đúng giờ</p>
            <p className="text-2xl font-bold text-green-600">{stats.presentCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.presentCount / stats.totalRecords) * 100 || 0).toFixed(1)}%
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-2">Đi muộn</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.lateCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.lateCount / stats.totalRecords) * 100 || 0).toFixed(1)}%
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-2">Vắng mặt</p>
            <p className="text-2xl font-bold text-red-600">{stats.absentCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {((stats.absentCount / stats.totalRecords) * 100 || 0).toFixed(1)}%
            </p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Giờ làm TB</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {stats.averageWorkingHours.toFixed(1)}h
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="input w-auto"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  Tháng {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="input w-auto"
            >
              {[2024, 2025, 2026].map((year) => (
                <option key={year} value={year}>
                  Năm {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã NV..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input flex-1"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PRESENT">Đúng giờ</option>
              <option value="LATE">Đi muộn</option>
              <option value="HALF_DAY">Nửa ngày</option>
              <option value="ABSENT">Vắng mặt</option>
            </select>
          </div>

          <button onClick={exportToExcel} className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Không tìm thấy dữ liệu</p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Thử thay đổi bộ lọc'
                : 'Chọn tháng khác để xem dữ liệu'}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Hiển thị <span className="font-semibold">{filteredRecords.length}</span> bản ghi
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Mã NV</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Họ tên</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phòng ban</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Ngày</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-out</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Giờ làm</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">
                          {record.user?.employeeId || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">
                          {record.user?.fullName || '-'}
                        </p>
                        <p className="text-xs text-gray-500">{record.user?.email || ''}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-700">
                          {record.user?.department?.name || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-gray-900">
                          {format(new Date(record.date), 'dd/MM/yyyy')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(record.date), 'EEEE', { locale: vi })}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        {record.checkInTime ? (
                          <span className="text-sm text-gray-900">
                            {format(new Date(record.checkInTime), 'HH:mm:ss')}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.checkOutTime ? (
                          <span className="text-sm text-gray-900">
                            {format(new Date(record.checkOutTime), 'HH:mm:ss')}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.workingHours ? (
                          <span className="text-sm font-medium text-gray-900">
                            {record.workingHours.toFixed(1)}h
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
