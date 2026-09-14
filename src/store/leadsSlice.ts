import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { leadsApi } from "../lib/api";
import type {
  Lead,
  LeadListParams,
  LeadStatus,
  RequirementType,
  ApiError,
} from "../lib/api/types";

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchLeads = createAsyncThunk<
  { results: Lead[]; count: number },
  LeadListParams | undefined,
  { rejectValue: ApiError }
>("leads/fetchLeads", async (params, { rejectWithValue }) => {
  try {
    return await leadsApi.list(params);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchLeadById = createAsyncThunk<
  Lead,
  string,
  { rejectValue: ApiError }
>("leads/fetchLeadById", async (displayId, { rejectWithValue }) => {
  try {
    return await leadsApi.get(displayId);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const createLead = createAsyncThunk<
  Lead,
  Parameters<typeof leadsApi.create>[0],
  { rejectValue: ApiError }
>("leads/createLead", async (data, { rejectWithValue }) => {
  try {
    return await leadsApi.create(data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const updateLead = createAsyncThunk<
  Lead,
  { displayId: string; data: Parameters<typeof leadsApi.update>[1] },
  { rejectValue: ApiError }
>("leads/updateLead", async ({ displayId, data }, { rejectWithValue }) => {
  try {
    return await leadsApi.update(displayId, data);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface LeadsState {
  items: Lead[];
  totalCount: number;
  currentLead: Lead | null;
  filters: {
    search: string;
    status: LeadStatus | "All";
    requirementType: RequirementType | "All";
    ordering: string;
  };
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  pageSize: number;
}

const initialState: LeadsState = {
  items: [],
  totalCount: 0,
  currentLead: null,
  filters: {
    search: "",
    status: "All",
    requirementType: "All",
    ordering: "-created_at",
  },
  isLoading: false,
  error: null,
  currentPage: 1,
  pageSize: 20,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<LeadsState["filters"]>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setOrdering(state, action: PayloadAction<string>) {
      state.filters.ordering = action.payload;
      state.currentPage = 1;
    },
    clearCurrentLead(state) {
      state.currentLead = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.results;
        state.totalCount = action.payload.count;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to load leads";
      })
      .addCase(fetchLeadById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLead = action.payload;
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to load lead";
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.totalCount += 1;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((l) => l.id === updated.id);
        if (idx !== -1) state.items[idx] = updated;
        if (state.currentLead?.id === updated.id) {
          state.currentLead = updated;
        }
      });
  },
});

export const { setFilter, setPage, setOrdering, clearCurrentLead } = leadsSlice.actions;
export default leadsSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectLeads = (state: { leads: LeadsState }) => state.leads.items;
export const selectLeadsLoading = (state: { leads: LeadsState }) =>
  state.leads.isLoading;
export const selectLeadsError = (state: { leads: LeadsState }) =>
  state.leads.error;
export const selectLeadFilters = (state: { leads: LeadsState }) =>
  state.leads.filters;
export const selectLeadsTotalCount = (state: { leads: LeadsState }) =>
  state.leads.totalCount;
export const selectLeadsCurrentPage = (state: { leads: LeadsState }) =>
  state.leads.currentPage;
export const selectLeadsPageSize = (state: { leads: LeadsState }) =>
  state.leads.pageSize;
export const selectCurrentLead = (state: { leads: LeadsState }) =>
  state.leads.currentLead;

export const selectLeadById = (id: string) => (state: { leads: LeadsState }) =>
  state.leads.items.find((l) => l.id === id || l.display_id === id);

export const selectFilteredLeads = (state: { leads: LeadsState }) =>
  state.leads.items;
