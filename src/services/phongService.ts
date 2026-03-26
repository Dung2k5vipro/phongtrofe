import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type { Phong } from "@/types";
import type { CreatePhongPayload, PhongListParams, UpdatePhongPayload } from "@/types/phong";
import { ensureStringId, toApiResponse, withLimit } from "@/services/service-utils";
import { getEntityId, isObjectEntity, normalizeEntity, normalizeEntityList, toCamelDeep } from "@/lib/entity";

function mapPhongFromBackend(raw: any): Phong {
  const camel = toCamelDeep(raw ?? {});
  const toaNhaValueRaw = camel.toaNha ?? camel.toaNhaId ?? '';
  const toaNhaValue = isObjectEntity(toaNhaValueRaw) ? normalizeEntity(toaNhaValueRaw) : toaNhaValueRaw;
  const hopDongRaw = camel.hopDongHienTai ?? camel.hopDongHienTai ?? camel.hopDong_hien_tai;
  const hopDongHienTai = isObjectEntity(hopDongRaw) ? normalizeEntity(hopDongRaw) : hopDongRaw;

  if (isObjectEntity(hopDongHienTai)) {
    const khachThueList = hopDongHienTai.khachThueId ?? hopDongHienTai.khachThue ?? [];
    hopDongHienTai.khachThueId = normalizeEntityList(khachThueList);
    hopDongHienTai.nguoiDaiDien = normalizeEntity(hopDongHienTai.nguoiDaiDien);
  }

  return {
    ...camel,
    _id: getEntityId(camel) || '',
    maPhong: camel.maPhong || '',
    toaNha: toaNhaValue,
    tang: Number(camel.tang ?? 0),
    dienTich: Number(camel.dienTich ?? 0),
    giaThue: Number(camel.giaThue ?? 0),
    tienCoc: Number(camel.tienCoc ?? 0),
    moTa: camel.moTa || '',
    trangThai: camel.trangThai || 'trong',
    ngayTao: camel.ngayTao,
    anhPhong: camel.anhPhong || [],
    tienNghi: camel.tienNghi || [],
    soNguoiToiDa: Number(camel.soNguoiToiDa ?? 0),
    hopDongHienTai: hopDongHienTai,
  };
}

function mapPhongToBackend(payload: any): any {
  return {
    ma_phong: payload.maPhong,
    toa_nha_id: getEntityId(payload.toaNha),
    tang: payload.tang,
    dien_tich: payload.dienTich,
    gia_thue: payload.giaThue,
    tien_coc: payload.tienCoc,
    mo_ta: payload.moTa || '',
    trang_thai: payload.trangThai,
    so_nguoi_toi_da: payload.soNguoiToiDa,
  };
}

export async function getAllPhong(
  params?: PhongListParams
): Promise<ApiResponse<Phong[]>> {
  const data = await http.get("/phong", { query: withLimit(params, 100) });
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapPhongFromBackend);
  }
  return response as ApiResponse<Phong[]>;
}

export async function getPhongById(id: string | number): Promise<ApiResponse<Phong>> {
  const data = await http.get(`/phong/${ensureStringId(id)}`);
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    if (Array.isArray(response.data)) {
        response.data = mapPhongFromBackend(response.data[0]);
    } else {
        response.data = mapPhongFromBackend(response.data);
    }
  }
  return response as ApiResponse<Phong>;
}

export async function createPhong(
  payload: CreatePhongPayload
): Promise<ApiResponse<Phong>> {
  const submitData = mapPhongToBackend(payload);
  const data = await http.post("/phong", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapPhongFromBackend(response.data);
  }
  return response as ApiResponse<Phong>;
}

export async function updatePhong(
  id: string | number,
  payload: UpdatePhongPayload
): Promise<ApiResponse<Phong>> {
  const submitData = mapPhongToBackend(payload);
  const data = await http.put(`/phong/${ensureStringId(id)}`, { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapPhongFromBackend(response.data);
  }
  return response as ApiResponse<Phong>;
}

export async function deletePhong(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete(`/phong/${ensureStringId(id)}`);
  return toApiResponse<null>(data);
}

export async function getPublicPhong(
  params?: PhongListParams
): Promise<ApiResponse<Phong[]>> {
  try {
    const data = await http.get("/phong_public", { query: withLimit(params, 100) });
    const response = toApiResponse<any[]>(data);
    if (response.success && Array.isArray(response.data)) {
      response.data = response.data.map(mapPhongFromBackend);
    }
    return response as ApiResponse<Phong[]>;
  } catch {
    return getAllPhong(params);
  }
}

// Backward-compatible aliases for old code paths.
export const getRooms = async (): Promise<Phong[]> => {
  const result = await getAllPhong();
  return result.data ?? [];
};

export const getRoomById = async (id: string | number): Promise<Phong | null> => {
  const result = await getPhongById(id);
  return result.data ?? null;
};

export const createRoom = createPhong;
export const updateRoom = updatePhong;
export const deleteRoom = deletePhong;

export const phongService = {
  getAllPhong,
  getPhongById,
  createPhong,
  updatePhong,
  deletePhong,
  getPublicPhong,
};

