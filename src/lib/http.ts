import { ApiRequestError, extractApiErrorMessage } from "@/lib/api-error";
import { buildApiUrl, createQueryString, type QueryParams } from "@/lib/api-config";
import type { ApiResponse } from "@/types/api";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type PrimitiveBody = string | number | boolean | null;

export type JsonBody = PrimitiveBody | Record<string, unknown> | Array<unknown>;

export interface HttpRequestOptions<TBody = JsonBody> {
  query?: QueryParams;
  headers?: HeadersInit;
  body?: TBody;
  token?: string | null;
  signal?: AbortSignal;
  cache?: RequestCache;
  credentials?: RequestCredentials;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function parseJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function normalizeHeaders(headers?: HeadersInit): Headers {
  return new Headers(headers ?? {});
}

function buildRequestBody(body: unknown, headers: Headers): BodyInit | undefined {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

function buildRequestUrl(path: string, query?: QueryParams): string {
  const baseUrl = buildApiUrl(path);
  const queryString = createQueryString(query);
  return `${baseUrl}${queryString}`;
}

import { getMainAccessToken } from "@/lib/auth-storage";

export async function request<TResponse = unknown, TBody = JsonBody>(
  method: HttpMethod,
  path: string,
  options: HttpRequestOptions<TBody> = {}
): Promise<TResponse> {
  const headers = normalizeHeaders(options.headers);

  // Tự động lấy token từ localStorage nếu không được truyền vào thủ công
  const token = options.token ?? getMainAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildRequestUrl(path, options.query), {
    method,
    headers,
    body: buildRequestBody(options.body, headers),
    signal: options.signal,
    cache: options.cache,
    credentials: options.credentials,
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const fallbackMessage = `Yeu cau that bai (${response.status})`;
    const message = extractApiErrorMessage(payload, fallbackMessage);
    throw new ApiRequestError(message, response.status, payload);
  }

  return payload as TResponse;
}

export function normalizeApiResponse<TData = unknown>(payload: unknown): ApiResponse<TData> {
  if (isRecord(payload)) {
    // Nếu payload có dấu hiệu chuẩn wrapper API { success, data, message, error }
    if ('success' in payload || 'data' in payload || 'error' in payload || 'message' in payload) {
      return {
        success: typeof payload.success === "boolean" ? payload.success : true,
        message: typeof payload.message === "string" ? payload.message : undefined,
        data: ('data' in payload ? payload.data : payload) as TData, // Lấy payload làm data nếu .data không tồn tại
        error: typeof payload.error === "string" ? payload.error : undefined,
      };
    }

    // Nếu API trả về nguyên 1 Object dữ liệu (ví dụ Insert return {...})
    return {
      success: true,
      data: payload as TData,
    };
  }

  // Nếu API trả về Array (Danh sách) hoặc giá trị nguyên thủy (String success message)
  return {
    success: true,
    data: payload as TData,
  };
}

export const http = {
  get: <TResponse = unknown>(path: string, options?: Omit<HttpRequestOptions, "body">) =>
    request<TResponse>("GET", path, options),
  post: <TResponse = unknown, TBody = JsonBody>(
    path: string,
    options?: HttpRequestOptions<TBody>
  ) => request<TResponse, TBody>("POST", path, options),
  put: <TResponse = unknown, TBody = JsonBody>(
    path: string,
    options?: HttpRequestOptions<TBody>
  ) => request<TResponse, TBody>("PUT", path, options),
  patch: <TResponse = unknown, TBody = JsonBody>(
    path: string,
    options?: HttpRequestOptions<TBody>
  ) => request<TResponse, TBody>("PATCH", path, options),
  delete: <TResponse = unknown>(path: string, options?: Omit<HttpRequestOptions, "body">) =>
    request<TResponse>("DELETE", path, options),
};
