export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: ApiValidationErrors;
  pagination?: PaginationMeta;
}

export interface ApiValidationErrors {
  [field: string]: string | string[];
}

export interface ApiErrorPayload {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: ApiValidationErrors;
  data?: unknown;
}

export interface ApiListQuery {
  page?: number;
  limit?: number;
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: PaginationMeta;
}
