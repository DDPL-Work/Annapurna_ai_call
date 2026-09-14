import { useState } from "react";
import { Outlet, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Toast from "../ui/Toast";
import { selectCurrentLead } from "../../store/leadsSlice";
import { selectCallById } from "../../store/callsSlice";

function useHeader() {
  const { pathname } = useLocation();
  const params = useParams();
  const lead = useSelector(selectCurrentLead);
  const call = useSelector(selectCallById(params.id || ""));

  if (pathname === "/dashboard")
    return { title: "Dashboard", subtitle: "Today's calls, enquiries and follow-ups at a glance" };
  if (pathname === "/leads")
    return { title: "Enquiries", subtitle: "Every enquiry captured by Riya & the AI calling assistant" };
  if (pathname === "/leads/new")
    return { title: "New Enquiry", subtitle: "Capture an enquiry manually" };
  if (pathname.startsWith("/leads/") && lead)
    return { title: lead.name, subtitle: `${lead.display_id || lead.id} · ${lead.mobile}` };
  if (pathname === "/calls")
    return { title: "Call Log", subtitle: "Telephony records with live transcripts & AI summaries" };
  if (pathname.startsWith("/calls/") && call)
    return { title: call.display_id || call.id, subtitle: `Call from ${call.from_number}` };
  if (pathname === "/followups")
    return { title: "Follow-ups", subtitle: "Scheduled callbacks and pending operational actions" };
  if (pathname === "/whatsapp")
    return { title: "WhatsApp Operations", subtitle: "Delivery status for automated follow-up messages & templates" };
  if (pathname === "/agents")
    return { title: "CRM Agents", subtitle: "Active sales executives and workload distribution" };
  if (pathname === "/settings")
    return { title: "Settings", subtitle: "Workspace details, AI Voice assistant & telephony setup" };
  return { title: "Annpurna Properties", subtitle: "AI Calling CRM" };
}

export default function AppLayout() {
  const { title, subtitle } = useHeader();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen w-full flex overflow-x-hidden bg-paper">
      {/* ─── Mobile Menu Overlay ─── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-brand-950/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── Sidebar Drawer ─── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-out md:relative md:z-auto md:w-64 md:translate-x-0 md:self-stretch ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
      </div>

      {/* ─── Main Application Container ─── */}
      <div className="flex-1 min-w-0 w-full flex flex-col">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="w-full flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-7 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      <Toast />
    </div>
  );
}

