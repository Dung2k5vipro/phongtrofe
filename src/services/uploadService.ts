import { ApiRequestError, extractApiErrorMessage } from "@/lib/api-error";
import { buildApiUrl } from "@/lib/api-config";
import { parseJsonSafely } from "@/lib/http";
import type { ApiResponse } from "@/types/api";
import { toApiResponse } from "@/services/service-utils";

export interface UploadPayload {
  url?: string;
  secure_url?: string;
  [key: string]: unknown;
}

async function uploadSingle(file: File): Promise<ApiResponse<UploadPayload>> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(buildApiUrl("/upload"), {
    method: "POST",
    body: formData,
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    const message = extractApiErrorMessage(payload, "Upload that bai");
    throw new ApiRequestError(message, response.status, payload);
  }

  return toApiResponse<UploadPayload>(payload);
}

export async function uploadImage(file: File): Promise<ApiResponse<UploadPayload>> {
  return uploadSingle(file);
}

export async function uploadManyImages(files: File[]): Promise<ApiResponse<string[]>> {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const result = await uploadSingle(file);
    const url = result.data?.secure_url ?? result.data?.url;
    if (url) {
      uploadedUrls.push(url);
    }
  }

  return {
    success: true,
    data: uploadedUrls,
  };
}

export const uploadService = {
  uploadImage,
  uploadManyImages,
};
