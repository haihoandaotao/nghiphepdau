import { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Search, Mail, Building2, Upload, Download, FileSpreadsheet, X, User as UserIcon, Shield } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { getRoleName, getRoleDescription, type RoleType } from '@/config/roles';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN';
  departmentId?: string;
  department?: {
    id: string;
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleEditingUser, setRoleEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [importData, setImportData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN'>('EMPLOYEE');
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 'EMPLOYEE' as 'EMPLOYEE' | 'MANAGER' | 'HR' | 'ADMIN',
    departmentId: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, deptRes] = await Promise.all([
        api.get('/users'),
        api.get('/departments'),
      ]);
      console.log('Fetched users:', userRes.data.users);
      setUsers(userRes.data.users || []);
      setDepartments(deptRes.data.departments || []);
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
      if (editingUser) {
        const updateData: any = {
          fullName: formData.fullName,
          role: formData.role,
          departmentId: formData.departmentId || null,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/users/${editingUser.id}`, updateData);
        toast.success('Cập nhật nhân viên thành công');
      } else {
        await api.post('/users', formData);
        toast.success('Thêm nhân viên thành công');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      password: '',
      role: user.role,
      departmentId: user.departmentId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Xóa nhân viên thành công');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  const handleOpenRoleModal = (user: User) => {
    setRoleEditingUser(user);
    setSelectedRole(user.role);
    setShowRoleModal(true);
  };

  const handleUpdateRole = async () => {
    if (!roleEditingUser) return;
    
    try {
      await api.put(`/users/${roleEditingUser.id}`, {
        fullName: roleEditingUser.fullName,
        role: selectedRole,
        departmentId: roleEditingUser.departmentId || null,
      });
      toast.success('Cập nhật vai trò thành công');
      setShowRoleModal(false);
      setRoleEditingUser(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      fullName: '',
      password: '',
      role: 'EMPLOYEE',
      departmentId: '',
    });
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ADMIN: { bg: 'bg-purple-100', text: 'text-purple-800' },
      HR: { bg: 'bg-blue-100', text: 'text-blue-800' },
      MANAGER: { bg: 'bg-green-100', text: 'text-green-800' },
      EMPLOYEE: { bg: 'bg-gray-100', text: 'text-gray-800' },
    };
    const badge = badges[role as keyof typeof badges];
    const label = getRoleName(role as RoleType);
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {label}
      </span>
    );
  };

  // Download Excel template
  const downloadTemplate = () => {
    const template = [
      {
        'Họ tên (*)': 'Nguyễn Văn A',
        'Email (*)': 'nguyenvana@example.com',
        'Mật khẩu (*)': '123456',
        'Vai trò (*)': 'EMPLOYEE',
        'Mã phòng ban': 'IT',
      },
      {
        'Họ tên (*)': 'Trần Thị B',
        'Email (*)': 'tranthib@example.com',
        'Mật khẩu (*)': '123456',
        'Vai trò (*)': 'MANAGER',
        'Mã phòng ban': 'HR',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nhân viên');
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    XLSX.writeFile(wb, 'mau_danh_sach_nhan_vien.xlsx');
    toast.success('Đã tải xuống file mẫu');
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and transform data
        const transformedData = jsonData.map((row: any) => {
          const email = row['Email (*)'] || row['Email'] || row['email'];
          const fullName = row['Họ tên (*)'] || row['Họ tên'] || row['fullName'];
          const password = row['Mật khẩu (*)'] || row['Mật khẩu'] || row['password'] || '123456';
          const role = (row['Vai trò (*)'] || row['Vai trò'] || row['role'] || 'EMPLOYEE').toUpperCase();
          const departmentCode = row['Mã phòng ban'] || row['departmentCode'] || '';

          // Find department by code
          const department = departments.find(d => d.code === departmentCode);

          return {
            email,
            fullName,
            password,
            role: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'].includes(role) ? role : 'EMPLOYEE',
            departmentId: department?.id || '',
            departmentCode,
          };
        });

        setImportData(transformedData);
        setShowImportModal(true);
        toast.success(`Đã đọc ${transformedData.length} nhân viên từ file Excel`);
      } catch (error) {
        console.error('Error reading file:', error);
        toast.error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Import users to server
  const handleImportUsers = async () => {
    if (importData.length === 0) {
      toast.error('Không có dữ liệu để import');
      return;
    }

    try {
      const response = await api.post('/users/bulk', { users: importData });
      toast.success(`Đã import thành công ${response.data.successCount}/${importData.length} nhân viên`);
      
      if (response.data.errors && response.data.errors.length > 0) {
        console.log('Import errors:', response.data.errors);
        toast.warning(`Có ${response.data.errors.length} lỗi khi import`);
      }

      setShowImportModal(false);
      setImportData([]);
      fetchData();
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi import');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
        <div className="flex gap-3">
          <button
            onClick={downloadTemplate}
            className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Tải mẫu Excel
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Upload className="w-5 h-5" />
            Import Excel
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Thêm nhân viên
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['ALL', 'EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                roleFilter === role
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {role === 'ALL' ? 'Tất cả' : role === 'EMPLOYEE' ? 'NV' : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="card">
          <p className="text-center text-gray-600">Đang tải...</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Họ tên</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phòng ban</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Vai trò</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{user.fullName}</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.department ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">{user.department.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Chưa có</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleOpenRoleModal(user)}
                      className="inline-flex items-center hover:opacity-80 transition-opacity"
                      title="Click để thay đổi vai trò"
                    >
                      {getRoleBadge(user.role)}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Xóa nhân viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingUser ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ tên <span className="text-red-500">*</span>
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
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    disabled={!!editingUser}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mật khẩu {editingUser && '(để trống nếu không đổi)'}
                    {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field"
                    required={!editingUser}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="input-field"
                    required
                  >
                    <option value="EMPLOYEE">{getRoleName('EMPLOYEE')}</option>
                    <option value="MANAGER">{getRoleName('MANAGER')}</option>
                    <option value="HR">{getRoleName('HR')}</option>
                    <option value="ADMIN">{getRoleName('ADMIN')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phòng ban
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingUser ? 'Cập nhật' : 'Thêm mới'}
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

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Xem trước dữ liệu import
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Có {importData.length} nhân viên sẽ được thêm vào hệ thống
                  </p>
                </div>
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
              </div>

              {/* Preview Table */}
              <div className="overflow-x-auto mb-6 max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">#</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Họ tên</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Email</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Vai trò</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700">Phòng ban</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.map((user, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 text-gray-600">{index + 1}</td>
                        <td className="py-2 px-3">
                          {user.fullName || <span className="text-red-500">Thiếu</span>}
                        </td>
                        <td className="py-2 px-3">
                          {user.email || <span className="text-red-500">Thiếu</span>}
                        </td>
                        <td className="py-2 px-3">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="py-2 px-3">
                          {user.departmentId ? (
                            <span className="text-gray-700">
                              {departments.find(d => d.id === user.departmentId)?.name || user.departmentCode}
                            </span>
                          ) : (
                            <span className="text-gray-400">Chưa có</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex gap-2">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Lưu ý:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Nếu email đã tồn tại, nhân viên đó sẽ bị bỏ qua</li>
                      <li>Mật khẩu mặc định là "123456" nếu không có trong file</li>
                      <li>Vai trò mặc định là "EMPLOYEE" nếu không hợp lệ</li>
                      <li>Phòng ban sẽ để trống nếu mã phòng ban không tìm thấy</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button 
                  onClick={handleImportUsers}
                  className="btn btn-primary flex-1"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Xác nhận Import ({importData.length} nhân viên)
                </button>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportData([]);
                  }}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Update Modal */}
      {showRoleModal && roleEditingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Cập nhật vai trò
                </h2>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setRoleEditingUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{roleEditingUser.fullName}</p>
                    <p className="text-sm text-gray-600">{roleEditingUser.email}</p>
                    {roleEditingUser.department && (
                      <p className="text-xs text-gray-500 mt-1">
                        <Building2 className="w-3 h-3 inline mr-1" />
                        {roleEditingUser.department.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Role */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Vai trò hiện tại:</p>
                <div className="flex items-center gap-2">
                  {getRoleBadge(roleEditingUser.role)}
                </div>
              </div>

              {/* Role Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Vai trò mới <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {/* EMPLOYEE */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === 'EMPLOYEE'
                        ? 'border-gray-500 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="EMPLOYEE"
                      checked={selectedRole === 'EMPLOYEE'}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{getRoleName('EMPLOYEE')}</span>
                        {selectedRole === 'EMPLOYEE' && (
                          <span className="text-xs text-green-600 font-medium">✓ Đang chọn</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{getRoleDescription('EMPLOYEE')}</p>
                    </div>
                  </label>

                  {/* MANAGER */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === 'MANAGER'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="MANAGER"
                      checked={selectedRole === 'MANAGER'}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{getRoleName('MANAGER')}</span>
                        {selectedRole === 'MANAGER' && (
                          <span className="text-xs text-green-600 font-medium">✓ Đang chọn</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{getRoleDescription('MANAGER')}</p>
                    </div>
                  </label>

                  {/* HR */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === 'HR'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="HR"
                      checked={selectedRole === 'HR'}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{getRoleName('HR')}</span>
                        {selectedRole === 'HR' && (
                          <span className="text-xs text-green-600 font-medium">✓ Đang chọn</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{getRoleDescription('HR')}</p>
                    </div>
                  </label>

                  {/* ADMIN */}
                  <label
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === 'ADMIN'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="ADMIN"
                      checked={selectedRole === 'ADMIN'}
                      onChange={(e) => setSelectedRole(e.target.value as any)}
                      className="mt-1"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{getRoleName('ADMIN')}</span>
                        {selectedRole === 'ADMIN' && (
                          <span className="text-xs text-green-600 font-medium">✓ Đang chọn</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{getRoleDescription('ADMIN')}</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Warning */}
              {selectedRole !== roleEditingUser.role && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <p className="text-sm text-yellow-800">
                      <strong>Lưu ý:</strong> Thay đổi vai trò sẽ ảnh hưởng đến quyền truy cập của nhân viên. 
                      Hãy chắc chắn trước khi cập nhật.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleUpdateRole}
                  className="btn btn-primary flex-1"
                  disabled={selectedRole === roleEditingUser.role}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Cập nhật vai trò
                </button>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setRoleEditingUser(null);
                  }}
                  className="btn btn-secondary"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
