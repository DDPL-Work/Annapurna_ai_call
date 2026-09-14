import { useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  PhoneCall,
  Users,
  CalendarClock,
  MessageCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import {
  fetchDashboardMetrics,
  fetchAgents,
  selectDashboardMetrics,
  selectDashboardLoading,
  selectDashboardError,
  selectAgents,
  selectDashboardOverview,
  selectDashboardLeadsByStatus,
  selectDashboardCallVolumeTrend,
  selectDashboardAgentWorkload,
} from "../store/dashboardSlice";
import { fetchFollowups, selectPendingFollowups } from "../store/followupsSlice";
import { fetchLeads, selectLeads } from "../store/leadsSlice";
import { fetchCalls, selectCalls, selectCallsLoading, selectCallsError } from "../store/callsSlice";
import type { AppDispatch } from "../store/store";
import MetricCard from "../components/ui/MetricCard";
import MetricGrid from "../components/ui/MetricGrid";
import { MetricCardSkeleton } from "../components/ui/Skeleton";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import CallVolumeChart from "../components/dashboard/CallVolumeChart";
import StatusBadge from "../components/ui/StatusBadge";
import { formatDateTime, formatDuration, formatRelativeTime } from "../utils/format";
import { transformCallsToChartData } from "../lib/chart/callVolume";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const metrics = useSelector(selectDashboardMetrics);
  const overview = useSelector(selectDashboardOverview);
  const leadsByStatus = useSelector(selectDashboardLeadsByStatus);
  const callVolumeTrend = useSelector(selectDashboardCallVolumeTrend);
  const agentWorkload = useSelector(selectDashboardAgentWorkload);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const agents = useSelector(selectAgents);
  const pendingFollowups = useSelector(selectPendingFollowups);
  const allCalls = useSelector(selectCalls);
  const callsLoading = useSelector(selectCallsLoading);
  const callsError = useSelector(selectCallsError);
  const safeAgents = Array.isArray(agents) ? agents : [];
  const safePendingFollowups = Array.isArray(pendingFollowups) ? pendingFollowups : [];
  const safeRecentCalls = Array.isArray(allCalls) ? allCalls : [];

  const chartData = useMemo(() => {
    if (allCalls.length > 0) {
      return transformCallsToChartData(allCalls);
    }
    return callVolumeTrend.map((d) => ({
      date: d.day,
      dateKey: d.date,
      answered: d.total_calls,
      qualified: d.qualified_calls,
    }));
  }, [allCalls, callVolumeTrend]);

  const loadData = useCallback(() => {
    dispatch(fetchDashboardMetrics());
    dispatch(fetchAgents());
    dispatch(fetchFollowups({ status: "Pending", page_size: 5 }));
    dispatch(fetchLeads({ page: 1, page_size: 5, ordering: "-created_at" }));
    dispatch(fetchCalls({ page: 1, page_size: 100, ordering: "-started_at" }));
  }, [dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading && !metrics) {
    return (
      <div className="space-y-6">
        <MetricGrid columns={4}>
          {[...Array(4)].map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </MetricGrid>
      </div>
    );
  }

  if (error && !metrics) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  const needsHumanFollowupCount = overview?.needs_human_followup ?? 0;
  const totalLeads = overview?.total_leads ?? 0;
  const qualifiedLeads = overview?.qualified_leads ?? 0;
  const leadsToday = overview?.leads_today ?? 0;
  const totalCalls = overview?.total_calls ?? 0;
  const pendingFollowupsCount = overview?.pending_followups ?? safePendingFollowups.length;
  const whatsappSent = overview?.whatsapp_sent ?? 0;
  const whatsappFailed = overview?.whatsapp_failed ?? 0;
  const convertedLeads = leadsByStatus.Converted ?? 0;

  return (
    <div className="space-y-6 animate-in">
      {/* ─── Hero Page Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-2xl font-extrabold text-ink tracking-tight">CRM Command Center</h2>
          <p className="text-xs font-medium text-muted mt-1">
            Today's inbound calls, captured enquiries, and pending agent actions at a glance.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            className="btn-secondary text-xs"
            title="Refresh Data"
          >
            <Clock size={14} />
            Sync Now
          </button>
          <button
            onClick={() => navigate("/leads/new")}
            className="btn-accent text-xs"
          >
            + New Enquiry
          </button>
        </div>
      </div>

      {/* ─── High Priority Attention Alert ─── */}
      {needsHumanFollowupCount > 0 && (
        <div className="rounded-md bg-gold-100 border border-gold-300 px-5 py-4 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-10 w-10 rounded-full bg-gold-500 text-brand-900 flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle size={20} strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink">
                {needsHumanFollowupCount} Enquir{needsHumanFollowupCount !== 1 ? "ies" : "y"} Require Human Agent Callback
              </p>
              <p className="text-xs text-ink/75 mt-0.5 truncate">
                Riya (AI Assistant) flagged these calls for immediate human handover or custom negotiation.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/followups")}
            className="btn-primary text-xs font-semibold shrink-0 shadow-xs"
          >
            Review Action Tray
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ─── Primary 4-Column KPI Grid ─── */}
      <MetricGrid columns={4}>
        <MetricCard
          label="Total Enquiries"
          value={totalLeads}
          subtitle={`${leadsToday} captured today`}
          icon={Users}
          onClick={() => navigate("/leads")}
        />
        <MetricCard
          label="Qualified Buyers"
          value={qualifiedLeads}
          subtitle={
            metrics?.conversion_rate != null
              ? `${metrics.conversion_rate}% qualification rate`
              : "High-intent buyers"
          }
          tone="positive"
          icon={TrendingUp}
          onClick={() => navigate("/leads")}
        />
        <MetricCard
          label="Agent Callbacks Due"
          value={needsHumanFollowupCount}
          subtitle={
            needsHumanFollowupCount > 0
              ? "Human handover requested"
              : "All callbacks cleared"
          }
          tone={needsHumanFollowupCount > 0 ? "warning" : "positive"}
          icon={CalendarClock}
          onClick={() => navigate("/followups")}
        />
        <MetricCard
          label="Inbound Calls (7d)"
          value={totalCalls}
          subtitle={
            metrics?.avg_call_duration_sec
              ? `Avg duration ${formatDuration(metrics.avg_call_duration_sec)}`
              : "100% answered by AI"
          }
          icon={PhoneCall}
          onClick={() => navigate("/calls")}
        />
      </MetricGrid>

      {/* ─── Secondary Metrics Grid ─── */}
      <MetricGrid columns={3}>
        <MetricCard
          label="Pending Follow-ups"
          value={pendingFollowupsCount}
          subtitle="Scheduled callbacks & site visits"
          icon={Clock}
          onClick={() => navigate("/followups")}
        />
        <MetricCard
          label="WhatsApp Automated Hits"
          value={whatsappSent}
          subtitle={
            whatsappFailed > 0
              ? `${whatsappFailed} failed delivery`
              : "100% delivered to prospects"
          }
          tone={whatsappFailed > 0 ? "negative" : "positive"}
          icon={MessageCircle}
          onClick={() => navigate("/whatsapp")}
        />
        <MetricCard
          label="Closed Deals"
          value={convertedLeads}
          subtitle="Successfully converted enquiries"
          tone="positive"
          icon={UserCheck}
        />
      </MetricGrid>

      {/* ─── Call Analytics Chart & Action Tray ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Volume Trend */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="section-title text-lg font-bold">Inbound Call Volume &amp; Outcomes</h3>
              <p className="text-xs text-muted mt-0.5">
                Inbound caller traffic answered by AI vs. qualified real-estate outcomes.
              </p>
            </div>
            <Link to="/calls" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">
              Full Call Log →
            </Link>
          </div>
          <div className="mt-4">
            {callsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-pulse space-x-4 w-full flex justify-between items-end h-32">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="w-12 h-full bg-brand-100/60 rounded-t-sm" />
                  ))}
                </div>
              </div>
            ) : callsError ? (
              <ErrorState
                message={callsError}
                onRetry={() => dispatch(fetchCalls({ page: 1, page_size: 100, ordering: "-started_at" }))}
              />
            ) : chartData.length > 0 && chartData.some((d) => d.answered > 0 || d.qualified > 0) ? (
              <CallVolumeChart
                data={chartData.map((d) => ({
                  day: d.date,
                  calls: d.answered,
                  qualified: d.qualified,
                }))}
              />
            ) : (
              <EmptyState
                title="No call volume recorded yet"
                description="Call analytics and AI qualification performance will display here as telephony webhooks fire."
              />
            )}
          </div>
        </div>

        {/* Needs Attention / Pending Action */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-line">
              <h3 className="section-title font-bold flex items-center gap-2">
                <Clock size={16} className="text-brand-600" />
                Action Required
              </h3>
              <Link to="/followups" className="text-xs font-semibold text-brand-600 hover:underline">
                View All
              </Link>
            </div>

            {safePendingFollowups.length > 0 ? (
              <ul className="space-y-3.5">
                {safePendingFollowups.slice(0, 4).map((fu) => (
                  <li
                    key={fu.id}
                    className="flex items-start justify-between gap-3 pb-3 border-b border-line/70 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <Link
                        to={`/leads/${fu.lead_display_id ?? fu.lead}`}
                        className="text-xs font-bold text-ink hover:text-brand-600 truncate block"
                      >
                        {fu.lead_name || `Lead #${fu.lead}`}
                      </Link>
                      <p className="text-xs text-muted mt-0.5 line-clamp-1">{fu.note || "Pending follow-up"}</p>
                      <span className="text-[11px] text-muted font-medium mt-1 inline-block">
                        Due: {formatRelativeTime(fu.due_at)}
                      </span>
                    </div>
                    <StatusBadge status={fu.type} className="shrink-0 text-[10px] px-2" />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title="All Caught Up"
                description="No pending callbacks or overdue tasks right now."
              />
            )}
          </div>

          <div className="pt-4 border-t border-line mt-4">
            <Link
              to="/whatsapp"
              className="w-full btn-secondary text-xs justify-center py-2 font-semibold"
            >
              Check WhatsApp Delivery Queue
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Recent Calls Operational Table ─── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line bg-surface-hover">
          <div>
            <h3 className="section-title font-bold">Recent Telephony Calls</h3>
            <p className="text-xs text-muted mt-0.5">Live inbound call records with AI transcript analysis.</p>
          </div>
          <Link to="/calls" className="text-xs font-semibold text-brand-600 hover:underline">
            View All Calls →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-muted text-muted font-semibold border-b border-line uppercase tracking-wider">
                <th className="px-6 py-3">Call ID</th>
                <th className="px-6 py-3">Caller Number</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Started At</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {safeRecentCalls.slice(0, 5).map((call) => (
                <tr key={call.id} className="hover:bg-brand-50/40 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-brand-600">
                    <Link to={`/calls/${call.display_id || call.id}`} className="hover:underline">
                      {call.display_id || call.id}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 font-medium text-ink tabular-nums">{call.from_number}</td>
                  <td className="px-6 py-3.5 text-muted tabular-nums">{formatDuration(call.duration_sec)}</td>
                  <td className="px-6 py-3.5">
                    <StatusBadge status={call.status} />
                  </td>
                  <td className="px-6 py-3.5 text-muted tabular-nums">{formatDateTime(call.started_at)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <Link
                      to={`/calls/${call.display_id || call.id}`}
                      className="btn-ghost text-xs py-1 px-2 text-brand-600 font-semibold"
                    >
                      View Transcript
                    </Link>
                  </td>
                </tr>
              ))}
              {safeRecentCalls.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted">
                    No recent call activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Agent Workload Cards ─── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
          <div>
            <h3 className="section-title font-bold">Sales Executive Workload</h3>
            <p className="text-xs text-muted mt-0.5">Assigned enquiries and active pending tasks per agent.</p>
          </div>
          <Link to="/agents" className="text-xs font-semibold text-brand-600 hover:underline">
            Manage Agents →
          </Link>
        </div>

        {(agentWorkload && agentWorkload.length > 0) || safeAgents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentWorkload && agentWorkload.length > 0
              ? agentWorkload.map((aw) => (
                  <Link
                    key={aw.agent_id}
                    to={`/agents/${aw.agent_id}`}
                    className="flex items-center gap-3.5 rounded-md border border-line bg-surface p-4 hover:border-brand-400 hover:shadow-sm transition-all group"
                  >
                    <div className="h-10 w-10 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:bg-brand-700 transition-colors">
                      {getInitials(aw.agent_name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink truncate group-hover:text-brand-600 group-hover:underline">
                        {aw.agent_name}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        <strong className="text-ink">{aw.active_leads}</strong> active leads ·{" "}
                        <strong className="text-brand-600">{aw.pending_followups}</strong> pending
                      </p>
                    </div>
                  </Link>
                ))
              : safeAgents.map((agent) => (
                  <Link
                    key={agent.id}
                    to={`/agents/${agent.id}`}
                    className="flex items-center gap-3.5 rounded-md border border-line bg-surface p-4 hover:border-brand-400 hover:shadow-sm transition-all group"
                  >
                    <div className="h-10 w-10 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:bg-brand-700 transition-colors">
                      {getInitials(agent.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink truncate group-hover:text-brand-600 group-hover:underline">
                        {agent.name}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        <strong className="text-ink">{agent.active_leads_count}</strong> active leads ·{" "}
                        <strong className="text-brand-600">{agent.pending_followups_count}</strong> pending
                      </p>
                    </div>
                  </Link>
                ))}
          </div>
        ) : (
          <EmptyState
            title="No agents configured"
            description="Sales team members will display here once added in Settings."
          />
        )}
      </div>
    </div>
  );
}

function getInitials(name: string | null | undefined): string {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return parts.length > 0 ? parts.map((part) => part[0]).join("") : "?";
}

