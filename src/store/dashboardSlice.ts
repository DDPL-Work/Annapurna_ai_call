import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { dashboardApi, agentsApi } from "../lib/api";
import type {
  DashboardMetrics,
  DashboardOverview,
  CallVolumeDay,
  AgentWorkloadItem,
  Agent,
  ApiError,
} from "../lib/api/types";

// ─── Normalization ──────────────────────────────────────────────────────────────

function normalizeDashboardMetrics(raw: DashboardMetrics): DashboardMetrics {
  const overview = raw.overview as unknown as DashboardOverview;
  const leadsByStatus = raw.leads_by_status ?? {};
  
  // Calculate converted leads from leads_by_status
  const convertedLeads = leadsByStatus.Converted ?? 0;
  
  // Calculate WhatsApp delivered from sent - failed (if no explicit delivered metric)
  const whatsappDelivered = overview.whatsapp_sent - overview.whatsapp_failed;
  const whatsappTotal = overview.whatsapp_sent;
  
  // Use total_calls as "Calls (7d)" per API contract
  const totalCalls7d = overview.total_calls;
  
  // Calculate avg call duration if we have the data
  // Note: This might not be in the current API response
  
  return {
    overview: {
      ...overview,
      // Keep original fields
    },
    leads_by_status: leadsByStatus,
    call_volume_trend: raw.call_volume_trend ?? [],
    agent_workload: raw.agent_workload ?? [],
    // Additional computed fields for UI compatibility
    converted_leads: convertedLeads,
    whatsapp_delivered: whatsappDelivered,
    whatsapp_total: whatsappTotal,
    whatsapp_failed: overview.whatsapp_failed,
    total_calls_7d: totalCalls7d,
    completed_calls_7d: overview.completed_calls,
    failed_calls_7d: overview.total_calls - overview.completed_calls,
    avg_call_duration_sec: 0, // Will be populated if API provides it
    new_leads_today: overview.leads_today,
    conversion_rate: overview.total_leads > 0 ? Math.round((convertedLeads / overview.total_leads) * 100) : 0,
  };
}

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchDashboardMetrics = createAsyncThunk<
  DashboardMetrics,
  void,
  { rejectValue: ApiError }
>("dashboard/fetchMetrics", async (_, { rejectWithValue }) => {
  try {
    const raw = await dashboardApi.getMetrics();
    return normalizeDashboardMetrics(raw);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const fetchAgents = createAsyncThunk<
  Agent[],
  void,
  { rejectValue: ApiError }
>("dashboard/fetchAgents", async (_, { rejectWithValue }) => {
  try {
    return await agentsApi.list();
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const activateAgent = createAsyncThunk<
  Agent,
  number | string,
  { rejectValue: ApiError }
>("dashboard/activateAgent", async (id, { rejectWithValue }) => {
  try {
    return await agentsApi.activate(id);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

export const deactivateAgent = createAsyncThunk<
  Agent,
  number | string,
  { rejectValue: ApiError }
>("dashboard/deactivateAgent", async (id, { rejectWithValue }) => {
  try {
    return await agentsApi.deactivate(id);
  } catch (error) {
    return rejectWithValue(error as ApiError);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface DashboardState {
  metrics: DashboardMetrics | null;
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
  /** IDs of agents currently being toggled (for per-button loading spinners) */
  togglingAgentIds: (number | string)[];
}

const initialState: DashboardState = {
  metrics: null,
  agents: [],
  isLoading: false,
  error: null,
  togglingAgentIds: [],
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to load dashboard";
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.agents = action.payload;
      })
      // ─── Activate: optimistic toggle ───
      .addCase(activateAgent.pending, (state, action) => {
        const agentId = action.meta.arg;
        state.togglingAgentIds.push(agentId);
        // Optimistically set is_active = true
        const idx = state.agents.findIndex((a) => a.id === Number(agentId));
        if (idx !== -1) state.agents[idx].is_active = true;
      })
      .addCase(activateAgent.fulfilled, (state, action) => {
        const agentId = action.meta.arg;
        state.togglingAgentIds = state.togglingAgentIds.filter((id) => id !== agentId);
        // Apply server response if it contains a valid agent
        if (action.payload.id) {
          const idx = state.agents.findIndex((a) => a.id === action.payload.id);
          if (idx !== -1) state.agents[idx] = action.payload;
        }
      })
      .addCase(activateAgent.rejected, (state, action) => {
        const agentId = action.meta.arg;
        state.togglingAgentIds = state.togglingAgentIds.filter((id) => id !== agentId);
        // Rollback: set back to inactive
        const idx = state.agents.findIndex((a) => a.id === Number(agentId));
        if (idx !== -1) state.agents[idx].is_active = false;
      })
      // ─── Deactivate: optimistic toggle ───
      .addCase(deactivateAgent.pending, (state, action) => {
        const agentId = action.meta.arg;
        state.togglingAgentIds.push(agentId);
        // Optimistically set is_active = false
        const idx = state.agents.findIndex((a) => a.id === Number(agentId));
        if (idx !== -1) state.agents[idx].is_active = false;
      })
      .addCase(deactivateAgent.fulfilled, (state, action) => {
        const agentId = action.meta.arg;
        state.togglingAgentIds = state.togglingAgentIds.filter((id) => id !== agentId);
        // Apply server response if it contains a valid agent
        if (action.payload.id) {
          const idx = state.agents.findIndex((a) => a.id === action.payload.id);
          if (idx !== -1) state.agents[idx] = action.payload;
        }
      })
      .addCase(deactivateAgent.rejected, (state, action) => {
        const agentId = action.meta.arg;
        state.togglingAgentIds = state.togglingAgentIds.filter((id) => id !== agentId);
        // Rollback: set back to active
        const idx = state.agents.findIndex((a) => a.id === Number(agentId));
        if (idx !== -1) state.agents[idx].is_active = true;
      });
  },
});

export default dashboardSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectDashboardMetrics = (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) =>
  state.dashboard.isLoading;
export const selectDashboardError = (state: { dashboard: DashboardState }) =>
  state.dashboard.error;
export const selectAgents = (state: { dashboard: DashboardState }) =>
  state.dashboard.agents;
export const selectTogglingAgentIds = (state: { dashboard: DashboardState }) =>
  state.dashboard.togglingAgentIds;

// ─── View-model selectors for Dashboard UI ────────────────────────────────────

export const selectDashboardOverview = (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics?.overview;

export const selectDashboardLeadsByStatus = (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics?.leads_by_status ?? {};

export const selectDashboardCallVolumeTrend = (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics?.call_volume_trend ?? [];

export const selectDashboardAgentWorkload = (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics?.agent_workload ?? [];
