'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCache } from '@/hooks/use-cache';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Plus, Search, Edit, Trash2, Shield, Phone, Calendar, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { UserDataTable } from './table';
import { getErrorMessage } from '@/lib/api-error';
import { getMainUser } from '@/lib/auth-storage';
import { userService, type AdminUserPayload } from '@/services/userService';
import type { AuthUser } from '@/types/auth';

type UserRole = 'admin' | 'chuNha' | 'nhanVien';

interface UserRecord {
  _id: string;
  id?: string;
  name?: string;
  ten?: string;
  email: string;
  phone?: string;
  soDienThoai?: string;
  role?: string;
  vaiTro?: string;
  avatar?: string;
  anhDaiDien?: string;
  createdAt: string;
  lastLogin?: string;
  isActive?: boolean;
  trangThai?: string;
}

interface CreateUserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
}

interface EditUserForm {
  name: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeRole(value: unknown): UserRole {
  if (value === 'admin' || value === 'chuNha' || value === 'nhanVien') {
    return value;
  }

  return 'nhanVien';
}

function normalizeUser(input: unknown): UserRecord | null {
  if (!isRecord(input)) {
    return null;
  }

  const id = String(input._id ?? input.id ?? '').trim();
  if (!id) {
    return null;
  }

  const emailRaw = input.email;
  const email = typeof emailRaw === 'string' ? emailRaw : '';

  const createdAtRaw = input.createdAt;
  const createdAt =
    typeof createdAtRaw === 'string' && createdAtRaw
      ? createdAtRaw
      : new Date().toISOString();

  const role = normalizeRole(input.role ?? input.vaiTro);

  return {
    _id: id,
    id,
    email,
    name: typeof input.name === 'string' ? input.name : undefined,
    ten: typeof input.ten === 'string' ? input.ten : undefined,
    phone: typeof input.phone === 'string' ? input.phone : undefined,
    soDienThoai: typeof input.soDienThoai === 'string' ? input.soDienThoai : undefined,
    role,
    vaiTro: role,
    avatar: typeof input.avatar === 'string' ? input.avatar : undefined,
    anhDaiDien: typeof input.anhDaiDien === 'string' ? input.anhDaiDien : undefined,
    createdAt,
    lastLogin: typeof input.lastLogin === 'string' ? input.lastLogin : undefined,
    isActive: typeof input.isActive === 'boolean' ? input.isActive : undefined,
    trangThai: typeof input.trangThai === 'string' ? input.trangThai : undefined,
  };
}

function pickUserArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.users)) {
    return payload.users;
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.list)) {
    return payload.list;
  }

  return [];
}

function toCreatePayload(form: CreateUserForm): AdminUserPayload {
  const normalizedRole = normalizeRole(form.role);
  return {
    name: form.name.trim(),
    ten: form.name.trim(),
    email: form.email.trim(),
    password: form.password,
    matKhau: form.password,
    phone: form.phone.trim(),
    soDienThoai: form.phone.trim(),
    role: normalizedRole,
    vaiTro: normalizedRole,
  };
}

function toUpdatePayload(form: EditUserForm): Partial<AdminUserPayload> {
  const normalizedRole = normalizeRole(form.role);
  return {
    name: form.name.trim(),
    ten: form.name.trim(),
    phone: form.phone.trim(),
    soDienThoai: form.phone.trim(),
    role: normalizedRole,
    vaiTro: normalizedRole,
    isActive: form.isActive,
    trangThai: form.isActive ? 'hoatDong' : 'tamKhoa',
  };
}

function getUserName(user: UserRecord): string {
  return user.name || user.ten || 'Không có tên';
}

function getUserPhone(user: UserRecord): string {
  return user.phone || user.soDienThoai || '';
}

function getUserRole(user: UserRecord): UserRole {
  return normalizeRole(user.role || user.vaiTro);
}

function getUserIsActive(user: UserRecord): boolean {
  if (typeof user.isActive === 'boolean') {
    return user.isActive;
  }

  return user.trangThai === 'hoatDong';
}

function getRoleBadge(role: UserRole): React.ReactNode {
  switch (role) {
    case 'admin':
      return <Badge variant="destructive">Quản trị viên</Badge>;
    case 'chuNha':
      return <Badge variant="default">Chủ nhà</Badge>;
    case 'nhanVien':
      return <Badge variant="secondary">Nhân viên</Badge>;
    default:
      return <Badge variant="outline">Người dùng</Badge>;
  }
}

