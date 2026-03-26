import { http } from "@/lib/http";
import type { ApiListQuery, ApiResponse } from "@/types/api";
import type { ToaNha } from "@/types";
import { ensureStringId, toApiResponse, withLimit } from "@/services/service-utils";

export interface ToaNhaPayload {
  tenToaNha: string;
  diaChi: ToaNha["diaChi"];
  moTa?: string;
  tienNghiChung?: string[];
  anhToaNha?: string[];
}

// Hàm ánh xạ từ DB (flat snake_case) sang Frontend (nested camelCase)
function mapToaNhaFromBackend(raw: any): ToaNha {
  return {
    ...raw, // Giữ lại toàn bộ dữ liệu gốc (bao gồm phongTrong, phongDangThue, v.v.)
    _id: String(raw.id || raw._id || ''),
    tenToaNha: raw.ten_toa_nha || raw.tenToaNha || '',
    chuSoHuu: raw.chu_so_huu || raw.chuSoHuu || '',
    moTa: raw.mo_ta || raw.moTa || '',
    tongSoPhong: Number(raw.tong_so_phong || raw.tongSoPhong || 0),
    diaChi: {
      soNha: raw.so_nha || raw?.diaChi?.soNha || '',
      duong: raw.duong || raw?.diaChi?.duong || '',
      phuong: raw.phuong || raw?.diaChi?.phuong || '',
      quan: raw.quan || raw?.diaChi?.quan || '',
      thanhPho: raw.thanh_pho || raw?.diaChi?.thanhPho || '',
    },
    ngayTao: raw.ngay_tao || raw.ngayTao,
    tienNghiChung: raw.tien_nghi_chung || raw.tienNghiChung || [],
    anhToaNha: raw.anh_toa_nha || raw.anhToaNha || [],
  };
}

// Hàm ánh xạ từ Frontend (nested camelCase) sang DB (flat snake_case)
function mapToaNhaToBackend(payload: Partial<ToaNhaPayload>): any {
  const mapped: any = {};
  
  if (payload.tenToaNha) mapped.ten_toa_nha = payload.tenToaNha;
  if (payload.moTa !== undefined) mapped.mo_ta = payload.moTa;
  
  if (payload.diaChi) {
    if (payload.diaChi.soNha) mapped.so_nha = payload.diaChi.soNha;
    if (payload.diaChi.duong) mapped.duong = payload.diaChi.duong;
    if (payload.diaChi.phuong) mapped.phuong = payload.diaChi.phuong;
    if (payload.diaChi.quan) mapped.quan = payload.diaChi.quan;
    if (payload.diaChi.thanhPho) mapped.thanh_pho = payload.diaChi.thanhPho;
  }

  // Không gửi chu_so_huu là "Admin" (string) vì DB yêu cầu INT (ID người dùng)
  // Không gửi tong_so_phong là 0 mặc định để tránh ghi đè dữ liệu cũ
  
  return mapped;
}

export async function getAllToaNha(query?: ApiListQuery): Promise<ApiResponse<ToaNha[]>> {
  const data = await http.get("/toa_nha", { query: withLimit(query, 100) });
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapToaNhaFromBackend);
  }
  return response as ApiResponse<ToaNha[]>;
}

export async function getToaNhaById(id: string | number): Promise<ApiResponse<ToaNha>> {
  const data = await http.get(`/toa_nha/${ensureStringId(id)}`);
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    if (Array.isArray(response.data)) {
        response.data = mapToaNhaFromBackend(response.data[0]);
    } else {
        response.data = mapToaNhaFromBackend(response.data);
    }
  }
  return response as ApiResponse<ToaNha>;
}

export async function createToaNha(payload: ToaNhaPayload): Promise<ApiResponse<ToaNha>> {
  const submitData = mapToaNhaToBackend(payload);
  const data = await http.post("/toa_nha", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapToaNhaFromBackend(response.data);
  }
  return response as ApiResponse<ToaNha>;
}

export async function updateToaNha(
  id: string | number,
  payload: Partial<ToaNhaPayload>
): Promise<ApiResponse<ToaNha>> {
  const submitData = mapToaNhaToBackend(payload);
  const data = await http.put(`/toa_nha/${ensureStringId(id)}`, { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapToaNhaFromBackend(response.data);
  }
  return response as ApiResponse<ToaNha>;
}

export async function deleteToaNha(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete(`/toa_nha/${ensureStringId(id)}`);
  return toApiResponse<null>(data);
}

export async function getPublicToaNha(): Promise<ApiResponse<ToaNha[]>> {
  try {
    const data = await http.get("/toa_nha_public");
    const response = toApiResponse<any[]>(data);
    if (response.success && Array.isArray(response.data)) {
      response.data = response.data.map(mapToaNhaFromBackend);
    }
    return response as ApiResponse<ToaNha[]>;
  } catch {
    return getAllToaNha();
  }
}

export const toaNhaService = {
  getAllToaNha,
  getToaNhaById,
  createToaNha,
  updateToaNha,
  deleteToaNha,
  getPublicToaNha,
};
