import { http } from "@/lib/http";
import type { ApiListQuery, ApiResponse } from "@/types/api";
import type { ThongBao } from "@/types";
import { ensureStringId, toApiResponse, withLimit } from "@/services/service-utils";

export type ThongBaoPayload = Partial<ThongBao> & {
  tieuDe: string;
  noiDung: string;
  loai: "chung" | "hoaDon" | "suCo" | "hopDong" | "khac";
  ngayGui: string;
};

function mapThongBaoFromBackend(raw: any): ThongBao {
  return {
    ...raw, // Giữ lại toàn bộ dữ liệu gốc (phòng, tòa nhà, danh sách người nhận, v.v.)
    _id: String(raw.id || raw._id || ''),
    tieuDe: raw.tieu_de || raw.tieuDe || '',
    noiDung: raw.noi_dung || raw.noiDung || '',
    loai: raw.loai || 'chung',
    nguoiGui: raw.nguoi_gui || raw.nguoiGui || '',
    ngayGui: raw.ngay_gui || raw.ngayGui || '',
    ngayTao: raw.ngay_tao || raw.ngayTao,
    nguoiNhan: raw.nguoi_nhan || raw.nguoiNhan || [],
    phong: raw.phong || [],
    daDoc: raw.da_doc || raw.daDoc || [],
  };
}

function mapThongBaoToBackend(payload: any): any {
  return {
    tieu_de: payload.tieuDe,
    noi_dung: payload.noiDung,
    loai: payload.loai,
    ngay_gui: payload.ngayGui,
    nguoi_gui: typeof payload.nguoiGui === 'object' ? payload.nguoiGui._id : payload.nguoiGui,
  };
}

export async function getAllThongBao(
  query?: ApiListQuery
): Promise<ApiResponse<ThongBao[]>> {
  const data = await http.get("/thong_bao", { query: withLimit(query, 100) });
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapThongBaoFromBackend);
  }
  return response as ApiResponse<ThongBao[]>;
}

export async function createThongBao(
  payload: ThongBaoPayload
): Promise<ApiResponse<ThongBao>> {
  const submitData = mapThongBaoToBackend(payload);
  const data = await http.post("/thong_bao", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapThongBaoFromBackend(response.data);
  }
  return response as ApiResponse<ThongBao>;
}

export async function updateThongBao(
  id: string | number,
  payload: Partial<ThongBaoPayload>
): Promise<ApiResponse<ThongBao>> {
  const submitData = mapThongBaoToBackend(payload);
  const data = await http.put("/thong_bao", {
    query: { id: ensureStringId(id) },
    body: submitData,
  });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapThongBaoFromBackend(response.data);
  }
  return response as ApiResponse<ThongBao>;
}

export async function deleteThongBao(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete("/thong_bao", {
    query: { id: ensureStringId(id) },
  });
  return toApiResponse<null>(data);
}

export const thongBaoService = {
  getAllThongBao,
  createThongBao,
  updateThongBao,
  deleteThongBao,
};