export default function AccountManagementPage() {
  const cache = useCache<{ users: UserRecord[] }>({ key: 'tai-khoan-data', duration: 300000 });
  const hasFetchedRef = useRef(false);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  const [createUserData, setCreateUserData] = useState<CreateUserForm>({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'nhanVien',
  });

  const [editUserData, setEditUserData] = useState<EditUserForm>({
    name: '',
    phone: '',
    role: 'nhanVien',
    isActive: true,
  });

  const currentRole = normalizeRole(currentUser?.role ?? currentUser?.vaiTro);
  const isAdmin = currentRole === 'admin';

  useEffect(() => {
    document.title = 'Quản lý tài khoản';
    setCurrentUser(getMainUser());
  }, []);

  useEffect(() => {
    if (isAdmin && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      void fetchUsers(false);
      return;
    }

    if (!isAdmin) {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const fetchUsers = async (forceRefresh = false) => {
    try {
      setLoading(true);

      if (!forceRefresh) {
        const cached = cache.getCache();
        if (cached?.users?.length) {
          setUsers(cached.users);
          return;
        }
      }

      const response = await userService.getAdminUsers();
      const rawUsers = pickUserArray(response.data);
      const normalizedUsers = rawUsers.map(normalizeUser).filter((item): item is UserRecord => item !== null);

      setUsers(normalizedUsers);
      cache.setCache({ users: normalizedUsers });
    } catch (error) {
      toast.error(getErrorMessage(error, 'Không thể tải danh sách người dùng.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    cache.setIsRefreshing(true);
    await fetchUsers(true);
    cache.setIsRefreshing(false);
    toast.success('Đã tải dữ liệu mới nhất.');
  };

  const handleCreateUser = async () => {
    if (!createUserData.name.trim() || !createUserData.email.trim() || !createUserData.password.trim()) {
      toast.error('Vui lòng nhập đầy đủ họ tên, email và mật khẩu.');
      return;
    }

    try {
      await userService.createAdminUser(toCreatePayload(createUserData));
      toast.success('Tạo tài khoản thành công.');
      setIsCreateDialogOpen(false);
      setCreateUserData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'nhanVien',
      });
      cache.clearCache();
      await fetchUsers(true);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Tạo tài khoản thất bại.'));
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      await userService.updateAdminUser(selectedUser._id, toUpdatePayload(editUserData));
      toast.success('Cập nhật tài khoản thành công.');
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      cache.clearCache();
      await fetchUsers(true);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Cập nhật tài khoản thất bại.'));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      return;
    }

    try {
      await userService.deleteAdminUser(userId);
      toast.success('Xóa tài khoản thành công.');
      cache.clearCache();
      await fetchUsers(true);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Xóa tài khoản thất bại.'));
    }
  };

  const openEditDialog = (user: UserRecord) => {
    setSelectedUser(user);
    setEditUserData({
      name: getUserName(user),
      phone: getUserPhone(user),
      role: getUserRole(user),
      isActive: getUserIsActive(user),
    });
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase().trim();
    if (!keyword) {
      return true;
    }

    return (
      getUserName(user).toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    );
  });

  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-semibold text-gray-900">Không có quyền truy cập</h2>
          <p className="text-gray-600">Bạn cần quyền quản trị viên để truy cập trang này.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Đang tải danh sách người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl lg:text-3xl">Quản lý tài khoản</h1>
          <p className="text-xs text-gray-600 md:text-sm">Quản lý người dùng và phân quyền hệ thống</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={cache.isRefreshing}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw className={`h-4 w-4 sm:mr-2 ${cache.isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{cache.isRefreshing ? 'Đang tải...' : 'Tải mới'}</span>
          </Button>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Tạo tài khoản</span>
            <span className="sm:hidden">Tạo</span>
          </Button>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Tạo tài khoản mới</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">Tạo tài khoản người dùng mới cho hệ thống</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs md:text-sm">Họ và tên</Label>
              <Input
                id="name"
                value={createUserData.name}
                onChange={(e) => setCreateUserData({ ...createUserData, name: e.target.value })}
                placeholder="Nhập họ và tên"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs md:text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                value={createUserData.email}
                onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })}
                placeholder="Nhập email"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs md:text-sm">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={createUserData.password}
                onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })}
                placeholder="Nhập mật khẩu"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs md:text-sm">Số điện thoại</Label>
              <Input
                id="phone"
                value={createUserData.phone}
                onChange={(e) => setCreateUserData({ ...createUserData, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs md:text-sm">Vai trò</Label>
              <Select
                value={createUserData.role}
                onValueChange={(value) => setCreateUserData({ ...createUserData, role: normalizeRole(value) })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nhanVien" className="text-sm">Nhân viên</SelectItem>
                  <SelectItem value="chuNha" className="text-sm">Chủ nhà</SelectItem>
                  <SelectItem value="admin" className="text-sm">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(false)} className="w-full sm:w-auto">
              Hủy
            </Button>
            <Button size="sm" onClick={handleCreateUser} className="w-full sm:w-auto">
              Tạo tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 gap-1.5 md:gap-4 lg:grid-cols-4 lg:gap-6">
        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-600 md:text-xs">Tổng người dùng</p>
              <p className="text-base font-bold md:text-2xl">{users.length}</p>
            </div>
            <Users className="h-3 w-3 text-gray-500 md:h-4 md:w-4" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-600 md:text-xs">Quản trị viên</p>
              <p className="text-base font-bold text-red-600 md:text-2xl">
                {users.filter((u) => getUserRole(u) === 'admin').length}
              </p>
            </div>
            <Shield className="h-3 w-3 text-red-600 md:h-4 md:w-4" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-600 md:text-xs">Chủ nhà</p>
              <p className="text-base font-bold text-blue-600 md:text-2xl">
                {users.filter((u) => getUserRole(u) === 'chuNha').length}
              </p>
            </div>
            <Users className="h-3 w-3 text-blue-600 md:h-4 md:w-4" />
          </div>
        </Card>

        <Card className="p-2 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-600 md:text-xs">Nhân viên</p>
              <p className="text-base font-bold text-green-600 md:text-2xl">
                {users.filter((u) => getUserRole(u) === 'nhanVien').length}
              </p>
            </div>
            <Users className="h-3 w-3 text-green-600 md:h-4 md:w-4" />
          </div>
        </Card>
      </div>

      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Danh sách người dùng
          </CardTitle>
          <CardDescription>
            Quản lý tất cả tài khoản trong hệ thống ({filteredUsers.length} người dùng)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <UserDataTable
            data={filteredUsers}
            onEdit={openEditDialog}
            onDelete={handleDeleteUser}
            currentUserId={String(currentUser?._id ?? currentUser?.id ?? '')}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </CardContent>
      </Card>

      <div className="md:hidden">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Danh sách người dùng</h2>
          <span className="text-sm text-gray-500">{filteredUsers.length} người dùng</span>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const isCurrentUser = String(currentUser?._id ?? currentUser?.id ?? '') === user._id;

            return (
              <Card key={user._id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-medium text-gray-900">{getUserName(user)}</h3>
                          <p className="truncate text-sm text-gray-500">{user.email}</p>
                        </div>
                        {getRoleBadge(getUserRole(user))}
                      </div>
                      {isCurrentUser && (
                        <Badge variant="outline" className="mt-1 text-xs">Bạn</Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 border-t pt-2 text-sm">
                    {getUserPhone(user) && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{getUserPhone(user)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <Badge variant={getUserIsActive(user) ? 'default' : 'secondary'} className="text-xs">
                      {getUserIsActive(user) ? 'Hoạt động' : 'Ngừng hoạt động'}
                    </Badge>
                  </div>

                  {!isCurrentUser && (
                    <div className="flex gap-2 border-t pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                        className="flex-1"
                      >
                        <Edit className="mr-1 h-3.5 w-3.5" />
                        Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user._id)}
                        className="flex-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Xóa
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-gray-500">Không có người dùng nào</p>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-[95vw] sm:w-full sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Chỉnh sửa tài khoản</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">Cập nhật thông tin tài khoản người dùng</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4 md:gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-xs md:text-sm">Họ và tên</Label>
              <Input
                id="edit-name"
                value={editUserData.name}
                onChange={(e) => setEditUserData({ ...editUserData, name: e.target.value })}
                placeholder="Nhập họ và tên"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-xs md:text-sm">Số điện thoại</Label>
              <Input
                id="edit-phone"
                value={editUserData.phone}
                onChange={(e) => setEditUserData({ ...editUserData, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="text-xs md:text-sm">Vai trò</Label>
              <Select
                value={editUserData.role}
                onValueChange={(value) => setEditUserData({ ...editUserData, role: normalizeRole(value) })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nhanVien" className="text-sm">Nhân viên</SelectItem>
                  <SelectItem value="chuNha" className="text-sm">Chủ nhà</SelectItem>
                  <SelectItem value="admin" className="text-sm">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-xs md:text-sm">Trạng thái</Label>
              <Select
                value={editUserData.isActive ? 'active' : 'inactive'}
                onValueChange={(value) =>
                  setEditUserData({ ...editUserData, isActive: value === 'active' })
                }
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-sm">Hoạt động</SelectItem>
                  <SelectItem value="inactive" className="text-sm">Ngừng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)} className="w-full sm:w-auto">
              Hủy
            </Button>
            <Button size="sm" onClick={handleEditUser} className="w-full sm:w-auto">
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
