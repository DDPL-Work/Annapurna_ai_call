import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Toast {
  tone: "success" | "error" | "info";
  message: string;
}

interface UiState {
  sidebarCollapsed: boolean;
  toast: Toast | null;
}

const initialState: UiState = {
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
    showToast(state, action: PayloadAction<Toast>) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
  },
});

export const { toggleSidebar, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;

export const selectSidebarCollapsed = (state: { ui: UiState }) =>
  state.ui.sidebarCollapsed;
export const selectToast = (state: { ui: UiState }) => state.ui.toast;
