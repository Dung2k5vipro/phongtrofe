import { clearMainAuthSession, clearTenantAuthSession } from "@/lib/auth-storage";
import { http } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import type {
  AuthResponse,
  AuthSessionScope,
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";
import { toApiResponse } from "@/services/service-utils";

// Backend trả về trực tiếp: { success, message, token, user: { id, email, vai_tro } }
// KHÔNG gói trong field "data" — cần map thủ công sang ApiResponse<AuthResponse>
function toAuthResponse(payload: unknown): ApiResponse<AuthResponse> {
  if (payload && typeof payload === "object") {
    const raw = payload as Record<string, unknown>;
    return {
      success: raw.success === true,
      message: typeof raw.message === "string" ? raw.message : undefined,
      data: {
        token: typeof raw.token === "string" ? raw.token : undefined,
        user: raw.user as AuthResponse["user"],
      },
    };
  }

  return { success: false, message: "Phản hồi không hợp lệ" };
}

/**
 * Đăng nhập - POST /api/nguoi_dung/login
 * Backend nhận: { email, mat_khau }
 * Backend trả:  { success, message, token, user: { id, email, vai_tro } }
 */
export async function login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
  const data = await http.post("/nguoi_dung/login", {
    body: {
      email: payload.email,
      mat_khau: payload.matKhau,
    },
  });
  return toAuthResponse(data);
}

/**
 * Đăng ký tài khoản mới - POST /api/nguoi_dung
 * Backend nhận: { ten, email, mat_khau, so_dien_thoai, vai_tro }
 */
export async function register(payload: RegisterPayload): Promise<ApiResponse<AuthResponse>> {
  const data = await http.post("/nguoi_dung", {
    body: {
      ten: payload.ten,
      email: payload.email,
      mat_khau: payload.matKhau,
      so_dien_thoai: payload.soDienThoai,
      vai_tro: payload.vaiTro,
    },
  });
  return toAuthResponse(data);
}

/**
 * Lấy thông tin người dùng đang đăng nhập - GET /api/nguoi_dung/:id
 * Sử dụng id từ token đã decode (lưu trong localStorage)
 */
export async function getMe(token: string): Promise<ApiResponse<AuthResponse>> {
  const data = await http.get("/nguoi_dung", { token });
  return toAuthResponse(data);
}

export function logoutClientSide(scope: AuthSessionScope = "main"): void {
  if (scope === "tenant") {
    clearTenantAuthSession();
    return;
  }

  clearMainAuthSession();
}

export const authService = {
  register,
  login,
  getMe,
  logoutClientSide,
};
