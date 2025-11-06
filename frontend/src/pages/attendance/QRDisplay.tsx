import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, RefreshCw, Clock, Printer } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

interface QRTokenData {
  token: string;
  qrCodeDataUrl: string;
  expiresAt: number;
  timeLeft: number;
  refreshInterval: number;
}

export default function AttendanceQR() {
  const [qrData, setQrData] = useState<QRTokenData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQRToken();
    const interval = setInterval(fetchQRToken, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (qrData) {
      setTimeLeft(qrData.timeLeft);
      const countdown = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            fetchQRToken(); // Auto refresh when expired
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [qrData]);

  const fetchQRToken = async () => {
    try {
      const response = await api.get('/attendance/qr-token');
      setQrData(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching QR token:', error);
      toast.error('Không thể tải mã QR');
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrData) return;
    
    const link = document.createElement('a');
    link.download = `attendance-qr-${new Date().toISOString().split('T')[0]}.png`;
    link.href = qrData.qrCodeDataUrl;
    link.click();
    toast.success('Đã tải xuống mã QR');
  };

  const printQR = () => {
    window.print();
    toast.success('Đang in mã QR...');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🔲 Mã QR Điểm danh</h1>
        <p className="text-gray-600 mt-1">
          Hiển thị hoặc in mã QR này tại cổng văn phòng để nhân viên quét điểm danh
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <div className="card print:shadow-none">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 print:text-2xl">
              Điểm danh DAU
            </h2>
            
            {qrData && (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-lg border-4 border-primary-600 inline-block">
                  <QRCodeSVG
                    value={qrData.token}
                    size={280}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">
                      Hết hạn sau: <span className="text-primary-600 text-xl">{formatTime(timeLeft)}</span>
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 print:hidden">
                    Mã QR tự động làm mới mỗi 5 phút
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 print:border-black print:pt-6">
                  <p className="text-xs text-gray-600 print:text-sm">
                    Trường Đại học Kiến trúc Đà Nẵng
                  </p>
                  <p className="text-xs text-gray-500 print:text-sm">
                    Hệ thống quản lý nghỉ phép & điểm danh
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3 print:hidden">
            <button
              onClick={downloadQR}
              className="btn btn-secondary flex-1 inline-flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Tải xuống
            </button>
            <button
              onClick={printQR}
              className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2"
            >
              <Printer className="w-5 h-5" />
              In QR Code
            </button>
          </div>

          <button
            onClick={fetchQRToken}
            className="btn btn-secondary w-full mt-3 inline-flex items-center justify-center gap-2 print:hidden"
          >
            <RefreshCw className="w-5 h-5" />
            Làm mới ngay
          </button>
        </div>

        {/* Instructions */}
        <div className="space-y-6 print:hidden">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-3">📋 Hướng dẫn sử dụng</h3>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="font-semibold text-primary-600">1.</span>
                <span>In hoặc hiển thị mã QR này trên màn hình tại cổng văn phòng</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary-600">2.</span>
                <span>Nhân viên mở web trên điện thoại và vào mục "Điểm danh"</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary-600">3.</span>
                <span>Quét mã QR để check-in khi đến và check-out khi về</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-primary-600">4.</span>
                <span>Hệ thống tự động ghi nhận thời gian và tính công</span>
              </li>
            </ol>
          </div>

          <div className="card bg-yellow-50 border-yellow-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Lưu ý quan trọng
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span>•</span>
                <span>Mã QR <strong>tự động thay đổi mỗi 5 phút</strong> để chống gian lận</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Nhân viên không thể chụp ảnh QR để dùng sau</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Mỗi người chỉ check-in/out được <strong>1 lần mỗi ngày</strong></span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Nếu dùng màn hình hiển thị, trang sẽ tự động làm mới</span>
              </li>
            </ul>
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-gray-900 mb-3">💡 Khuyến nghị</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <span>•</span>
                <span>Đặt màn hình/máy tính bảng ở cổng để hiển thị QR động</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>In QR dán tường như phương án dự phòng</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Đặt QR ở nhiều vị trí: cổng chính, thang máy, lối đi...</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .card, .card * {
            visibility: visible;
          }
          .card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            padding: 40px;
          }
        }
      `}</style>
    </div>
  );
}
