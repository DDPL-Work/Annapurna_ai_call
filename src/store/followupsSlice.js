import { createSlice } from "@reduxjs/toolkit";
import { FOLLOWUPS } from "../data/dummyData";

const initialState = {
  items: FOLLOWUPS,
};

const followupsSlice = createSlice({
  name: "followups",
  initialState,
  reducers: {
    completeFollowup(state, action) {
      const fu = state.items.find((f) => f.id === action.payload);
      if (fu) fu.status = "Completed";
    },
    snoozeFollowup(state, action) {
      const { id, hours } = action.payload;
      const fu = state.items.find((f) => f.id === id);
      if (fu) {
        const d = new Date(fu.dueAt);
        d.setHours(d.getHours() + hours);
        fu.dueAt = d.toISOString();
      }
    },
  },
});

export const { completeFollowup, snoozeFollowup } = followupsSlice.actions;
export default followupsSlice.reducer;

export const selectFollowups = (state) => state.followups.items;
export const selectFollowupsByLead = (leadId) => (state) =>
  state.followups.items.filter((f) => f.leadId === leadId);
export const selectPendingFollowups = (state) =>
  state.followups.items.filter((f) => f.status === "Pending");
