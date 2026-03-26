import { http } from "@/lib/http";
import type { ApiListQuery, ApiResponse } from "@/types/api";
import type { SuCo } from "@/types";
import { ensureStringId, toApiResponse, withLimit } from "@/services/service-utils";

export type SuCoPayload = Partial<SuCo> & {
  phong: string;
  khachThue: string;
  tieuDe: string;
  moTa: string;
  loaiSuCo: "dienNuoc" | "noiThat" | "vesinh" | "anNinh" | "khac";
  mucDoUuTien: "thap" | "trungBinh" | "cao" | "khancap";
};

function mapSuCoFromBackend(raw: any): SuCo {
  return {
    ...raw, // Giữ lại toàn bộ dữ liệu gốc (người báo cáo, ảnh sự cố, v.v.)
    _id: String(raw.id || raw._id || ''),
    phong: raw.phong_id || raw.phong || '',
    khachThue: raw.khach_thue_id || raw.khachThue || '',
    tieuDe: raw.tieu_de || raw.tieuDe || '',
    loaiSuCo: raw.loai_su_co || raw.loaiSuCo || 'khac',
    mucDoUuTien: raw.muc_do_uu_tien || raw.mucDoUuTien || 'trungBinh',
    trangThai: raw.trang_thai || raw.trangThai || 'moi',
    ngayBaoCao: raw.ngay_bao_cao || raw.ngayBaoCao || '',
    ngayTao: raw.ngay_tao || raw.ngayTao,
    anhSuCo: raw.anh_su_co || raw.anhSuCo || [],
  };
}

function mapSuCoToBackend(payload: any): any {
  return {
    phong_id: typeof payload.phong === 'object' ? payload.phong._id : payload.phong,
    khach_thue_id: typeof payload.khachThue === 'object' ? payload.khachThue._id : payload.khachThue,
    tieu_de: payload.tieuDe,
    mo_ta: payload.moTa,
    anh_su_co: payload.anhSuCo,
    loai_su_co: payload.loaiSuCo,
    muc_do_uu_tien: payload.mucDoUuTien,
    trang_thai: payload.trangThai,
    nguoi_xu_ly: typeof payload.nguoiXuLy === 'object' ? payload.nguoiXuLy._id : payload.nguoiXuLy,
    ghi_chu_xu_ly: payload.ghiChuXuLy,
    ngay_bao_cao: payload.ngayBaoCao,
    ngay_xu_ly: payload.ngayXuLy,
    ngay_hoan_thanh: payload.ngayHoanThanh,
  };
}

export async function getAllSuCo(query?: ApiListQuery): Promise<ApiResponse<SuCo[]>> {
  const data = await http.get("/su_co", { query: withLimit(query, 100) });
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapSuCoFromBackend);
  }
  return response as ApiResponse<SuCo[]>;
}

export async function createSuCo(payload: SuCoPayload): Promise<ApiResponse<SuCo>> {
  const submitData = mapSuCoToBackend(payload);
  const data = await http.post("/su_co", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapSuCoFromBackend(response.data);
  }
  return response as ApiResponse<SuCo>;
}

export async function updateSuCo(
  id: string | number,
  payload: Partial<SuCoPayload>
): Promise<ApiResponse<SuCo>> {
  const submitData = mapSuCoToBackend(payload);
  const data = await http.put(`/su_co/${ensureStringId(id)}`, { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapSuCoFromBackend(response.data);
  }
  return response as ApiResponse<SuCo>;
}

export async function deleteSuCo(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete(`/su_co/${ensureStringId(id)}`);
  return toApiResponse<null>(data);
}

export const suCoService = {
  getAllSuCo,
  createSuCo,
  updateSuCo,
  deleteSuCo,
};
