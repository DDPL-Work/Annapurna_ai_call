import { createSlice } from "@reduxjs/toolkit";
import { CALLS } from "../data/dummyData";

const initialState = {
  items: CALLS,
  filters: {
    query: "",
    status: "All",
  },
};

const callsSlice = createSlice({
  name: "calls",
  initialState,
  reducers: {
    setCallFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setCallFilter } = callsSlice.actions;
export default callsSlice.reducer;

export const selectCalls = (state) => state.calls.items;
export const selectCallById = (id) => (state) => state.calls.items.find((c) => c.id === id);
export const selectCallsByLead = (leadId) => (state) =>
  state.calls.items.filter((c) => c.leadId === leadId);

export const selectFilteredCalls = (state) => {
  const { query, status } = state.calls.filters;
  return state.calls.items.filter((call) => {
    const matchesQuery =
      !query ||
      call.id.toLowerCase().includes(query.toLowerCase()) ||
      call.fromNumber.replace(/\s/g, "").includes(query.replace(/\s/g, ""));
    const matchesStatus = status === "All" || call.status === status;
    return matchesQuery && matchesStatus;
  });
};
