import { http } from "@/lib/http";
import type { ApiListQuery, ApiResponse } from "@/types/api";
import type { HopDong } from "@/types";
import { ensureStringId, toApiResponse, withLimit } from "@/services/service-utils";
import { getEntityId, isObjectEntity, normalizeEntity, normalizeEntityList, toCamelDeep } from "@/lib/entity";

export type HopDongPayload = Partial<HopDong> & {
  maHopDong: string;
  phong: string;
  khachThueId: string[];
  nguoiDaiDien: string;
  ngayBatDau: string;
  ngayKetThuc: string;
};

function mapHopDongFromBackend(raw: any): HopDong {
  const camel = toCamelDeep(raw ?? {});
  const phongRaw = camel.phong ?? camel.phongId ?? '';
  const phongValue = isObjectEntity(phongRaw) ? normalizeEntity(phongRaw) : phongRaw;

  if (isObjectEntity(phongValue)) {
    const toaNhaRaw = phongValue.toaNha ?? phongValue.toaNhaId ?? '';
    phongValue.toaNha = isObjectEntity(toaNhaRaw) ? normalizeEntity(toaNhaRaw) : toaNhaRaw;
  }

  const khachThueRaw = camel.khachThueId ?? camel.khachThueIds ?? camel.khachThue ?? camel.khachThues ?? [];

  return {
    ...camel,
    _id: getEntityId(camel) || '',
    maHopDong: camel.maHopDong || '',
    phong: phongValue,
    nguoiDaiDien: normalizeEntity(camel.nguoiDaiDien),
    ngayBatDau: camel.ngayBatDau || '',
    ngayKetThuc: camel.ngayKetThuc || '',
    giaThue: Number(camel.giaThue ?? 0),
    tienCoc: Number(camel.tienCoc ?? 0),
    ngayTao: camel.ngayTao,
    khachThueId: normalizeEntityList(khachThueRaw),
    phiDichVu: camel.phiDichVu || [],
    chuKyThanhToan: camel.chuKyThanhToan,
    ngayThanhToan: Number(camel.ngayThanhToan ?? 0),
    dieuKhoan: camel.dieuKhoan,
    giaDien: Number(camel.giaDien ?? 0),
    giaNuoc: Number(camel.giaNuoc ?? 0),
    chiSoDienBanDau: Number(camel.chiSoDienBanDau ?? 0),
    chiSoNuocBanDau: Number(camel.chiSoNuocBanDau ?? 0),
    trangThai: camel.trangThai || 'hoatDong',
    fileHopDong: camel.fileHopDong,
  };
}

function mapHopDongToBackend(payload: any): any {
  return {
    ma_hop_dong: payload.maHopDong,
    phong_id: getEntityId(payload.phong),
    nguoi_dai_dien: getEntityId(payload.nguoiDaiDien),
    ngay_bat_dau: payload.ngayBatDau,
    ngay_ket_thuc: payload.ngayKetThuc,
    gia_thue: payload.giaThue,
    tien_coc: payload.tienCoc,
    chu_ky_thanh_toan: payload.chuKyThanhToan,
    ngay_thanh_toan: payload.ngayThanhToan,
    dieu_khoan: payload.dieuKhoan,
    gia_dien: payload.giaDien,
    gia_nuoc: payload.giaNuoc,
    chi_so_dien_ban_dau: payload.chiSoDienBanDau,
    chi_so_nuoc_ban_dau: payload.chiSoNuocBanDau,
    trang_thai: payload.trangThai,
    file_hop_dong: payload.fileHopDong,
  };
}

export async function getAllHopDong(query?: ApiListQuery): Promise<ApiResponse<HopDong[]>> {
  const data = await http.get("/hop_dong", { query: withLimit(query, 100) });
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapHopDongFromBackend);
  }
  return response as ApiResponse<HopDong[]>;
}

export async function getHopDongById(id: string | number): Promise<ApiResponse<HopDong>> {
  const data = await http.get(`/hop_dong/${ensureStringId(id)}`);
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    if (Array.isArray(response.data)) {
        response.data = mapHopDongFromBackend(response.data[0]);
    } else {
        response.data = mapHopDongFromBackend(response.data);
    }
  }
  return response as ApiResponse<HopDong>;
}

export async function createHopDong(payload: HopDongPayload): Promise<ApiResponse<HopDong>> {
  const submitData = mapHopDongToBackend(payload);
  const data = await http.post("/hop_dong", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapHopDongFromBackend(response.data);
  }
  return response as ApiResponse<HopDong>;
}

export async function updateHopDong(
  id: string | number,
  payload: Partial<HopDongPayload>
): Promise<ApiResponse<HopDong>> {
  const submitData = mapHopDongToBackend(payload);
  const data = await http.put(`/hop_dong/${ensureStringId(id)}`, { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapHopDongFromBackend(response.data);
  }
  return response as ApiResponse<HopDong>;
}

export async function deleteHopDong(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete(`/hop_dong/${ensureStringId(id)}`);
  return toApiResponse<null>(data);
}

export const hopDongService = {
  getAllHopDong,
  getHopDongById,
  createHopDong,
  updateHopDong,
  deleteHopDong,
};

