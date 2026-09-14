import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Users, RefreshCw, PhoneCall, CalendarClock, ShieldCheck, UserCheck, Shuffle, Power, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import {
  fetchAgents,
  activateAgent,
  deactivateAgent,
  selectAgents,
  selectDashboardLoading,
  selectDashboardError,
  selectTogglingAgentIds,
} from "../store/dashboardSlice";
import { showToast } from "../store/uiSlice";
import type { AppDispatch } from "../store/store";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { TableSkeleton } from "../components/ui/Skeleton";

export default function AgentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const agents = useSelector(selectAgents);
  const isLoading = useSelector(selectDashboardLoading);
  const error = useSelector(selectDashboardError);
  const togglingIds = useSelector(selectTogglingAgentIds);

  const loadAgents = useCallback(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleToggleAgentStatus = async (agentId: number | string, currentStatus: boolean, agentName: string) => {
    try {
      if (currentStatus) {
        await dispatch(deactivateAgent(agentId)).unwrap();
        dispatch(showToast({ tone: "info", message: `${agentName} has been deactivated and removed from Round-Robin rotation.` }));
      } else {
        await dispatch(activateAgent(agentId)).unwrap();
        dispatch(showToast({ tone: "success", message: `${agentName} is now active and added to Round-Robin allocation.` }));
      }
    } catch (err: any) {
      dispatch(showToast({ tone: "error", message: err?.message || "Failed to update agent status" }));
    }
  };

  if (error && agents.length === 0) {
    return <ErrorState message={error} onRetry={loadAgents} />;
  }

  const activeAgentsCount = agents.filter((a) => a.is_active).length;

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2.5">
            <Users className="text-brand-600" size={24} />
            CRM Agents & Team Roster
          </h1>
          <p className="text-sm text-muted mt-1">
            Real estate advisors and sales reps assigned to leads, callbacks, and follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAgents}
            className="btn-secondary"
            title="Refresh agents roster"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-brand-600" : ""} />
            <span>Refresh Roster</span>
          </button>
        </div>
      </div>

      {/* ─── Round Robin Allocation System Alert Banner ─── */}
      <div className="rounded-xl bg-linear-to-r from-brand-900 to-brand-800 text-white p-5 shadow-card relative overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <div className="h-10 w-10 rounded-xl bg-gold-400 text-brand-950 flex items-center justify-center font-bold shrink-0 shadow-md">
            <Shuffle size={20} strokeWidth={2.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="font-display text-base font-bold text-white">Automated Round-Robin Lead Allocation</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-400/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active in Rotation ({activeAgentsCount} Agents)
              </span>
            </div>
            <p className="text-xs text-brand-100/90 mt-1 leading-relaxed max-w-3xl">
              Incoming customer calls and web lead enquiries are automatically distributed sequentially across active CRM agents using our backend Round-Robin algorithm. Deactivating an agent temporarily removes them from the distribution queue.
            </p>
          </div>
        </div>
      </div>

      {isLoading && agents.length === 0 ? (
        <TableSkeleton rows={4} cols={6} />
      ) : agents.length === 0 ? (
        <div className="card p-12">
          <EmptyState
            title="No agents configured"
            description="Agents will appear here once they are added to the system."
            icon={Users}
          />
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-muted uppercase tracking-wider bg-paper/60 border-b border-line">
                  <th className="px-5 py-3.5">Agent Details</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Round-Robin Status</th>
                  <th className="px-5 py-3.5">Active Leads</th>
                  <th className="px-5 py-3.5">Pending Follow-ups</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {agents.map((agent) => (
                  <tr
                    key={agent.id}
                    className="hover:bg-brand-50/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/agents/${agent.id}`}
                        className="flex items-center gap-3.5 group"
                      >
                        <div className="h-10 w-10 rounded-full bg-brand-900 text-gold-400 font-display text-sm font-semibold flex items-center justify-center shrink-0 border border-gold-400/30 shadow-xs group-hover:scale-105 transition-transform">
                          {agent.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-semibold text-ink text-base group-hover:text-brand-600 group-hover:underline flex items-center gap-1">
                            {agent.name}
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </p>
                          <p className="text-xs text-muted font-mono">{agent.username}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-paper border border-line px-2.5 py-1 text-xs font-medium text-ink shadow-2xs">
                        <ShieldCheck size={13} className="text-brand-600" />
                        {agent.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${
                          agent.is_active
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-surface text-muted border-line"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            agent.is_active ? "bg-emerald-500 animate-pulse" : "bg-muted"
                          }`}
                        />
                        {agent.is_active ? "Active in Rotation" : "Inactive (Paused)"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-ink font-semibold text-sm tabular-nums">
                        <PhoneCall size={14} className="text-brand-600" />
                        {agent.active_leads_count}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 text-ink font-semibold text-sm tabular-nums">
                        <CalendarClock size={14} className="text-gold-600" />
                        {agent.pending_followups_count}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {(() => {
                        const isToggling = togglingIds.includes(agent.id);
                        return (
                          <button
                            onClick={() => handleToggleAgentStatus(agent.id, agent.is_active, agent.name)}
                            disabled={isToggling}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all border shadow-2xs ${
                              isToggling
                                ? "opacity-60 cursor-wait"
                                : ""
                            } ${
                              agent.is_active
                                ? "bg-brick-50 text-brick-700 border-brick-200 hover:bg-brick-100"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Power size={13} />
                            )}
                            {agent.is_active ? "Deactivate" : "Activate"}
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


