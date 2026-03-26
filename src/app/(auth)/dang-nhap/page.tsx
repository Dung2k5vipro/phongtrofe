'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { authService } from '@/services/authService';
import { getMainUser, saveMainAuthSession } from '@/lib/auth-storage';
import { getErrorMessage } from '@/lib/api-error';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginForm = z.infer<typeof loginSchema>;

const TEMPORARILY_DISABLE_MAIN_LOGIN = false;

const TEMPORARY_MAIN_USER = {
  id: 'temporary-admin',
  ten: 'Tài khoản tạm thời',
  name: 'Tài khoản tạm thời',
  email: 'tam-thoi@example.com',
  vaiTro: 'admin',
  role: 'admin',
} as const;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!TEMPORARILY_DISABLE_MAIN_LOGIN) {
      return;
    }

    if (!getMainUser()) {
      saveMainAuthSession({
        user: TEMPORARY_MAIN_USER,
      });
    }

    router.replace('/dashboard');
  }, [router]);

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login({
        email: data.email,
        matKhau: data.matKhau,
      });

      if (!result.success || !result.data) {
        setError(result.message || 'Đăng nhập thất bại');
        return;
      }

      saveMainAuthSession(result.data);
      router.push('/dashboard');
    } catch (err) {
      setError(getErrorMessage(err, 'Đăng nhập thất bại. Vui lòng thử lại.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (TEMPORARILY_DISABLE_MAIN_LOGIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Đăng nhập tạm thời</CardTitle>
            <CardDescription>Hệ thống đang bỏ qua bước đăng nhập và chuyển bạn vào dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center gap-3 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang chuyển hướng...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 md:space-y-8">
        <div className="text-center">
          <h2 className="mt-4 md:mt-6 text-2xl md:text-3xl font-bold text-gray-900">Đăng nhập hệ thống</h2>
          <p className="mt-2 text-xs md:text-sm text-gray-600">Quản lý phòng trọ</p>
        </div>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl">Đăng nhập</CardTitle>
            <CardDescription className="text-xs md:text-sm">Nhập thông tin đăng nhập của bạn</CardDescription>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs md:text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  {...register('email')}
                  className={`text-sm ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-xs md:text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matKhau" className="text-xs md:text-sm">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="matKhau"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    {...register('matKhau')}
                    className={`text-sm ${errors.matKhau ? 'border-red-500 pr-10' : 'pr-10'}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />}
                  </Button>
                </div>
                {errors.matKhau && (
                  <p className="text-xs md:text-sm text-red-500">{errors.matKhau.message}</p>
                )}
              </div>

              <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  'Đăng nhập'
                )}
              </Button>
            </form>

            <div className="mt-4 md:mt-6 text-center">
              <p className="text-xs md:text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link href="/dang-ky" className="font-medium text-blue-600 hover:text-blue-500">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
