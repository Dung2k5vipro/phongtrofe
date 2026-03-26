import { http } from "@/lib/http";
import type { ApiListQuery, ApiResponse } from "@/types/api";
import type { KhachThue } from "@/types";
import type { TenantDashboardData } from "@/types/auth";
import { ensureStringId, toApiResponse, withLimit } from "@/services/service-utils";

export type KhachThuePayload = Partial<KhachThue> & {
  hoTen: string;
  soDienThoai: string;
  cccd: string;
  ngaySinh: string;
  gioiTinh: "nam" | "nu" | "khac";
  queQuan: string;
};

function mapKhachThueFromBackend(raw: any): KhachThue {
  return {
    ...raw, // Giữ lại toàn bộ dữ liệu gốc (bao gồm lịch sử thuê, v.v.)
    _id: String(raw.id || raw._id || ''),
    hoTen: raw.ho_ten || raw.hoTen || '',
    soDienThoai: raw.so_dien_thoai || raw.soDienThoai || '',
    ngaySinh: raw.ngay_sinh || raw.ngaySinh || '',
    gioiTinh: raw.gioi_tinh || raw.gioiTinh || 'khac',
    queQuan: raw.que_quan || raw.queQuan || '',
    anhCCCD: {
      matTruoc: raw.anh_cccd_truoc || raw?.anhCCCD?.matTruoc || '',
      matSau: raw.anh_cccd_sau || raw?.anhCCCD?.matSau || ''
    },
    trangThai: raw.trang_thai || raw.trangThai || 'chuaThue',
    ngayTao: raw.ngay_tao || raw.ngayTao,
  };
}

function mapKhachThueToBackend(payload: any): any {
  return {
    ho_ten: payload.hoTen,
    so_dien_thoai: payload.soDienThoai,
    email: payload.email,
    cccd: payload.cccd,
    ngay_sinh: payload.ngaySinh,
    gioi_tinh: payload.gioiTinh,
    que_quan: payload.queQuan,
    anh_cccd_truoc: payload.anhCCCD?.matTruoc,
    anh_cccd_sau: payload.anhCCCD?.matSau,
    nghe_nghiep: payload.ngheNghiep,
    mat_khau: payload.matKhau,
    trang_thai: payload.trangThai || 'chuaThue',
  };
}

export async function getAllKhachThue(
  query?: ApiListQuery
): Promise<ApiResponse<KhachThue[]>> {
  const data = await http.get("/khach_thue", { query: withLimit(query, 100) });
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapKhachThueFromBackend);
  }
  return response as ApiResponse<KhachThue[]>;
}

export async function getKhachThueById(
  id: string | number
): Promise<ApiResponse<KhachThue>> {
  const data = await http.get(`/khach_thue/${ensureStringId(id)}`);
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    if (Array.isArray(response.data)) {
        response.data = mapKhachThueFromBackend(response.data[0]);
    } else {
        response.data = mapKhachThueFromBackend(response.data);
    }
  }
  return response as ApiResponse<KhachThue>;
}

export async function createKhachThue(
  payload: KhachThuePayload
): Promise<ApiResponse<KhachThue>> {
  const submitData = mapKhachThueToBackend(payload);
  const data = await http.post("/khach_thue", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapKhachThueFromBackend(response.data);
  }
  return response as ApiResponse<KhachThue>;
}

export async function updateKhachThue(
  id: string | number,
  payload: Partial<KhachThuePayload>
): Promise<ApiResponse<KhachThue>> {
  const submitData = mapKhachThueToBackend(payload);
  const data = await http.put(`/khach_thue/${ensureStringId(id)}`, { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapKhachThueFromBackend(response.data);
  }
  return response as ApiResponse<KhachThue>;
}

export async function deleteKhachThue(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete(`/khach_thue/${ensureStringId(id)}`);
  return toApiResponse<null>(data);
}

export async function getTenantDashboard(
  token: string
): Promise<ApiResponse<TenantDashboardData>> {
  const data = await http.get("/auth/khach_thue/me", { token });
  return toApiResponse<TenantDashboardData>(data);
}

export const khachThueService = {
  getAllKhachThue,
  getKhachThueById,
  createKhachThue,
  updateKhachThue,
  deleteKhachThue,
  getTenantDashboard,
};
