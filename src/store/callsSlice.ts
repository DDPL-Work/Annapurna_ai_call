import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { callsApi } from "../lib/api";
import type {
  Call,
  CallTranscript,
  CallSummary,
  CallStatus,
  CallListParams,
  ApiError,
} from "../lib/api/types";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchCalls = createAsyncThunk<
  { results: Call[]; count: number },
  CallListParams | undefined,
  { rejectValue: ApiError }
>("calls/fetchCalls", async (params, { rejectWithValue }) => {
  try {
    return await callsApi.list(params);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchCallTranscript = createAsyncThunk<
  CallTranscript,
  string,
  { rejectValue: ApiError }
>("calls/fetchTranscript", async (displayId, { rejectWithValue }) => {
  try {
    return await callsApi.getTranscript(displayId);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchCallSummary = createAsyncThunk<
  CallSummary,
  string,
  { rejectValue: ApiError }
>("calls/fetchSummary", async (displayId, { rejectWithValue }) => {
  try {
    return await callsApi.getSummary(displayId);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchCallById = createAsyncThunk<
  Call,
  string,
  { rejectValue: ApiError }
>("calls/fetchCallById", async (displayId, { rejectWithValue }) => {
  try {
    return await callsApi.get(displayId);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface CallsState {
  items: Call[];
  totalCount: number;
  currentTranscript: CallTranscript | null;
  currentSummary: CallSummary | null;
  filters: {
    query: string;
    status: CallStatus | "All";
    ordering: string;
  };
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  transcriptLoading: boolean;
  summaryLoading: boolean;
}

const initialState: CallsState = {
  items: [],
  totalCount: 0,
  currentTranscript: null,
  currentSummary: null,
  filters: {
    query: "",
    status: "All",
    ordering: "-started_at",
  },
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 20,
  transcriptLoading: false,
  summaryLoading: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const callsSlice = createSlice({
  name: "calls",
  initialState,
  reducers: {
    setCallFilter(state, action: PayloadAction<Partial<CallsState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    setCallPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setCallOrdering(state, action: PayloadAction<string>) {
      state.filters.ordering = action.payload;
      state.currentPage = 1;
    },
    clearCallDetail(state) {
      state.currentTranscript = null;
      state.currentSummary = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalls.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCalls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchCalls.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to load calls";
      })
      .addCase(fetchCallById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCallById.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) {
          state.items[idx] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchCallById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to load call";
      })
      .addCase(fetchCallTranscript.pending, (state) => {
        state.transcriptLoading = true;
      })
      .addCase(fetchCallTranscript.fulfilled, (state, action) => {
        state.transcriptLoading = false;
        state.currentTranscript = action.payload;
      })
      .addCase(fetchCallTranscript.rejected, (state) => {
        state.transcriptLoading = false;
      })
      .addCase(fetchCallSummary.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchCallSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.currentSummary = action.payload;
      })
      .addCase(fetchCallSummary.rejected, (state) => {
        state.summaryLoading = false;
      });
  },
});

export const { setCallFilter, setCallPage, setCallOrdering, clearCallDetail } = callsSlice.actions;
export default callsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCalls = (state: { calls: CallsState }) => state.calls.items;
export const selectCallsLoading = (state: { calls: CallsState }) =>
  state.calls.isLoading;
export const selectCallsError = (state: { calls: CallsState }) =>
  state.calls.error;
export const selectCallFilters = (state: { calls: CallsState }) =>
  state.calls.filters;
export const selectCallsTotalCount = (state: { calls: CallsState }) =>
  state.calls.totalCount;
export const selectCallTranscript = (state: { calls: CallsState }) =>
  state.calls.currentTranscript;
export const selectCallSummary = (state: { calls: CallsState }) =>
  state.calls.currentSummary;
export const selectTranscriptLoading = (state: { calls: CallsState }) =>
  state.calls.transcriptLoading;
export const selectSummaryLoading = (state: { calls: CallsState }) =>
  state.calls.summaryLoading;

export const selectCallById = (id: string) => (state: { calls: CallsState }) =>
  state.calls.items.find((c) => c.id === id || c.display_id === id);

export const selectFilteredCalls = (state: { calls: CallsState }) =>
  state.calls.items;

export const selectCallsCurrentPage = (state: { calls: CallsState }) =>
  state.calls.currentPage;

export const selectCallsPageSize = (state: { calls: CallsState }) =>
  state.calls.pageSize;
