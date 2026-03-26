import type { ApiErrorPayload } from "@/types/api";

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringifyValidationErrors(errors: unknown): string | null {
  if (!isRecord(errors)) {
    return null;
  }

  const pairs = Object.entries(errors)
    .map(([field, value]) => {
      if (Array.isArray(value)) {
        return `${field}: ${value.join(", ")}`;
      }
      return `${field}: ${String(value)}`;
    })
    .filter((item) => item.length > 0);

  if (pairs.length === 0) {
    return null;
  }

  return pairs.join(" | ");
}

export function extractApiErrorMessage(
  payload: unknown,
  fallback = "Co loi xay ra"
): string {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (!isRecord(payload)) {
    return fallback;
  }

  const typedPayload = payload as ApiErrorPayload;

  if (typedPayload.message && String(typedPayload.message).trim().length > 0) {
    return String(typedPayload.message);
  }

  if (typedPayload.error && String(typedPayload.error).trim().length > 0) {
    return String(typedPayload.error);
  }

  const validationMessage = stringifyValidationErrors(typedPayload.errors);
  if (validationMessage) {
    return validationMessage;
  }

  return fallback;
}

export function getErrorMessage(error: unknown, fallback = "Co loi xay ra"): string {
  if (error instanceof ApiRequestError) {
    return extractApiErrorMessage(error.payload, error.message || fallback);
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}
