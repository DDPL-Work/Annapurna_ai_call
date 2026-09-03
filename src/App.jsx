import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import LeadsList from "./pages/leads/LeadsList";
import LeadDetail from "./pages/leads/LeadDetail";
import NewLead from "./pages/leads/NewLead";
import CallsList from "./pages/calls/CallsList";
import CallDetail from "./pages/calls/CallDetail";
import Followups from "./pages/Followups";
import WhatsAppPage from "./pages/WhatsAppPage";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<LeadsList />} />
        <Route path="/leads/new" element={<NewLead />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
        <Route path="/calls" element={<CallsList />} />
        <Route path="/calls/:id" element={<CallDetail />} />
        <Route path="/followups" element={<Followups />} />
        <Route path="/whatsapp" element={<WhatsAppPage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
