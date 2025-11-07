import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Users, User, Upload, Download, X } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

interface Department {
  id: string;
  name: string;
  code: string;
  managerId?: string;
  manager?: {
    id: string;
    fullName: string;
    email: string;
  };
  _count?: {
    employees: number;
  };
}

interface UserOption {
  id: string;
  fullName: string;
  email: string;
}

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    managerId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptRes, userRes] = await Promise.all([
        api.get('/departments'),
        api.get('/users'),
      ]);
      setDepartments(deptRes.data.departments || []);
      setUsers(userRes.data.users || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, formData);
        toast.success('Cập nhật phòng ban thành công');
      } else {
        await api.post('/departments', formData);
        toast.success('Thêm phòng ban thành công');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      managerId: dept.managerId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success('Xóa phòng ban thành công');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  const resetForm = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      managerId: '',
    });
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const headers = ['Tên phòng ban*,Mã phòng ban*,Email trưởng phòng'];
    const sample = ['Phòng IT,IT,manager@company.com', 'Phòng Nhân sự,HR,hr@company.com'];
    const csvContent = [headers, ...sample].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mau_import_phong_ban.csv';
    link.click();
    toast.success('Đã tải xuống file mẫu');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        toast.error('Vui lòng chọn file CSV hoặc Excel');
        return;
      }
      setImportFile(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Vui lòng chọn file');
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await api.post('/departments/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      toast.success(response.data.message || 'Import thành công');
      setShowImportModal(false);
      setImportFile(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi import');
    } finally {
      setImporting(false);
    }
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng ban</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Import
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm phòng ban
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc mã..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Departments List */}
      {loading ? (
        <div className="card">
          <p className="text-center text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDepartments.map((dept) => (
            <div key={dept.id} className="card hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{dept.name}</h3>
                <p className="text-sm text-gray-500">Mã: {dept.code}</p>
              </div>

              <div className="space-y-3 mb-4">
                {dept.manager ? (
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Trưởng phòng</p>
                      <p className="font-medium text-gray-900">{dept.manager.fullName}</p>
                      <p className="text-xs text-gray-500">{dept.manager.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>Chưa có trưởng phòng</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">{dept._count?.employees || 0}</span> nhân viên
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(dept)}
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="btn btn-danger flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Import phòng ban</h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Download template */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900 mb-3">
                    <strong>Bước 1:</strong> Tải xuống file mẫu và điền thông tin phòng ban
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="btn btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Tải file mẫu (.csv)
                  </button>
                </div>

                {/* Upload file */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-3">
                    <strong>Bước 2:</strong> Chọn file đã điền thông tin để import
                  </p>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700
                      hover:file:bg-primary-100
                      cursor-pointer"
                  />
                  {importFile && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Đã chọn: {importFile.name}
                    </p>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-900 font-semibold mb-2">Lưu ý:</p>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>File phải có định dạng CSV hoặc Excel (.xlsx, .xls)</li>
                    <li>Các cột bắt buộc: Tên phòng ban, Mã phòng ban</li>
                    <li>Email trưởng phòng phải tồn tại trong hệ thống</li>
                    <li>Mã phòng ban không được trùng lặp</li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleImport}
                    disabled={!importFile || importing}
                    className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? 'Đang import...' : 'Import ngay'}
                  </button>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportFile(null);
                    }}
                    className="btn btn-secondary"
                    disabled={importing}
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingDept ? 'Cập nhật phòng ban' : 'Thêm phòng ban mới'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên phòng ban <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã phòng ban <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trưởng phòng
                  </label>
                  <select
                    value={formData.managerId}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">-- Chọn trưởng phòng --</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingDept ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
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
