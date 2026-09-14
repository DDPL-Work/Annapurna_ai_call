import type { AuthTokens, ApiError } from "./types";

// ─── Token Storage ────────────────────────────────────────────────────────────

const ACCESS_TOKEN_KEY = "annapurna_access_token";
const REFRESH_TOKEN_KEY = "annapurna_refresh_token";

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens): void {
  if (!tokens.access || !tokens.refresh) {
    throw new Error("Cannot store incomplete authentication tokens");
  }

  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
  } catch {
    // localStorage unavailable — silently fail
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // silently fail
  }
}

// ─── Refresh Queue ────────────────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processRefreshQueue(error: unknown, token?: string): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
}

// ─── Base URL ─────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  // In development, Vite proxy handles /api prefix
  return "";
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Internal guard: a retried request must never start another refresh loop. */
  skipAuthRefresh?: boolean;
}

function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const base = getBaseUrl();
  const url = new URL(`${base}${endpoint}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value != null && value !== "") {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }
    return response.json();
  }

  const errorBody = await response.json().catch(() => ({}));

  const backendError = isRecord(errorBody.error) ? errorBody.error : errorBody;
  const detail = backendError.detail;
  const apiError: ApiError = {
    status: response.status,
    message:
      getErrorMessage(detail) ||
      getErrorMessage(backendError.message) ||
      getErrorMessage(errorBody.non_field_errors) ||
      `Request failed with status ${response.status}`,
    errors: extractFieldErrors(detail) || extractFieldErrors(backendError),
  };

  throw apiError;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getErrorMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  if (isRecord(value)) {
    for (const fieldError of Object.values(value)) {
      const message = getErrorMessage(fieldError);
      if (message) return message;
    }
  }
  return undefined;
}

function extractFieldErrors(
  body: unknown
): Record<string, string[]> | undefined {
  if (!isRecord(body)) return undefined;
  const errors: Record<string, string[]> = {};
  let hasErrors = false;

  Object.entries(body).forEach(([key, value]) => {
    if (Array.isArray(value) && typeof value[0] === "string") {
      errors[key] = value;
      hasErrors = true;
    }
  });

  return hasErrors ? errors : undefined;
}

// ─── Token Refresh Logic ──────────────────────────────────────────────────────

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${getBaseUrl()}/api/v1/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Token refresh failed");
  }

  const data = await response.json();
  const newAccessToken: string = data.access;

  // Update stored access token
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
  } catch {
    // silently fail
  }

  // If backend rotates refresh tokens
  if (data.refresh) {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
    } catch {
      // silently fail
    }
  }

  return newAccessToken;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export class ApiClientError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, skipAuthRefresh = false, ...fetchOptions } = options;

  const url = buildUrl(endpoint, params);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Remove Content-Type for FormData
  if (fetchOptions.body instanceof FormData) {
    delete headers["Content-Type"];
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 — attempt token refresh
    if (response.status === 401) {
      // Login failures and other public endpoint errors are not expired
      // sessions and must be returned to their caller unchanged.
      if (skipAuthRefresh || endpoint.startsWith("/api/v1/auth/")) {
        return handleResponse<T>(response);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<T>((resolve, reject) => {
          failedQueue.push({
            resolve: resolve as (value: unknown) => void,
            reject,
          });
        }).then((newToken) => {
          return apiRequest<T>(endpoint, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${newToken as string}`,
            },
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processRefreshQueue(undefined, newToken);

        // Retry original request with new token
        return apiRequest<T>(endpoint, {
          ...options,
          skipAuthRefresh: true,
          headers: {
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
        });
      } catch (refreshError) {
        processRefreshQueue(refreshError);
        clearTokens();
        window.location.href = "/login";
        throw new ApiClientError(401, "Session expired. Please log in again.");
      } finally {
        isRefreshing = false;
        failedQueue = [];
      }
    }

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network error
    throw new ApiClientError(
      0,
      "Network error. Please check your connection and try again."
    );
  }
}

// ─── Convenience Methods ──────────────────────────────────────────────────────

export function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<T> {
  return apiRequest<T>(endpoint, { method: "GET", params });
}

export function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete<T = void>(
  endpoint: string
): Promise<T> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}
