'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Lock, LogIn, Home } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/authService';
import { saveTenantAuthSession } from '@/lib/auth-storage';
import { getErrorMessage } from '@/lib/api-error';

export default function KhachThueDangNhapPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    soDienThoai: '',
    matKhau: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authService.loginTenant(formData);

      if (result.success && result.data) {
        saveTenantAuthSession(result.data);
        toast.success(result.message || 'Dang nhap thanh cong');
        router.push('/khach-thue/dashboard');
      } else {
        toast.error(result.message || 'Dang nhap that bai');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Co loi xay ra khi dang nhap'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Home className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Dang nhap Khach thue</CardTitle>
          <CardDescription>Nhap so dien thoai va mat khau de xem thong tin phong tro cua ban</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="soDienThoai">So dien thoai</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="soDienThoai"
                  type="tel"
                  placeholder="0123456789"
                  value={formData.soDienThoai}
                  onChange={(e) => setFormData((prev) => ({ ...prev, soDienThoai: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="matKhau">Mat khau</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="matKhau"
                  type="password"
                  placeholder="Nhap mat khau"
                  value={formData.matKhau}
                  onChange={(e) => setFormData((prev) => ({ ...prev, matKhau: e.target.value }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Dang dang nhap...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Dang nhap
                </>
              )}
            </Button>

            <div className="text-center text-sm text-gray-600 mt-4">
              <p>Chua co mat khau?</p>
              <p className="text-xs mt-1">Vui long lien he quan ly de duoc tao tai khoan</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
