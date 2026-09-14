import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { whatsappApi } from "../lib/api";
import type {
  WhatsAppMessage,
  WhatsAppStatus,
  ApiError,
} from "../lib/api/types";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchWhatsappMessages = createAsyncThunk<
  { results: WhatsAppMessage[]; count: number },
  { status?: WhatsAppStatus; lead?: string | number; page?: number; page_size?: number } | undefined,
  { rejectValue: ApiError }
>("whatsapp/fetchMessages", async (params, { rejectWithValue }) => {
  try {
    return await whatsappApi.list(params);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const resendWhatsappMessage = createAsyncThunk<
  WhatsAppMessage,
  string,
  { rejectValue: ApiError }
>("whatsapp/resend", async (displayId, { rejectWithValue }) => {
  try {
    return await whatsappApi.resend(displayId);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface WhatsappState {
  items: WhatsAppMessage[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  resendingId: string | null;
  resendError: string | null;
  filter: WhatsAppStatus | "All";
  currentPage: number;
  pageSize: number;
}

const initialState: WhatsappState = {
  items: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  resendingId: null,
  resendError: null,
  filter: "All",
  currentPage: 1,
  pageSize: 20,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const whatsappSlice = createSlice({
  name: "whatsapp",
  initialState,
  reducers: {
    setWhatsappFilter(state, action: PayloadAction<WhatsAppStatus | "All">) {
      state.filter = action.payload;
      state.currentPage = 1;
    },
    setWhatsappPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    clearResendError(state) {
      state.resendError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWhatsappMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWhatsappMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchWhatsappMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to load messages";
      })
      .addCase(resendWhatsappMessage.pending, (state, action) => {
        state.resendingId = action.meta.arg;
        state.resendError = null;
      })
      .addCase(resendWhatsappMessage.fulfilled, (state, action) => {
        state.resendingId = null;
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(resendWhatsappMessage.rejected, (state, action) => {
        state.resendingId = null;
        state.resendError = action.payload?.message || "Failed to resend message. Please try again.";
      });
  },
});

export const { setWhatsappFilter, setWhatsappPage, clearResendError } =
  whatsappSlice.actions;
export default whatsappSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectWhatsappMessages = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.items;
export const selectWhatsappLoading = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.isLoading;
export const selectWhatsappError = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.error;
export const selectWhatsappFilter = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.filter;
export const selectWhatsappResendingId = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.resendingId;
export const selectWhatsappResendError = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.resendError;
export const selectWhatsappTotalCount = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.totalCount;
export const selectWhatsappCurrentPage = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.currentPage;
export const selectWhatsappPageSize = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.pageSize;

export const selectFilteredWhatsapp = (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.items;

export const selectWhatsappByLead = (leadId: string | number) => (state: { whatsapp: WhatsappState }) =>
  state.whatsapp.items.filter((m) => String(m.lead) === String(leadId));
