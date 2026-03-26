export type PhongId = string;

export interface PhongListParams {
  toaNha?: string;
  trangThai?: string;
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface CreatePhongPayload {
  maPhong: string;
  toaNha: string;
  tang: number;
  dienTich: number;
  giaThue: number;
  tienCoc: number;
  moTa?: string;
  anhPhong?: string[];
  tienNghi?: string[];
  trangThai?: "trong" | "daDat" | "dangThue" | "baoTri";
  soNguoiToiDa?: number;
}

export type UpdatePhongPayload = Partial<CreatePhongPayload>;
