import { http } from "@/lib/http";
import type { ApiListQuery, ApiResponse } from "@/types/api";
import type { HoaDon, HopDong, KhachThue, Phong } from "@/types";
import { ensureStringId, toApiResponse, withLimit } from "@/services/service-utils";
import { getEntityId, isObjectEntity, normalizeEntity, normalizeEntityList, toCamelDeep } from "@/lib/entity";

export interface HoaDonFormData {
  hopDongList: HopDong[];
  phongList: Phong[];
  khachThueList: KhachThue[];
}

export interface LatestReadingData {
  chiSoDienBanDau?: number;
  chiSoNuocBanDau?: number;
}

export type HoaDonPayload = Partial<HoaDon> & {
  hopDong: string;
  phong: string;
  khachThue: string;
  thang: number;
  nam: number;
};

function mapPhongFromFormData(raw: any): Phong {
  const camel = toCamelDeep(raw ?? {});
  const toaNhaValueRaw = camel.toaNha ?? camel.toaNhaId ?? '';
  const toaNhaValue = isObjectEntity(toaNhaValueRaw) ? normalizeEntity(toaNhaValueRaw) : toaNhaValueRaw;

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
  };
}

function mapKhachThueFromFormData(raw: any): KhachThue {
  const camel = toCamelDeep(raw ?? {});
  return {
    ...camel,
    _id: getEntityId(camel) || '',
    hoTen: camel.hoTen || '',
    soDienThoai: camel.soDienThoai || '',
    ngaySinh: camel.ngaySinh || '',
    gioiTinh: camel.gioiTinh || 'khac',
    queQuan: camel.queQuan || '',
    anhCCCD: {
      matTruoc: camel.anhCccdTruoc || camel?.anhCCCD?.matTruoc || '',
      matSau: camel.anhCccdSau || camel?.anhCCCD?.matSau || '',
    },
    trangThai: camel.trangThai || 'chuaThue',
    ngayTao: camel.ngayTao,
  };
}

function mapHopDongFromFormData(raw: any): HopDong {
  const camel = toCamelDeep(raw ?? {});
  const phongRaw = camel.phong ?? camel.phongId ?? '';
  const phongValue = isObjectEntity(phongRaw) ? normalizeEntity(phongRaw) : phongRaw;

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
    khachThueId: normalizeEntityList(camel.khachThueId ?? camel.khachThue ?? []),
    phiDichVu: camel.phiDichVu || [],
    chuKyThanhToan: camel.chuKyThanhToan || 'thang',
    ngayThanhToan: Number(camel.ngayThanhToan ?? 0),
    dieuKhoan: camel.dieuKhoan || '',
    giaDien: Number(camel.giaDien ?? 0),
    giaNuoc: Number(camel.giaNuoc ?? 0),
    chiSoDienBanDau: Number(camel.chiSoDienBanDau ?? 0),
    chiSoNuocBanDau: Number(camel.chiSoNuocBanDau ?? 0),
    trangThai: camel.trangThai || 'hoatDong',
    fileHopDong: camel.fileHopDong,
  };
}

function mapHoaDonFromBackend(raw: any): HoaDon {
  const camel = toCamelDeep(raw ?? {});
  const hopDongRaw = camel.hopDong ?? camel.hopDongId ?? '';
  const phongRaw = camel.phong ?? camel.phongId ?? '';
  const khachThueRaw = camel.khachThue ?? camel.khachThueId ?? '';

  const hopDongValue = isObjectEntity(hopDongRaw) ? normalizeEntity(hopDongRaw) : hopDongRaw;
  const phongValue = isObjectEntity(phongRaw) ? normalizeEntity(phongRaw) : phongRaw;
  const khachThueValue = isObjectEntity(khachThueRaw) ? normalizeEntity(khachThueRaw) : khachThueRaw;

  if (isObjectEntity(hopDongValue)) {
    const hopDongPhong = hopDongValue.phong ?? hopDongValue.phongId ?? '';
    hopDongValue.phong = isObjectEntity(hopDongPhong) ? normalizeEntity(hopDongPhong) : hopDongPhong;
    hopDongValue.khachThueId = normalizeEntityList(hopDongValue.khachThueId ?? hopDongValue.khachThue ?? []);
    hopDongValue.nguoiDaiDien = normalizeEntity(hopDongValue.nguoiDaiDien);
  }

  if (isObjectEntity(phongValue)) {
    const toaNhaRaw = phongValue.toaNha ?? phongValue.toaNhaId ?? '';
    phongValue.toaNha = isObjectEntity(toaNhaRaw) ? normalizeEntity(toaNhaRaw) : toaNhaRaw;
  }

  return {
    ...camel,
    _id: getEntityId(camel) || '',
    maHoaDon: camel.maHoaDon || '',
    hopDong: hopDongValue,
    phong: phongValue,
    khachThue: khachThueValue,
    thang: Number(camel.thang ?? 1),
    nam: Number(camel.nam ?? new Date().getFullYear()),
    tienPhong: Number(camel.tienPhong ?? 0),
    tienDien: Number(camel.tienDien ?? 0),
    soDien: Number(camel.soDien ?? 0),
    chiSoDienBanDau: Number(camel.chiSoDienBanDau ?? 0),
    chiSoDienCuoiKy: Number(camel.chiSoDienCuoiKy ?? 0),
    tienNuoc: Number(camel.tienNuoc ?? 0),
    soNuoc: Number(camel.soNuoc ?? 0),
    chiSoNuocBanDau: Number(camel.chiSoNuocBanDau ?? 0),
    chiSoNuocCuoiKy: Number(camel.chiSoNuocCuoiKy ?? 0),
    tongTien: Number(camel.tongTien ?? 0),
    daThanhToan: Number(camel.daThanhToan ?? 0),
    conLai: Number(camel.conLai ?? 0),
    trangThai: camel.trangThai || 'chuaThanhToan',
    hanThanhToan: camel.hanThanhToan,
    ngayTao: camel.ngayTao,
    phiDichVu: camel.phiDichVu || [],
  };
}

