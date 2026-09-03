import { createSlice } from "@reduxjs/toolkit";
import { WHATSAPP_MESSAGES } from "../data/dummyData";

const initialState = {
  items: WHATSAPP_MESSAGES,
  filters: { status: "All" },
};

const whatsappSlice = createSlice({
  name: "whatsapp",
  initialState,
  reducers: {
    setWhatsappFilter(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resendMessage(state, action) {
      const msg = state.items.find((m) => m.id === action.payload);
      if (msg) {
        msg.status = "Sent";
        msg.sentAt = new Date().toISOString();
        delete msg.failureReason;
      }
    },
  },
});

export const { setWhatsappFilter, resendMessage } = whatsappSlice.actions;
export default whatsappSlice.reducer;

export const selectWhatsappMessages = (state) => state.whatsapp.items;
export const selectWhatsappByLead = (leadId) => (state) =>
  state.whatsapp.items.filter((m) => m.leadId === leadId);

export const selectFilteredWhatsapp = (state) => {
  const { status } = state.whatsapp.filters;
  return state.whatsapp.items.filter((m) => status === "All" || m.status === status);
};
