import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { followupsApi } from "../lib/api";
import type {
  Followup,
  FollowupStatus,
  FollowupType,
  ApiError,
} from "../lib/api/types";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchFollowups = createAsyncThunk<
  { results: Followup[]; count: number },
  {
    status?: FollowupStatus;
    type?: FollowupType;
    search?: string;
    lead?: string | number;
    page?: number;
    page_size?: number;
    ordering?: string;
  } | undefined,
  { rejectValue: ApiError }
>("followups/fetchFollowups", async (params, { rejectWithValue }) => {
  try {
    return await followupsApi.list(params);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface FollowupFilters {
  status: FollowupStatus | "All" | "Overdue";
  type: FollowupType | "All";
  search: string;
  ordering: string;
}

interface FollowupsState {
  items: Followup[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
  filters: FollowupFilters;
}

const initialFilters: FollowupFilters = {
  status: "All",
  type: "All",
  search: "",
  ordering: "due_at",
};

const initialState: FollowupsState = {
  items: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 20,
  filters: initialFilters,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const followupsSlice = createSlice({
  name: "followups",
  initialState,
  reducers: {
    setFollowupFilter(state, action: PayloadAction<Partial<FollowupFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    setFollowupPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setFollowupOrdering(state, action: PayloadAction<string>) {
      state.filters.ordering = action.payload;
      state.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchFollowups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to load follow-ups";
      });
  },
});

export const { setFollowupFilter, setFollowupPage, setFollowupOrdering } =
  followupsSlice.actions;
export default followupsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectFollowups = (state: { followups: FollowupsState }) =>
  state.followups.items;
export const selectFollowupsLoading = (state: { followups: FollowupsState }) =>
  state.followups.isLoading;
export const selectFollowupsError = (state: { followups: FollowupsState }) =>
  state.followups.error;
export const selectFollowupsTotalCount = (state: { followups: FollowupsState }) =>
  state.followups.totalCount;
export const selectFollowupsCurrentPage = (state: { followups: FollowupsState }) =>
  state.followups.currentPage;
export const selectFollowupsPageSize = (state: { followups: FollowupsState }) =>
  state.followups.pageSize;
export const selectFollowupFilters = (state: { followups: FollowupsState }) =>
  state.followups.filters;

export const selectFilteredFollowups = (state: { followups: FollowupsState }) => {
  let items = state.followups.items;
  const { status, type } = state.followups.filters;
  if (status !== "All" && status !== "Overdue") {
    items = items.filter((f) => f.status === status);
  } else if (status === "Overdue") {
    const now = new Date();
    items = items.filter((f) => f.status === "Pending" && new Date(f.due_at) < now);
  }
  if (type !== "All") {
    items = items.filter((f) => f.type === type);
  }
  return items;
};

export const selectPendingFollowups = (state: { followups: FollowupsState }) =>
  state.followups.items.filter((f) => f.status === "Pending");
export const selectFollowupsByLead = (leadId: string | number) => (state: { followups: FollowupsState }) =>
  state.followups.items.filter((f) => String(f.lead) === String(leadId));
