import { Outlet, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { selectLeadById } from "../../store/leadsSlice";
import { selectCallById } from "../../store/callsSlice";

function useHeader() {
  const { pathname } = useLocation();
  const params = useParams();
  const lead = useSelector(selectLeadById(params.id));
  const call = useSelector(selectCallById(params.id));

  if (pathname === "/dashboard") return { title: "Dashboard", subtitle: "Today's calls, leads and follow-ups at a glance" };
  if (pathname === "/leads") return { title: "Leads", subtitle: "Every enquiry captured by the AI calling assistant" };
  if (pathname === "/leads/new") return { title: "New lead", subtitle: "Add a lead manually" };
  if (pathname.startsWith("/leads/") && lead) return { title: lead.name, subtitle: `${lead.id} · ${lead.mobile}` };
  if (pathname === "/calls") return { title: "Calls", subtitle: "Call log with transcripts and AI summaries" };
  if (pathname.startsWith("/calls/") && call) return { title: call.id, subtitle: `Call from ${call.fromNumber}` };
  if (pathname === "/followups") return { title: "Follow-ups", subtitle: "Scheduled callbacks and pending actions" };
  if (pathname === "/whatsapp") return { title: "WhatsApp", subtitle: "Delivery status for automated follow-up messages" };
  if (pathname === "/settings") return { title: "Settings", subtitle: "Agents, users and workspace preferences" };
  return { title: "Basera CRM" };
}

export default function AppLayout() {
  const { title, subtitle } = useHeader();

  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="px-6 md:px-8 py-7 max-w-[1400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
