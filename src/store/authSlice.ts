import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../lib/api";
import type {
  User,
  LoginRequest,
  SignupRequest,
  ChangePasswordRequest,
  ResetPasswordRequest,
  ResetPasswordConfirmRequest,
  ApiError,
} from "../lib/api/types";
import { getAccessToken, getRefreshToken } from "../lib/api/client";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const login = createAsyncThunk<
  User,
  LoginRequest,
  { rejectValue: ApiError }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const tokens = await authApi.login(credentials);
    authApi.handleAuthSuccess(tokens);
    const user = await authApi.getMe();
    return user;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const signup = createAsyncThunk<
  User,
  SignupRequest,
  { rejectValue: ApiError }
>("auth/signup", async (data, { rejectWithValue }) => {
  try {
    const tokens = await authApi.signup(data);
    authApi.handleAuthSuccess(tokens);
    const user = await authApi.getMe();
    return user;
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchMe = createAsyncThunk<
  User,
  void,
  { rejectValue: ApiError }
>("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    return await authApi.getMe();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const logout = createAsyncThunk<
  void,
  void,
  { rejectValue: ApiError }
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    // Attempt server-side logout (blacklist refresh token)
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      await authApi.logout(refreshToken);
    }
  } catch {
    // Even if server logout fails, clear local tokens
  } finally {
    authApi.handleLogout();
  }
});

export const changePassword = createAsyncThunk<
  { detail: string },
  ChangePasswordRequest,
  { rejectValue: ApiError }
>("auth/changePassword", async (data, { rejectWithValue }) => {
  try {
    return await authApi.changePassword(data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const resetPassword = createAsyncThunk<
  { detail: string },
  ResetPasswordRequest,
  { rejectValue: ApiError }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  try {
    return await authApi.resetPassword(data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const resetPasswordConfirm = createAsyncThunk<
  { detail: string },
  ResetPasswordConfirmRequest,
  { rejectValue: ApiError }
>("auth/resetPasswordConfirm", async (data, { rejectWithValue }) => {
  try {
    return await authApi.resetPasswordConfirm(data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]> | null;
  passwordResetSent: boolean;
  passwordResetConfirmSuccess: boolean;
  changePasswordSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: !!getAccessToken(),
  isInitializing: !!getAccessToken(),
  isLoading: false,
  error: null,
  fieldErrors: null,
  passwordResetSent: false,
  passwordResetConfirmSuccess: false,
  changePasswordSuccess: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
      state.fieldErrors = null;
    },
    clearPasswordResetState(state) {
      state.passwordResetSent = false;
      state.passwordResetConfirmSuccess = false;
      state.error = null;
    },
    clearChangePasswordState(state) {
      state.changePasswordSuccess = false;
      state.error = null;
      state.fieldErrors = null;
    },
  },
  extraReducers: (builder) => {
    // ── Login ──
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        if (payload) {
          state.error = payload.message;
          state.fieldErrors = payload.errors || null;
        } else {
          state.error = "Login failed. Please try again.";
        }
      });

    // ── Signup ──
    builder
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.fieldErrors = null;
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        if (payload) {
          state.error = payload.message;
          state.fieldErrors = payload.errors || null;
        } else {
          state.error = "Signup failed. Please try again.";
        }
      });

    // ── Fetch Me ──
    builder
      .addCase(fetchMe.pending, (state) => {
        state.isInitializing = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action: PayloadAction<User>) => {
        state.isInitializing = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.isInitializing = false;
        state.isAuthenticated = false;
        state.user = null;
      });

    // ── Logout ──
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.fieldErrors = null;
    });

    // ── Change Password ──
    builder
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.fieldErrors = null;
        state.changePasswordSuccess = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.changePasswordSuccess = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        if (payload) {
          state.error = payload.message;
          state.fieldErrors = payload.errors || null;
        } else {
          state.error = "Failed to change password.";
        }
      });

    // ── Reset Password ──
    builder
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetSent = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        if (payload) {
          state.error = payload.message;
        } else {
          state.error = "Failed to send reset email.";
        }
      });

    // ── Reset Password Confirm ──
    builder
      .addCase(resetPasswordConfirm.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetConfirmSuccess = false;
      })
      .addCase(resetPasswordConfirm.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetConfirmSuccess = true;
      })
      .addCase(resetPasswordConfirm.rejected, (state, action) => {
        state.isLoading = false;
        const payload = action.payload;
        if (payload) {
          state.error = payload.message;
          state.fieldErrors = payload.errors || null;
        } else {
          state.error = "Failed to reset password.";
        }
      });
  },
});

export const {
  clearAuthError,
  clearPasswordResetState,
  clearChangePasswordState,
} = authSlice.actions;

export default authSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;
export const selectIsInitializing = (state: { auth: AuthState }) =>
  state.auth.isInitializing;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) =>
  state.auth.error;
export const selectAuthFieldErrors = (state: { auth: AuthState }) =>
  state.auth.fieldErrors;
export const selectPasswordResetSent = (state: { auth: AuthState }) =>
  state.auth.passwordResetSent;
export const selectPasswordResetConfirmSuccess = (state: { auth: AuthState }) =>
  state.auth.passwordResetConfirmSuccess;
export const selectChangePasswordSuccess = (state: { auth: AuthState }) =>
  state.auth.changePasswordSuccess;
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.role?.toUpperCase() === "ADMIN";
