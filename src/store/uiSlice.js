import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarCollapsed: false,
  toast: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    showToast(state, action) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const { toggleSidebar, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;

export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectToast = (state) => state.ui.toast;
