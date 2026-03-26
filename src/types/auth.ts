export type AppRole = "admin" | "chuNha" | "nhanVien" | "tenant";

export type AuthSessionScope = "main" | "tenant";

export interface RegisterPayload {
  ten: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  vaiTro: Exclude<AppRole, "tenant">;
}

export interface LoginPayload {
  email: string;
  matKhau: string;
}

export interface TenantLoginPayload {
  soDienThoai: string;
  matKhau: string;
}

export interface AuthUser {
  _id?: string;
  id?: string;
  ten?: string;
  name?: string;
  email?: string;
  soDienThoai?: string;
  phone?: string;
  vaiTro?: string;
  role?: string;
  avatar?: string;
  anhDaiDien?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: AuthUser;
  khachThue?: AuthUser;
}

export interface TenantDashboardData {
  khachThue?: AuthUser;
  hopDongHienTai?: unknown;
  soHoaDonChuaThanhToan?: number;
  hoaDonGanNhat?: unknown;
}
