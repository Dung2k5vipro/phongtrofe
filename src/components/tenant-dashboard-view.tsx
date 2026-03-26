'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, FileText, AlertCircle, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { getTenantAccessToken } from '@/lib/auth-storage';
import { khachThueService } from '@/services/khachThueService';
import { getErrorMessage } from '@/lib/api-error';

type TenantDashboardData = {
  khachThue?: {
    hoTen?: string;
    trangThai?: string;
  };
  hopDongHienTai?: {
    phong?: {
      maPhong?: string;
      toaNha?: {
        tenToaNha?: string;
      };
    };
  };
  soHoaDonChuaThanhToan?: number;
  hoaDonGanNhat?: {
    maHoaDon?: string;
    tongTien?: number;
    trangThai?: string;
  };
};

function formatCurrency(amount?: number): string {
  if (!amount) {
    return '0 VND';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

export function TenantDashboardView() {
  const [dashboardData, setDashboardData] = useState<TenantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = getTenantAccessToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const result = await khachThueService.getTenantDashboard(token);
        if (result.success) {
          setDashboardData((result.data as TenantDashboardData) ?? null);
        } else {
          toast.error(result.message || 'Khong the tai thong tin');
        }
      } catch (error) {
        toast.error(getErrorMessage(error, 'Co loi xay ra'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return <div className="text-center text-gray-600">Khong co du lieu</div>;
  }

  const khachThue = dashboardData.khachThue;
  const hopDong = dashboardData.hopDongHienTai;
  const soHoaDon = dashboardData.soHoaDonChuaThanhToan ?? 0;
  const hoaDonGanNhat = dashboardData.hoaDonGanNhat;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tong quan</h1>
        <p className="text-gray-600">Xin chao {khachThue?.hoTen || 'Khach thue'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phong dang thue</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hopDong?.phong?.maPhong || 'Chua thue'}</div>
            {hopDong?.phong?.toaNha?.tenToaNha && (
              <p className="text-xs text-muted-foreground">{hopDong.phong.toaNha.tenToaNha}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoa don chua thanh toan</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soHoaDon}</div>
            <p className="text-xs text-muted-foreground">
              {soHoaDon > 0 ? 'Can thanh toan' : 'Da thanh toan het'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trang thai</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {khachThue?.trangThai === 'dangThue' && <Badge className="bg-green-600">Dang thue</Badge>}
            {khachThue?.trangThai === 'daTraPhong' && <Badge variant="secondary">Da tra phong</Badge>}
            {khachThue?.trangThai === 'chuaThue' && <Badge variant="outline">Chua thue</Badge>}
          </CardContent>
        </Card>
      </div>

      {hoaDonGanNhat && (
        <Card>
          <CardHeader>
            <CardTitle>Hoa don gan nhat</CardTitle>
            <CardDescription>
              {hoaDonGanNhat.maHoaDon || 'Khong co ma hoa don'} - {formatCurrency(hoaDonGanNhat.tongTien)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{hoaDonGanNhat.trangThai || 'Khong ro trang thai'}</Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Thong tin lien he</CardTitle>
          <CardDescription>Vui long lien he quan ly neu can ho tro</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Hotline: 0123-456-789</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Email: support@phongtro.com</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
