export interface DiaChi {
  soNha: string;
  duong: string;
  phuong: string;
  quan: string;
  thanhPho: string;
}

export interface AnhCCCD {
  matTruoc: string;
  matSau: string;
}

export interface ThongTinChuyenKhoan {
  nganHang: string;
  soGiaoDich: string;
}

export interface PhiDichVu {
  ten: string;
  gia: number;
}

export interface NguoiDung {
  _id?: string;
  ten: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  vaiTro: "admin" | "chuNha" | "nhanVien";
  anhDaiDien?: string;
  trangThai: "hoatDong" | "khoa";
  ngayTao: string | Date;
  ngayCapNhat: string | Date;
}

export interface ToaNha {
  _id?: string;
  tenToaNha: string;
  diaChi: DiaChi;
  moTa?: string;
  anhToaNha?: string[];
  chuSoHuu?: string;
  tongSoPhong: number;
  tienNghiChung: string[];
  ngayTao?: string | Date;
  ngayCapNhat?: string | Date;
  phongTrong?: number;
  phongDangThue?: number;
}

export interface Phong {
  _id?: string;
  maPhong: string;
  toaNha: string | ToaNha;
  tang: number;
  dienTich: number;
  giaThue: number;
  tienCoc: number;
  moTa?: string;
  anhPhong: string[];
  tienNghi: string[];
  trangThai: "trong" | "daDat" | "dangThue" | "baoTri";
  soNguoiToiDa: number;
  ngayTao?: string | Date;
  ngayCapNhat?: string | Date;
  hopDongHienTai?: {
    _id: string;
    khachThueId: Array<{
      _id: string;
      hoTen: string;
      soDienThoai: string;
    }>;
    nguoiDaiDien?: {
      _id: string;
      hoTen: string;
      soDienThoai: string;
    };
  };
}

export interface KhachThue {
  _id?: string;
  hoTen: string;
  soDienThoai: string;
  email?: string;
  cccd: string;
  ngaySinh: string | Date;
  gioiTinh: "nam" | "nu" | "khac";
  queQuan: string;
  anhCCCD: AnhCCCD;
  ngheNghiep?: string;
  matKhau?: string;
  trangThai: "dangThue" | "daTraPhong" | "chuaThue";
  ngayTao?: string | Date;
  ngayCapNhat?: string | Date;
  hopDongHienTai?: {
    _id: string;
    phong: {
      _id: string;
      maPhong: string;
      toaNha?: {
        _id: string;
        tenToaNha: string;
      };
    };
  };
}

export interface HopDong {
  _id?: string;
  maHopDong: string;
  phong: string | Phong;
  khachThueId: Array<string | KhachThue>;
  nguoiDaiDien: string | KhachThue;
  ngayBatDau: string | Date;
  ngayKetThuc: string | Date;
  giaThue: number;
  tienCoc: number;
  chuKyThanhToan: "thang" | "quy" | "nam";
  ngayThanhToan: number;
  dieuKhoan: string;
  giaDien: number;
  giaNuoc: number;
  chiSoDienBanDau: number;
  chiSoNuocBanDau: number;
  phiDichVu: PhiDichVu[];
  trangThai: "hoatDong" | "hetHan" | "daHuy";
  fileHopDong?: string;
  ngayTao?: string | Date;
  ngayCapNhat?: string | Date;
}

export interface HoaDon {
  _id?: string;
  maHoaDon: string;
  hopDong: string | HopDong;
  phong: string | Phong;
  khachThue: string | KhachThue;
  thang: number;
  nam: number;
  tienPhong: number;
  tienDien: number;
  soDien: number;
  chiSoDienBanDau: number;
  chiSoDienCuoiKy: number;
  tienNuoc: number;
  soNuoc: number;
  chiSoNuocBanDau: number;
  chiSoNuocCuoiKy: number;
  phiDichVu: PhiDichVu[];
  tongTien: number;
  daThanhToan: number;
  conLai: number;
  trangThai: "chuaThanhToan" | "daThanhToanMotPhan" | "daThanhToan" | "quaHan";
  hanThanhToan: string | Date;
  ghiChu?: string;
  anhHoaDon?: string;
  ngayTao?: string | Date;
  ngayCapNhat?: string | Date;
}

export interface ThanhToan {
  _id?: string;
  hoaDon: string | HoaDon;
  soTien: number;
  phuongThuc: "tienMat" | "chuyenKhoan" | "viDienTu";
  thongTinChuyenKhoan?: ThongTinChuyenKhoan;
  ngayThanhToan: string | Date;
  nguoiNhan?: string | NguoiDung;
  ghiChu?: string;
  anhBienLai?: string;
  ngayTao?: string | Date;
}

export interface SuCo {
  _id?: string;
  phong: string | Phong;
  khachThue: string | KhachThue;
  tieuDe: string;
  moTa: string;
  anhSuCo: string[];
  loaiSuCo: "dienNuoc" | "noiThat" | "vesinh" | "anNinh" | "khac";
  mucDoUuTien: "thap" | "trungBinh" | "cao" | "khancap";
  trangThai: "moi" | "dangXuLy" | "daXong" | "daHuy";
  nguoiXuLy?: string | NguoiDung;
  ghiChuXuLy?: string;
  ngayBaoCao: string | Date;
  ngayXuLy?: string | Date;
  ngayHoanThanh?: string | Date;
  ngayTao?: string | Date;
  ngayCapNhat?: string | Date;
}

export interface ThongBao {
  _id?: string;
  tieuDe: string;
  noiDung: string;
  loai: "chung" | "hoaDon" | "suCo" | "hopDong" | "khac";
  nguoiGui?: string | NguoiDung;
  nguoiNhan?: Array<string | KhachThue | NguoiDung>;
  phong?: Array<string | Phong>;
  toaNha?: string | ToaNha;
  daDoc?: string[];
  ngayGui: string | Date;
  ngayTao?: string | Date;
}

export interface DashboardStats {
  tongSoPhong: number;
  phongTrong: number;
  phongDangThue: number;
  phongBaoTri: number;
  doanhThuThang: number;
  doanhThuNam: number;
  hoaDonSapDenHan: number;
  suCoCanXuLy: number;
  hopDongSapHetHan: number;
}

export * from "./api";
export * from "./auth";
export * from "./phong";
