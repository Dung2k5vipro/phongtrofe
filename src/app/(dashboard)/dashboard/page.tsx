'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, DoorOpen, AlertTriangle, TrendingUp, Calendar, Clock } from 'lucide-react';
import { DashboardStats } from '@/types';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from 'sonner';

import { phongService } from '@/services/phongService';
import { hopDongService } from '@/services/hopDongService';
import { hoaDonService } from '@/services/hoaDonService';
import { suCoService } from '@/services/suCoService';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard';
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Gọi API song song
        const [phongRes, hopDongRes, hoaDonRes, suCoRes] = await Promise.all([
          phongService.getAllPhong(),
          hopDongService.getAllHopDong(),
          hoaDonService.getAllHoaDon(),
          suCoService.getAllSuCo()
        ]);

        let tongSoPhong = 0;
        let phongDangThue = 0;
        let phongTrong = 0;
        let phongBaoTri = 0;

        if (phongRes.success && phongRes.data) {
          tongSoPhong = phongRes.data.length;
          phongRes.data.forEach(p => {
            const status = String((p as any).trang_thai || p.trangThai);
            if (status === 'da_thue' || status === 'daThue' || status === 'dangThue') phongDangThue++;
            else if (status === 'bao_tri' || status === 'baoTri') phongBaoTri++;
            else phongTrong++;
          });
        }

        let doanhThuThang = 0;
        let doanhThuNam = 0;
        let hoaDonSapDenHan = 0;

        if (hoaDonRes.success && hoaDonRes.data) {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();

          hoaDonRes.data.forEach(hd => {
            const hThang = hd.thang || currentMonth;
            const hNam = hd.nam || currentYear;
            const tongTien = Number((hd as any).tong_tien || hd.tongTien || 0);
            const hdStatus = String((hd as any).trang_thai || hd.trangThai);

            if (hNam === currentYear) {
              if (hdStatus === 'da_thanh_toan' || hdStatus === 'daThanhToan') {
                doanhThuNam += tongTien;
                if (hThang === currentMonth) {
                  doanhThuThang += tongTien;
                }
              } else {
                hoaDonSapDenHan++;
              }
            }
          });
        }

        let suCoCanXuLy = 0;
        if (suCoRes.success && suCoRes.data) {
          suCoRes.data.forEach(sc => {
            const scStatus = String((sc as any).trang_thai || sc.trangThai);
            if (scStatus !== 'hoanTien' && scStatus !== 'daHoanThanh' && scStatus !== 'hoan_thanh' && scStatus !== 'hoanThanh') {
              suCoCanXuLy++;
            }
          });
        }

        let hopDongSapHetHan = 0;
        if (hopDongRes.success && hopDongRes.data) {
          hopDongRes.data.forEach(hd => {
             const status = String((hd as any).trang_thai || hd.trangThai);
             if (status === 'sap_het_han' || status === 'sapHetHan') {
               hopDongSapHetHan++;
             }
          });
        }

        setStats({
          tongSoPhong,
          phongTrong,
          phongDangThue,
          phongBaoTri,
          doanhThuThang,
          doanhThuNam,
          suCoCanXuLy,
          hoaDonSapDenHan,
          hopDongSapHetHan
        });

      } catch (error) {
        toast.error(getErrorMessage(error, 'Khong the tai so lieu dashboard'));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-xs md:text-sm text-gray-600">Tong quan he thong quan ly phong tro</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-4 lg:gap-6">
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Tong phong</p>
              <p className="text-base md:text-2xl font-bold">{stats.tongSoPhong}</p>
              <p className="text-[8px] md:text-xs text-gray-500">{stats.phongDangThue} dang thue</p>
            </div>
            <Building2 className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Phong trong</p>
              <p className="text-base md:text-2xl font-bold text-green-600">{stats.phongTrong}</p>
              <p className="text-[8px] md:text-xs text-gray-500">
                {stats.tongSoPhong > 0 ? ((stats.phongTrong / stats.tongSoPhong) * 100).toFixed(1) : 0}% tong
              </p>
            </div>
            <DoorOpen className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Doanh thu</p>
              <p className="text-base md:text-2xl font-bold">{formatCurrency(stats.doanhThuThang)}</p>
              <p className="text-[8px] md:text-xs text-gray-500">Tong trong thang</p>
            </div>
            <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-medium text-gray-600">Su co</p>
              <p className="text-base md:text-2xl font-bold text-red-600">{stats.suCoCanXuLy}</p>
              <p className="text-[8px] md:text-xs text-gray-500">Can xu ly</p>
            </div>
            <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Hoa don sap den han</p>
              <p className="text-lg md:text-2xl font-bold text-orange-600">{stats.hoaDonSapDenHan}</p>
            </div>
            <Calendar className="h-4 w-4 text-orange-600" />
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Hop dong sap het han</p>
              <p className="text-lg md:text-2xl font-bold text-yellow-600">{stats.hopDongSapHetHan}</p>
            </div>
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Doanh thu nam</p>
              <p className="text-lg md:text-2xl font-bold">{formatCurrency(stats.doanhThuNam)}</p>
            </div>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thong tin nhanh</CardTitle>
          <CardDescription>So lieu tong hop tu backend</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant="outline">Phong bao tri: {stats.phongBaoTri}</Badge>
          <Badge variant="outline">Phong dang thue: {stats.phongDangThue}</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
