import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { PhoneCall, Users, CalendarClock, MessageCircle } from "lucide-react";
import { selectLeads } from "../store/leadsSlice";
import { selectCalls } from "../store/callsSlice";
import { selectPendingFollowups } from "../store/followupsSlice";
import { selectWhatsappMessages } from "../store/whatsappSlice";
import { CALL_VOLUME_TREND, AGENTS } from "../data/dummyData";
import KpiCard from "../components/dashboard/KpiCard";
import CallVolumeChart from "../components/dashboard/CallVolumeChart";
import StatusBadge from "../components/ui/StatusBadge";
import { formatDateTime, formatDuration, formatRelativeTime } from "../utils/format";

export default function Dashboard() {
  const leads = useSelector(selectLeads);
  const calls = useSelector(selectCalls);
  const pendingFollowups = useSelector(selectPendingFollowups);
  const whatsapp = useSelector(selectWhatsappMessages);

  const qualifiedToday = leads.filter((l) => l.status === "Qualified" || l.status === "Converted").length;
  const needsHuman = leads.filter((l) => l.status === "Needs Human Follow-up").length;
  const failedCalls = calls.filter((c) => c.status === "Failed").length;
  const deliveredMsgs = whatsapp.filter((m) => m.status === "Delivered" || m.status === "Read").length;

  const recentCalls = [...calls].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).slice(0, 5);

  return (
    <div className="space-y-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Calls handled (7d)" value={calls.length} delta="Auto-answered by AI assistant" icon={PhoneCall} />
        <KpiCard label="Qualified leads" value={qualifiedToday} delta={`${leads.length} total captured`} icon={Users} />
        <KpiCard
          label="Needs human follow-up"
          value={needsHuman}
          delta={needsHuman > 0 ? "Awaiting agent callback" : "All clear"}
          deltaTone={needsHuman > 0 ? "negative" : "positive"}
          icon={CalendarClock}
        />
        <KpiCard
          label="WhatsApp delivered"
          value={`${deliveredMsgs}/${whatsapp.length}`}
          delta={failedCalls > 0 ? `${failedCalls} call failed to connect` : "No delivery failures"}
          deltaTone={failedCalls > 0 ? "negative" : "positive"}
          icon={MessageCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-lg text-ink">Call volume, last 7 days</h2>
            <Link to="/calls" className="text-sm text-brand-500 hover:underline">
              View all calls
            </Link>
          </div>
          <p className="text-sm text-muted mb-2">Inbound calls answered by the AI assistant vs. qualified outcomes.</p>
          <CallVolumeChart data={CALL_VOLUME_TREND} />
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg text-ink">Pending follow-ups</h2>
            <Link to="/followups" className="text-sm text-brand-500 hover:underline">
              View all
            </Link>
          </div>
          <ul className="space-y-3">
            {pendingFollowups.slice(0, 5).map((fu) => (
              <li key={fu.id} className="flex items-start justify-between gap-3 pb-3 border-b border-line last:border-0 last:pb-0">
                <div className="min-w-0">
                  <Link to={`/leads/${fu.leadId}`} className="text-sm font-medium text-ink hover:text-brand-500 truncate block">
                    {fu.leadName}
                  </Link>
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">{fu.note}</p>
                </div>
                <span className="text-xs text-muted whitespace-nowrap pt-0.5">{formatRelativeTime(fu.dueAt)}</span>
              </li>
            ))}
            {pendingFollowups.length === 0 && (
              <p className="text-sm text-muted">Nothing pending. New follow-ups appear here as calls come in.</p>
            )}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-5 pt-5 pb-1">
          <h2 className="font-display text-lg text-ink">Recent calls</h2>
          <Link to="/calls" className="text-sm text-brand-500 hover:underline">
            View all calls
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-line">
                <th className="font-medium px-5 py-3">Call</th>
                <th className="font-medium px-5 py-3">From</th>
                <th className="font-medium px-5 py-3">Duration</th>
                <th className="font-medium px-5 py-3">Status</th>
                <th className="font-medium px-5 py-3">Started</th>
              </tr>
            </thead>
            <tbody>
              {recentCalls.map((call) => (
                <tr key={call.id} className="border-b border-line last:border-0 hover:bg-brand-50/40">
                  <td className="px-5 py-3">
                    <Link to={`/calls/${call.id}`} className="font-medium text-brand-500 hover:underline">
                      {call.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink">{call.fromNumber}</td>
                  <td className="px-5 py-3 text-muted">{formatDuration(call.durationSec)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="px-5 py-3 text-muted">{formatDateTime(call.startedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-display text-lg text-ink mb-3">Agent workload</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {AGENTS.map((agent) => {
            const assigned = leads.filter((l) => l.assignedTo === agent.id).length;
            return (
              <div key={agent.id} className="flex items-center gap-3 rounded-sm border border-line px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold flex items-center justify-center shrink-0">
                  {agent.name.split(" ").map((p) => p[0]).join("")}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{agent.name}</p>
                  <p className="text-xs text-muted">{assigned} active leads</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
