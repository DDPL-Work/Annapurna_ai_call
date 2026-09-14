import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import leadsReducer from "./leadsSlice";
import callsReducer from "./callsSlice";
import followupsReducer from "./followupsSlice";
import whatsappReducer from "./whatsappSlice";
import dashboardReducer from "./dashboardSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadsReducer,
    calls: callsReducer,
    followups: followupsReducer,
    whatsapp: whatsappReducer,
    dashboard: dashboardReducer,
    ui: uiReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
