import { createSlice } from "@reduxjs/toolkit";
import { LEADS } from "../data/dummyData";

// In the real system this slice is populated from GET /api/v1/leads/ and
// mutated via POST/PATCH /api/v1/leads/{id}/. For the POC it's seeded with
// dummy data and mutated locally so the UI is fully interactive offline.

const initialState = {
  items: LEADS,
  filters: {
    query: "",
    status: "All",
    requirementType: "All",
  },
};

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    addLead: {
      reducer(state, action) {
        state.items.unshift(action.payload);
      },
      prepare(lead) {
        const now = new Date().toISOString();
        const nextNum = 1043 + state_counter();
        return {
          payload: {
            id: `LD-${nextNum}`,
            source: "Manual",
            status: "New",
            assignedTo: null,
            createdAt: now,
            lastActivityAt: now,
            nextFollowUpAt: null,
            ...lead,
          },
        };
      },
    },
    updateLeadStatus(state, action) {
      const { id, status } = action.payload;
      const lead = state.items.find((l) => l.id === id);
      if (lead) {
        lead.status = status;
        lead.lastActivityAt = new Date().toISOString();
      }
    },
    assignLead(state, action) {
      const { id, agentId } = action.payload;
      const lead = state.items.find((l) => l.id === id);
      if (lead) {
        lead.assignedTo = agentId;
        lead.lastActivityAt = new Date().toISOString();
      }
    },
  },
});

let counter = 0;
function state_counter() {
  counter += 1;
  return counter;
}

export const { setFilter, addLead, updateLeadStatus, assignLead } = leadsSlice.actions;
export default leadsSlice.reducer;

export const selectLeads = (state) => state.leads.items;
export const selectLeadFilters = (state) => state.leads.filters;
export const selectLeadById = (id) => (state) => state.leads.items.find((l) => l.id === id);

export const selectFilteredLeads = (state) => {
  const { query, status, requirementType } = state.leads.filters;
  return state.leads.items.filter((lead) => {
    const matchesQuery =
      !query ||
      lead.name.toLowerCase().includes(query.toLowerCase()) ||
      lead.mobile.replace(/\s/g, "").includes(query.replace(/\s/g, "")) ||
      lead.id.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "All" || lead.status === status;
    const matchesType = requirementType === "All" || lead.requirementType === requirementType;
    return matchesQuery && matchesStatus && matchesType;
  });
};
