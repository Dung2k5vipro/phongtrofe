import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import { ensureStringId, toApiResponse } from "@/services/service-utils";

export interface UserProfilePayload {
  name: string;
  ten?: string;
  phone?: string;
  soDienThoai?: string;
  address?: string;
  diaChi?: string;
  avatar?: string;
  anhDaiDien?: string;
}

export interface AdminUserPayload {
  name: string;
  ten?: string;
  email: string;
  password?: string;
  matKhau?: string;
  phone?: string;
  soDienThoai?: string;
  role: string;
  vaiTro?: string;
  isActive?: boolean;
  trangThai?: string;
}

function mapUserFromBackend(raw: any): Record<string, any> {
  return {
    _id: String(raw.id || raw._id || ''),
    ten: raw.ten || '',
    email: raw.email || '',
    soDienThoai: raw.so_dien_thoai || raw.soDienThoai || '',
    vaiTro: raw.vai_tro || raw.vaiTro || 'nhanVien',
    anhDaiDien: raw.anh_dai_dien || raw.anhDaiDien || '',
    trangThai: String(raw.trang_thai || raw.trangThai || '1'),
    ngayTao: raw.ngay_tao || raw.ngayTao,
    ngayCapNhat: raw.ngay_cap_nhat || raw.ngayCapNhat,
  };
}

export async function getUserProfile(id: string | number): Promise<ApiResponse<Record<string, unknown>>> {
  const data = await http.get(`/nguoi_dung/${ensureStringId(id)}`);
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    if (Array.isArray(response.data)) {
        response.data = mapUserFromBackend(response.data[0]);
    } else {
        response.data = mapUserFromBackend(response.data);
    }
  }
  return response;
}

export async function updateUserProfile(
  id: string | number,
  payload: Partial<UserProfilePayload>
): Promise<ApiResponse<Record<string, unknown>>> {
  const data = await http.put(`/nguoi_dung/${ensureStringId(id)}`, { 
    body: {
      ten: payload.ten || payload.name,
      so_dien_thoai: payload.soDienThoai || payload.phone,
      dia_chi: payload.diaChi || payload.address,
      anh_dai_dien: payload.anhDaiDien || payload.avatar
    }
  });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapUserFromBackend(response.data);
  }
  return response;
}

export async function getAdminUsers(): Promise<ApiResponse<Array<Record<string, unknown>>>> {
  const data = await http.get("/nguoi_dung");
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapUserFromBackend);
  }
  return response as ApiResponse<Array<Record<string, unknown>>>;
}

export async function createAdminUser(
  payload: AdminUserPayload
): Promise<ApiResponse<Record<string, unknown>>> {
  const data = await http.post("/nguoi_dung", { 
    body: {
      ten: payload.ten || payload.name,
      email: payload.email,
      mat_khau: payload.matKhau || payload.password,
      so_dien_thoai: payload.soDienThoai || payload.phone,
      vai_tro: payload.vaiTro || payload.role,
      trang_thai: payload.trangThai || (payload.isActive ? "1" : "0")
    }
  });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapUserFromBackend(response.data);
  }
  return response;
}

export async function updateAdminUser(
  id: string | number,
  payload: Partial<AdminUserPayload>
): Promise<ApiResponse<Record<string, unknown>>> {
  const data = await http.put(`/nguoi_dung/${ensureStringId(id)}`, { 
    body: {
      ten: payload.ten || payload.name,
      email: payload.email,
      mat_khau: payload.matKhau || payload.password,
      so_dien_thoai: payload.soDienThoai || payload.phone,
      vai_tro: payload.vaiTro || payload.role,
      trang_thai: payload.trangThai
    }
  });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapUserFromBackend(response.data);
  }
  return response;
}

export async function deleteAdminUser(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete(`/nguoi_dung/${ensureStringId(id)}`);
  return toApiResponse<null>(data);
}

export const userService = {
  getUserProfile,
  updateUserProfile,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
};
