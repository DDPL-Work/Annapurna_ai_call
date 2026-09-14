import { ApiClientError, apiPost, apiGet, setTokens, clearTokens } from "./client";
import type {
  LoginRequest,
  SignupRequest,
  AuthTokens,
  AuthTokenResponse,
  User,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest,
} from "./types";

export const authApi = {
  async login(data: LoginRequest): Promise<AuthTokens> {
    const response = await apiPost<AuthTokenResponse>("/api/v1/auth/login/", data);
    return getAuthTokens(response);
  },

  async signup(data: SignupRequest): Promise<AuthTokens> {
    const response = await apiPost<AuthTokenResponse>("/api/v1/auth/signup/", data);
    return getAuthTokens(response);
  },

  refresh(refreshToken: string): Promise<{ access: string; refresh?: string }> {
    return apiPost("/api/v1/auth/refresh/", { refresh: refreshToken });
  },

  logout(refreshToken: string): Promise<void> {
    return apiPost<void>("/api/v1/auth/logout/", { refresh: refreshToken });
  },

  getMe(): Promise<User> {
    return apiGet<User>("/api/v1/me/");
  },

  changePassword(data: ChangePasswordRequest): Promise<{ detail: string }> {
    return apiPost<{ detail: string }>("/api/v1/auth/change-password/", data);
  },

  resetPassword(data: ResetPasswordRequest): Promise<{ detail: string }> {
    return apiPost<{ detail: string }>("/api/v1/auth/reset-password/", data);
  },

  resetPasswordConfirm(
    data: ResetPasswordConfirmRequest
  ): Promise<{ detail: string }> {
    return apiPost<{ detail: string }>(
      "/api/v1/auth/reset-password/confirm/",
      data
    );
  },

  // Helper: store tokens after login/signup
  handleAuthSuccess(tokens: AuthTokens): void {
    setTokens(tokens);
  },

  // Helper: clear everything on logout
  handleLogout(): void {
    clearTokens();
  },
};

function getAuthTokens(response: AuthTokenResponse): AuthTokens {
  const source = response.tokens ?? response;
  const access = source.access ?? source.access_token;
  const refresh = source.refresh ?? source.refresh_token;

  if (!access || !refresh) {
    throw new ApiClientError(
      500,
      "The login response did not include both access and refresh tokens."
    );
  }

  return { access, refresh };
}