function mapHoaDonToBackend(payload: any): any {
  return {
    ma_hoa_don: payload.maHoaDon,
    hop_dong_id: getEntityId(payload.hopDong),
    phong_id: getEntityId(payload.phong),
    khach_thue_id: getEntityId(payload.khachThue),
    thang: payload.thang,
    nam: payload.nam,
    tien_phong: payload.tienPhong,
    tien_dien: payload.tienDien,
    so_dien: payload.soDien,
    chi_so_dien_dau: payload.chiSoDienBanDau,
    chi_so_dien_cuoi: payload.chiSoDienCuoiKy,
    tien_nuoc: payload.tienNuoc,
    so_nuoc: payload.soNuoc,
    chi_so_nuoc_dau: payload.chiSoNuocBanDau,
    chi_so_nuoc_cuoi: payload.chiSoNuocCuoiKy,
    tong_tien: payload.tongTien,
    da_thanh_toan: payload.daThanhToan,
    con_lai: payload.conLai,
    trang_thai: payload.trangThai,
    han_thanh_toan: payload.hanThanhToan,
    ghi_chu: payload.ghiChu,
    anh_hoa_don: payload.anhHoaDon,
  };
}

export async function getAllHoaDon(query?: ApiListQuery): Promise<ApiResponse<HoaDon[]>> {
  const data = await http.get("/hoa_don", { query: withLimit(query, 100) });
  const response = toApiResponse<any[]>(data);
  if (response.success && Array.isArray(response.data)) {
    response.data = response.data.map(mapHoaDonFromBackend);
  }
  return response as ApiResponse<HoaDon[]>;
}

export async function getHoaDonById(id: string | number): Promise<ApiResponse<HoaDon>> {
  const data = await http.get("/hoa_don", { query: { id: ensureStringId(id) } });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    if (Array.isArray(response.data)) {
        response.data = mapHoaDonFromBackend(response.data[0]);
    } else {
        response.data = mapHoaDonFromBackend(response.data);
    }
  }
  return response as ApiResponse<HoaDon>;
}

export async function createHoaDon(payload: HoaDonPayload): Promise<ApiResponse<HoaDon>> {
  const submitData = mapHoaDonToBackend(payload);
  const data = await http.post("/hoa_don", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapHoaDonFromBackend(response.data);
  }
  return response as ApiResponse<HoaDon>;
}

export async function updateHoaDon(payload: Partial<HoaDonPayload>): Promise<ApiResponse<HoaDon>> {
  const submitData = mapHoaDonToBackend(payload);
  const data = await http.put("/hoa_don", { body: submitData });
  const response = toApiResponse<any>(data);
  if (response.success && response.data) {
    response.data = mapHoaDonFromBackend(response.data);
  }
  return response as ApiResponse<HoaDon>;
}

export async function deleteHoaDon(id: string | number): Promise<ApiResponse<null>> {
  const data = await http.delete("/hoa_don", { query: { id: ensureStringId(id) } });
  return toApiResponse<null>(data);
}

export async function getHoaDonFormData(): Promise<ApiResponse<HoaDonFormData>> {
  const data = await http.get("/hoa_don/form-data");
  const response = toApiResponse<HoaDonFormData>(data);
  if (response.success && response.data) {
    response.data = {
      hopDongList: Array.isArray(response.data.hopDongList)
        ? response.data.hopDongList.map(mapHopDongFromFormData)
        : [],
      phongList: Array.isArray(response.data.phongList)
        ? response.data.phongList.map(mapPhongFromFormData)
        : [],
      khachThueList: Array.isArray(response.data.khachThueList)
        ? response.data.khachThueList.map(mapKhachThueFromFormData)
        : [],
    };
  }
  return response;
}

export async function getLatestReading(params: {
  hopDong: string;
  thang: number;
  nam: number;
}): Promise<ApiResponse<LatestReadingData>> {
  const data = await http.get("/hoa_don/latest-reading", {
    query: {
      hopDong: params.hopDong,
      thang: params.thang,
      nam: params.nam,
    },
  });
  return toApiResponse<LatestReadingData>(data);
}

export async function autoCreateHoaDon(): Promise<ApiResponse<{ createdInvoices: number; errors: string[] }>> {
  const data = await http.post("/auto_invoice");
  return toApiResponse<{ createdInvoices: number; errors: string[] }>(data);
}

export const hoaDonService = {
  getAllHoaDon,
  getHoaDonById,
  createHoaDon,
  updateHoaDon,
  deleteHoaDon,
  getHoaDonFormData,
  getLatestReading,
  autoCreateHoaDon,
};




