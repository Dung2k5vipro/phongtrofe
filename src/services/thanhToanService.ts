import { http } from "@/lib/http";
import type { ApiListQuery, ApiResponse } from "@/types/api";
import type { ThanhToan } from "@/types";
import { ensureStringId, toApiResponse, withLimit } from "@/services/service-utils";
import { getEntityId, isObjectEntity, normalizeEntity, toCamelDeep } from "@/lib/entity";

export type ThanhToanPayload = Partial<ThanhToan> & {
  hoaDon: string;
  soTien: number;
  phuongThuc: "tienMat" | "chuyenKhoan" | "viDienTu";
  ngayThanhToan: string;
};

function mapThanhToanFromBackend(raw: any): ThanhToan {
  const camel = toCamelDeep(raw ?? {});
  const hoaDonRaw = camel.hoaDon ?? camel.hoaDonId ?? '';
  const hoaDonValue = isObjectEntity(hoaDonRaw) ? normalizeEntity(hoaDonRaw) : hoaDonRaw;

  if (isObjectEntity(hoaDonValue)) {
    const phongRaw = hoaDonValue.phong ?? hoaDonValue.phongId ?? '';
    const khachThueRaw = hoaDonValue.khachThue ?? hoaDonValue.khachThueId ?? '';
    const hopDongRaw = hoaDonValue.hopDong ?? hoaDonValue.hopDongId ?? '';
    hoaDonValue.phong = isObjectEntity(phongRaw) ? normalizeEntity(phongRaw) : phongRaw;
    hoaDonValue.khachThue = isObjectEntity(khachThueRaw) ? normalizeEntity(khachThueRaw) : khachThueRaw;
    hoaDonValue.hopDong = isObjectEntity(hopDongRaw) ? normalizeEntity(hopDongRaw) : hopDongRaw;
  }

  return {
    ...camel,
    _id: getEntityId(camel) || '',
    hoaDon: hoaDonValue,
    soTien: Number(camel.soTien ?? 0),
    phuongThuc: camel.phuongThuc || 'tienMat',
    thongTinChuyenKhoan: {
      nganHang: camel.nganHang || camel?.thongTinChuyenKhoan?.nganHang || '',
      soGiaoDich: camel.soGiaoDich || camel?.thongTinChuyenKhoan?.soGiaoDich || ''
    },
    ngayThanhToan: camel.ngayThanhToan || '',
    nguoiNhan: camel.nguoiNhan,
    ghiChu: camel.ghiChu,
    anhBienLai: camel.anhBienLai,
    ngayTao: camel.ngayTao,
  };
}

function mapThanhToanToBackend(payload: any): any {
  return {
    hoa_don_id: getEntityId(payload.hoaDon),
    so_tien: payload.soTien,
    phuong_thuc: payload.phuongThuc,
    ngan_hang: payload.thongTinChuyenKhoan?.nganHang,
    so_giao_dich: payload.thongTinChuyenKhoan?.soGiaoDich,
    ngay_thanh_toan: payload.ngayThanhToan,
    nguoi_nhan: getEntityId(payload.nguoiNhan),
    ghi_chu: payload.ghiChu,
    anh_bien_lai: payload.anhBienLai,
  };
}

export async function getAllThanhToan(
  query?: ApiListQuery
): Promise<ApiResponse<ThanhToan[]>> {
  const data = await http.get("/thanh_toan", { query: withLimit(query, 100) });
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapThanhToanFromBackend);
  }
  return response as ApiResponse<ThanhToan[]>;
}

export async function createThanhToan(
  payload: ThanhToanPayload
): Promise<ApiResponse<ThanhToan>> {
  const submitData = mapThanhToanToBackend(payload);
  const data = await http.post("/thanh_toan", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapThanhToanFromBackend(response.data);
  }
  return response as ApiResponse<ThanhToan>;
}

export async function updateThanhToan(
  id: string | number,
  payload: Partial<ThanhToanPayload>
): Promise<ApiResponse<ThanhToan>> {
  const submitData = mapThanhToanToBackend(payload);
  const data = await http.put(`/thanh_toan/${ensureStringId(id)}`, { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapThanhToanFromBackend(response.data);
  }
  return response as ApiResponse<ThanhToan>;
}

export async function deleteThanhToan(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete(`/thanh_toan/${ensureStringId(id)}`);
  return toApiResponse<null>(data);
}

export async function testPaymentApi(): Promise<ApiResponse<unknown>> {
  const data = await http.get("/test_payment");
  return toApiResponse<unknown>(data);
}

export const thanhToanService = {
  getAllThanhToan,
  createThanhToan,
  updateThanhToan,
  deleteThanhToan,
  testPaymentApi,
};

