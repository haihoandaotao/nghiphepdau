import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import MyLeaveRequests from './pages/leave/MyLeaveRequests';
import CreateLeaveRequest from './pages/leave/CreateLeaveRequest';
import LeaveRequestDetail from './pages/leave/LeaveRequestDetail';
import ApprovalManagement from './pages/approval/ApprovalManagement';
import UserManagement from './pages/admin/UserManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import LeaveTypeManagement from './pages/admin/LeaveTypeManagement';
import HolidayManagement from './pages/admin/HolidayManagement';
import Reports from './pages/reports/Reports';
import Profile from './pages/Profile';
import AttendanceScanner from './pages/attendance/Scanner';
import AttendanceQR from './pages/attendance/QRDisplay';
import AttendanceHistory from './pages/attendance/History';
import AttendanceManagement from './pages/attendance/Management';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
      >
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Leave management */}
        <Route path="leave-requests">
          <Route index element={<MyLeaveRequests />} />
          <Route path="create" element={<CreateLeaveRequest />} />
          <Route path=":id" element={<LeaveRequestDetail />} />
        </Route>

        {/* Approval management (Manager/HR/Admin only) */}
        <Route 
          path="approvals" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'HR', 'ADMIN']}>
              <ApprovalManagement />
            </ProtectedRoute>
          } 
        />

        {/* Reports (Manager/HR/Admin only) */}
        <Route 
          path="reports" 
          element={
            <ProtectedRoute allowedRoles={['MANAGER', 'HR', 'ADMIN']}>
              <Reports />
            </ProtectedRoute>
          } 
        />

        {/* Admin routes (HR/Admin only) */}
        <Route path="admin">
          <Route 
            path="users" 
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="departments" 
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <DepartmentManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="leave-types" 
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <LeaveTypeManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="holidays" 
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <HolidayManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="attendance" 
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <AttendanceManagement />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Attendance routes */}
        <Route path="attendance">
          <Route path="scan" element={<AttendanceScanner />} />
          <Route path="history" element={<AttendanceHistory />} />
          <Route 
            path="qr" 
            element={
              <ProtectedRoute allowedRoles={['HR', 'ADMIN']}>
                <AttendanceQR />
              </ProtectedRoute>
            } 
          />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
