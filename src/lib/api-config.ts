export const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const API_BASE_URL = (rawApiBaseUrl && rawApiBaseUrl.length > 0
  ? rawApiBaseUrl
  : DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

export type QueryValue = string | number | boolean | null | undefined;

export type QueryParams = Record<string, QueryValue | QueryValue[]>;

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  return `${API_BASE_URL}/${normalizedPath}`;
}

export function createQueryString(params?: QueryParams): string {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined && `${item}`.length > 0) {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    if (value !== null && value !== undefined && `${value}`.length > 0) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
