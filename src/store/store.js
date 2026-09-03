import { configureStore } from "@reduxjs/toolkit";
import leadsReducer from "./leadsSlice";
import callsReducer from "./callsSlice";
import followupsReducer from "./followupsSlice";
import whatsappReducer from "./whatsappSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    leads: leadsReducer,
    calls: callsReducer,
    followups: followupsReducer,
    whatsapp: whatsappReducer,
    ui: uiReducer,
  },
});
