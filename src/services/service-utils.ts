import { normalizeApiResponse } from "@/lib/http";
import type { ApiResponse } from "@/types/api";

export function toApiResponse<T>(payload: unknown): ApiResponse<T> {
  return normalizeApiResponse<T>(payload);
}

export function ensureStringId(id: string | number): string {
  return String(id).trim();
}

export function withLimit<T extends { limit?: number }>(
  query: T | undefined,
  fallbackLimit = 100
): T & { limit: number } {
  return {
    ...(query ?? ({} as T)),
    limit: Number(query?.limit ?? fallbackLimit),
  };
}
