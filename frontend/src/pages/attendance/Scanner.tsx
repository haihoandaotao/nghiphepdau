import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface TodayStatus {
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

export default function AttendanceScanner() {
  const [scanning, setScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayStatus();
    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Error fetching today status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          await handleScan(decodedText);
          html5QrCode.stop();
          setScanning(false);
        },
        () => {
          // Ignore scan errors (happens continuously)
        }
      );

      setScanning(true);
    } catch (error: any) {
      console.error('Error starting scanner:', error);
      toast.error('Không thể khởi động camera. Vui lòng cho phép truy cập camera.');
    }
  };

  const stopScanning = () => {
    if (scanner) {
      scanner.stop().then(() => {
        setScanning(false);
      }).catch(console.error);
    }
  };

  const handleScan = async (token: string) => {
    try {
      const isCheckIn = !todayStatus?.hasCheckedIn;
      const endpoint = isCheckIn ? '/attendance/check-in' : '/attendance/check-out';
      
      const response = await api.post(endpoint, { token });
      
      toast.success(response.data.message);
      fetchTodayStatus(); // Refresh status
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PRESENT: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đúng giờ' },
      LATE: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đi muộn' },
      HALF_DAY: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Nửa ngày' },
      ABSENT: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vắng mặt' },
    };
    const badge = badges[status] || badges.PRESENT;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📷 Điểm danh</h1>
        <p className="text-gray-600 mt-1">
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: vi })}
        </p>
      </div>

      {/* Today's Status */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái hôm nay</h2>
        
        {todayStatus?.record ? (
          <div className="space-y-4">
            {/* Check-in */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Check-in</p>
                {todayStatus.record.checkInTime ? (
                  <p className="text-sm text-gray-600">
                    {format(new Date(todayStatus.record.checkInTime), 'HH:mm:ss')}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Chưa check-in</p>
                )}
              </div>
              {todayStatus.record.status && getStatusBadge(todayStatus.record.status)}
            </div>

            {/* Check-out */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Check-out</p>
                {todayStatus.record.checkOutTime ? (
                  <>
                    <p className="text-sm text-gray-600">
                      {format(new Date(todayStatus.record.checkOutTime), 'HH:mm:ss')}
                    </p>
                    {todayStatus.record.workingHours && (
                      <p className="text-sm text-gray-500">
                        Làm việc: {todayStatus.record.workingHours.toFixed(1)} giờ
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Chưa check-out</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-500">
            <AlertCircle className="w-5 h-5" />
            <p>Bạn chưa check-in hôm nay</p>
          </div>
        )}
      </div>

      {/* QR Scanner */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {todayStatus?.hasCheckedIn ? 'Quét QR để Check-out' : 'Quét QR để Check-in'}
        </h2>

        {!scanning ? (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                Nhấn nút bên dưới để mở camera và quét mã QR
              </p>
              <button
                onClick={startScanning}
                disabled={todayStatus?.hasCheckedOut}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Bật Camera
              </button>
              
              {todayStatus?.hasCheckedOut && (
                <p className="text-sm text-gray-500 mt-3">
                  Bạn đã hoàn thành điểm danh hôm nay
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Hướng dẫn:</strong> Đưa camera vào khung QR code được hiển thị ở cổng văn phòng.
                Mã QR sẽ tự động thay đổi mỗi 5 phút để đảm bảo an toàn.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div id="qr-reader" className="rounded-lg overflow-hidden border border-gray-300"></div>
            
            <div className="flex gap-3">
              <button
                onClick={stopScanning}
                className="btn btn-secondary flex-1 inline-flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" />
                Dừng quét
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                Đang quét... Đưa camera vào mã QR
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
