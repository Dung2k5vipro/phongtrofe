import type { AuthResponse, AuthUser } from "@/types/auth";

const MAIN_TOKEN_KEY = "appAccessToken";
const MAIN_USER_KEY = "appAuthUser";
const TENANT_TOKEN_KEY = "khachThueToken";
const TENANT_USER_KEY = "khachThueData";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readJson<T>(key: string): T | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

export function getMainAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(MAIN_TOKEN_KEY);
}

export function getTenantAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return localStorage.getItem(TENANT_TOKEN_KEY);
}

export function getMainUser(): AuthUser | null {
  return readJson<AuthUser>(MAIN_USER_KEY);
}

export function getTenantUser(): AuthUser | null {
  return readJson<AuthUser>(TENANT_USER_KEY);
}

export function saveMainAuthSession(auth: AuthResponse): void {
  if (!isBrowser()) {
    return;
  }

  const token = auth.accessToken ?? auth.token;
  if (token) {
    localStorage.setItem(MAIN_TOKEN_KEY, token);
  }

  if (auth.user) {
    writeJson(MAIN_USER_KEY, auth.user);
  }
}

export function saveTenantAuthSession(auth: AuthResponse): void {
  if (!isBrowser()) {
    return;
  }

  const token = auth.accessToken ?? auth.token;
  if (token) {
    localStorage.setItem(TENANT_TOKEN_KEY, token);
  }

  const tenant = auth.khachThue ?? auth.user;
  if (tenant) {
    writeJson(TENANT_USER_KEY, tenant);
  }
}

export function clearMainAuthSession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(MAIN_TOKEN_KEY);
  localStorage.removeItem(MAIN_USER_KEY);
}

export function clearTenantAuthSession(): void {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(TENANT_TOKEN_KEY);
  localStorage.removeItem(TENANT_USER_KEY);
}

export function clearAllAuthSessions(): void {
  clearMainAuthSession();
  clearTenantAuthSession();
}
