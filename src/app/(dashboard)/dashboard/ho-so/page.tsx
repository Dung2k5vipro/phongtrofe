'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, MapPin, Shield, Edit3, Save, X, Key, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { getMainAccessToken, getMainUser, saveMainAuthSession } from '@/lib/auth-storage';
import { getErrorMessage } from '@/lib/api-error';
import { userService } from '@/services/userService';

interface UserProfile {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function mapUserProfile(raw: unknown): Partial<UserProfile> {
  if (!isObject(raw)) {
    return {};
  }

  return {
    _id: typeof raw._id === 'string' ? raw._id : undefined,
    name:
      (typeof raw.name === 'string' && raw.name) ||
      (typeof raw.ten === 'string' && raw.ten) ||
      '',
    email: typeof raw.email === 'string' ? raw.email : '',
    phone:
      (typeof raw.phone === 'string' && raw.phone) ||
      (typeof raw.soDienThoai === 'string' && raw.soDienThoai) ||
      undefined,
    address:
      (typeof raw.address === 'string' && raw.address) ||
      (typeof raw.diaChi === 'string' && raw.diaChi) ||
      undefined,
    avatar:
      (typeof raw.avatar === 'string' && raw.avatar) ||
      (typeof raw.anhDaiDien === 'string' && raw.anhDaiDien) ||
      undefined,
    role:
      (typeof raw.role === 'string' && raw.role) ||
      (typeof raw.vaiTro === 'string' && raw.vaiTro) ||
      undefined,
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined,
    lastLogin: typeof raw.lastLogin === 'string' ? raw.lastLogin : undefined,
  };
}

function getRoleLabel(role?: string) {
  if (role === 'admin') return 'Quan tri vien';
  if (role === 'chuNha') return 'Chu nha';
  if (role === 'nhanVien') return 'Nhan vien';
  return 'Nguoi dung';
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: '',
  });

  useEffect(() => {
    document.title = 'Ho so ca nhan';
  }, []);

  useEffect(() => {
    const token = getMainAccessToken();
    const cachedUser = getMainUser();

    const bootstrapProfile: UserProfile = {
      _id: cachedUser?.id || cachedUser?._id,
      name: cachedUser?.ten || cachedUser?.name || 'Nguoi dung',
      email: cachedUser?.email || 'user@example.com',
      phone: cachedUser?.soDienThoai || cachedUser?.phone || '',
      avatar: cachedUser?.anhDaiDien || cachedUser?.avatar || '',
      role: cachedUser?.vaiTro || cachedUser?.role,
    };

    setProfile(bootstrapProfile);
    setFormData({
      name: bootstrapProfile.name,
      phone: bootstrapProfile.phone || '',
      address: '',
      avatar: bootstrapProfile.avatar || '',
    });

    const fetchProfile = async () => {
      try {
        if (!token) {
          return;
        }

        const result = await userService.getUserProfile();
        if (result.success && result.data) {
          const data = mapUserProfile(result.data);
          setProfile((prev) => {
            const base = prev ?? bootstrapProfile;
            return {
              ...base,
              ...data,
              name: data.name || base.name || '',
              email: data.email || base.email || '',
            };
          });
          setFormData((prev) => ({
            ...prev,
            name: data.name || prev.name,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
            avatar: data.avatar || prev.avatar,
          }));
        }
      } catch (error) {
        toast.error(getErrorMessage(error, 'Khong the tai thong tin ho so'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await userService.updateUserProfile(formData);
      if (result.success) {
        const updated = {
          ...profile,
          ...formData,
        } as UserProfile;
        setProfile(updated);
        saveMainAuthSession({
          user: {
            ...(getMainUser() || {}),
            name: formData.name,
            ten: formData.name,
            phone: formData.phone,
            soDienThoai: formData.phone,
            avatar: formData.avatar,
            anhDaiDien: formData.avatar,
          },
        });
        setIsEditing(false);
        toast.success(result.message || 'Cap nhat ho so thanh cong');
      } else {
        toast.error(result.message || 'Cap nhat ho so that bai');
      }
    } catch (error) {
      toast.error(getErrorMessage(error, 'Co loi xay ra khi cap nhat ho so'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      avatar: profile?.avatar || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Dang tai thong tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Ho so ca nhan</h1>
          <p className="text-xs md:text-sm text-gray-600">Quan ly thong tin tai khoan cua ban</p>
        </div>
        {!isEditing && (
          <Button size="sm" onClick={() => setIsEditing(true)}>
            <Edit3 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Chinh sua</span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-4 md:space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="text-xs md:text-sm">
            <User className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            Thong tin
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs md:text-sm">
            <Key className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            Bao mat
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs md:text-sm">
            <Bell className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
            Thong bao
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle>Thong tin co ban</CardTitle>
              <CardDescription>Cap nhat thong tin ca nhan va avatar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6">
                <Avatar className="h-16 w-16 md:h-20 md:w-20">
                  <AvatarImage src={formData.avatar} alt={formData.name} />
                  <AvatarFallback className="text-base md:text-lg">{getInitials(formData.name || 'U')}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-base md:text-lg font-medium">{formData.name || 'Nguoi dung'}</h3>
                  <Badge variant="outline">{getRoleLabel(profile?.role)}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Ho va ten</Label>
                  {isEditing ? (
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2 p-2 md:p-3 border rounded-md bg-gray-50">
                      <User className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                      <span className="text-sm">{formData.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="flex items-center gap-2 p-2 md:p-3 border rounded-md bg-gray-50">
                    <Mail className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                    <span className="text-sm truncate">{profile?.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">So dien thoai</Label>
                  {isEditing ? (
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  ) : (
                    <div className="flex items-center gap-2 p-2 md:p-3 border rounded-md bg-gray-50">
                      <Phone className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                      <span className="text-sm">{formData.phone || 'Chua cap nhat'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Vai tro</Label>
                  <div className="flex items-center gap-2 p-2 md:p-3 border rounded-md bg-gray-50">
                    <Shield className="h-3 w-3 md:h-4 md:w-4 text-gray-500" />
                    <span className="text-sm">{getRoleLabel(profile?.role)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dia chi</Label>
                {isEditing ? (
                  <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={3} />
                ) : (
                  <div className="flex items-start gap-2 p-2 md:p-3 border rounded-md bg-gray-50">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{formData.address || 'Chua cap nhat'}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4">
                  <Button size="sm" onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                    {saving ? 'Dang luu...' : <><Save className="h-4 w-4 mr-2" />Luu thay doi</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancel} className="w-full sm:w-auto">
                    <X className="h-4 w-4 mr-2" />Huy
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Bao mat tai khoan</CardTitle>
              <CardDescription>Tinh nang doi mat khau se duoc bo sung o phien ban tiep theo.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Thong bao</CardTitle>
              <CardDescription>Cai dat thong bao se duoc bo sung o phien ban tiep theo.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
