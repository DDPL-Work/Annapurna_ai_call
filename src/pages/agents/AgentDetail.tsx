import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  Users,
  Search,
  RefreshCw,
  PhoneCall,
  CalendarClock,
  ShieldCheck,
  Building2,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { fetchAgents, selectAgents } from "../../store/dashboardSlice";
import { leadsApi } from "../../lib/api/leads";
import type {
  Lead,
  LeadStatus,
  RequirementType,
  InterestLevel,
  LeadListResponse,
  Agent,
} from "../../lib/api/types";
import { LEAD_STATUSES, REQUIREMENT_TYPES, INTEREST_LEVELS } from "../../lib/api/types";
import type { AppDispatch } from "../../store/store";
import StatusBadge from "../../components/ui/StatusBadge";
import MetricCard from "../../components/ui/MetricCard";
import MetricGrid from "../../components/ui/MetricGrid";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { formatBudgetRange, formatRelativeTime, formatDateTime } from "../../utils/format";

type SortField = "name" | "status" | "created_at" | "last_activity_at" | "budget_min";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const agentId = id ? Number(id) : NaN;

  // Agent meta from store
  const agents = useSelector(selectAgents);
  const currentAgent = agents.find((a) => a.id === agentId);

  // Agent Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [reqFilter, setReqFilter] = useState<RequirementType | "All">("All");
  const [interestFilter, setInterestFilter] = useState<InterestLevel | "All">("All");
  const [ordering, setOrdering] = useState("-created_at");

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const loadAgentAndLeads = useCallback(async () => {
    if (isNaN(agentId)) return;

    setIsLoading(true);
    setError(null);

    try {
      // Ensure agent list is loaded
      if (agents.length === 0) {
        dispatch(fetchAgents());
      }

      // Fetch agent specific leads via GET /api/v1/leads/?assigned_to={agentId}
      const params: Record<string, string | number | boolean | undefined | null> = {
        assigned_to: agentId,
        page: currentPage,
        page_size: pageSize,
        ordering,
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== "All") params.status = statusFilter;
      if (reqFilter !== "All") params.requirement_type = reqFilter;

      const res: LeadListResponse = await leadsApi.list(params as any);

      // Locally apply interest level filter if set (if backend doesn't filter interest natively)
      let results = res.results ?? [];
      if (interestFilter !== "All") {
        results = results.filter((l) => l.interest_level === interestFilter);
      }

      setLeads(results);
      setTotalCount(res.count ?? results.length);
    } catch (err: any) {
      if (err?.status === 403) {
        setError("You don't have permission to access this agent's details.");
      } else {
        setError(err?.message || "Failed to load agent details");
      }
    } finally {
      setIsLoading(false);
    }
  }, [agentId, currentPage, pageSize, ordering, searchTerm, statusFilter, reqFilter, interestFilter, agents.length, dispatch]);

  useEffect(() => {
    loadAgentAndLeads();
  }, [loadAgentAndLeads]);

  const handleSearchChange = (val: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(val);
      setCurrentPage(1);
    }, 300);
  };

  const handleSort = (field: SortField) => {
    if (ordering === field) {
      setOrdering(`-${field}`);
    } else if (ordering === `-${field}`) {
      setOrdering(field);
    } else {
      setOrdering(field);
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: SortField) => {
    if (ordering === field) return <ChevronUp size={13} className="text-brand-600 font-bold" />;
    if (ordering === `-${field}`) return <ChevronDown size={13} className="text-brand-600 font-bold" />;
    return <ArrowUpDown size={12} className="opacity-40" />;
  };

  // Metrics calculated from REAL lead list results & agent payload
  const newLeadsCount = leads.filter((l) => l.status === "New").length;
  const qualifiedLeadsCount = leads.filter((l) => l.status === "Qualified").length;
  const needsFollowupCount = leads.filter((l) => l.status === "Needs Human Follow-up").length;

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isNaN(agentId)) {
    return <ErrorState message="Invalid Agent ID" onRetry={() => navigate("/agents")} />;
  }

  return (
    <div className="space-y-6 animate-in">
      {/* ─── Breadcrumb Navigation ─── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <Link to="/agents" className="hover:text-brand-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Agents
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">{currentAgent?.name || `Agent #${agentId}`}</span>
      </div>

      {/* ─── Agent Profile Header Card ─── */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-brand-900 text-gold-400 font-display text-xl font-bold flex items-center justify-center shrink-0 border-2 border-gold-400/40 shadow-md">
              {(currentAgent?.name || "A")
                .split(" ")
                .map((p) => p[0])
                .join("")}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-ink tracking-tight">
                  {currentAgent?.name || `Agent #${agentId}`}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-paper border border-line px-2.5 py-0.5 text-xs font-medium text-ink">
                  <ShieldCheck size={13} className="text-brand-600" />
                  {currentAgent?.role || "CRM Member"}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                    currentAgent?.is_active
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-surface text-muted border-line"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      currentAgent?.is_active ? "bg-emerald-500 animate-pulse" : "bg-muted"
                    }`}
                  />
                  {currentAgent?.is_active ? "Active in Rotation" : "Inactive (Paused)"}
                </span>
              </div>
              <p className="text-xs text-muted font-mono mt-1">
                Username: {currentAgent?.username || `agent_${agentId}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={loadAgentAndLeads}
              className="btn-secondary text-xs"
              title="Refresh Agent Data"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-brand-600" : ""} />
              <span>Sync Agent Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Real Agent Metric Grid ─── */}
      <MetricGrid columns={4}>
        <MetricCard
          label="Total Assigned Enquiries"
          value={currentAgent?.active_leads_count ?? totalCount}
          subtitle="Enquiries assigned via Round-Robin"
          icon={Users}
        />
        <MetricCard
          label="New Enquiries"
          value={newLeadsCount}
          subtitle="Fresh uncontacted leads"
          tone="positive"
          icon={TrendingUp}
        />
        <MetricCard
          label="Qualified Prospects"
          value={qualifiedLeadsCount}
          subtitle="High-intent property buyers"
          tone="positive"
          icon={UserCheck}
        />
        <MetricCard
          label="Pending Callbacks"
          value={currentAgent?.pending_followups_count ?? needsFollowupCount}
          subtitle="Pending action or scheduled visit"
          tone={needsFollowupCount > 0 ? "warning" : "positive"}
          icon={CalendarClock}
        />
      </MetricGrid>

      {/* ─── Assigned Leads Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-line shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10 text-xs py-2 rounded-sm"
            placeholder="Search agent's assigned leads by name, mobile, or location..."
            defaultValue={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <select
            className="input text-xs py-2 w-36 rounded-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as LeadStatus | "All");
              setCurrentPage(1);
            }}
          >
            <option value="All">All Statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            className="input text-xs py-2 w-32 rounded-sm"
            value={reqFilter}
            onChange={(e) => {
              setReqFilter(e.target.value as RequirementType | "All");
              setCurrentPage(1);
            }}
          >
            <option value="All">All Types</option>
            {REQUIREMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            className="input text-xs py-2 w-32 rounded-sm"
            value={interestFilter}
            onChange={(e) => {
              setInterestFilter(e.target.value as InterestLevel | "All");
              setCurrentPage(1);
            }}
          >
            <option value="All">All Intent</option>
            {INTEREST_LEVELS.map((i) => (
              <option key={i} value={i}>{i} Intent</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {error && <ErrorState message={error} onRetry={loadAgentAndLeads} />}

      {/* ─── Assigned Leads Table ─── */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-line bg-surface-hover flex items-center justify-between">
          <div>
            <h3 className="section-title font-bold">Assigned Enquiries</h3>
            <p className="text-xs text-muted mt-0.5">
              Filtered listing via <code className="text-brand-700 font-mono text-[11px]">/api/v1/leads/?assigned_to={agentId}</code>
            </p>
          </div>
          <span className="text-xs font-semibold text-muted">
            Total: <strong className="text-ink tabular-nums">{totalCount}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-muted text-muted font-semibold border-b border-line uppercase tracking-wider">
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Lead {getSortIcon("name")}
                  </button>
                </th>
                <th className="px-6 py-3.5">Mobile</th>
                <th className="px-6 py-3.5">Requirement</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("budget_min")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Budget {getSortIcon("budget_min")}
                  </button>
                </th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("status")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Status {getSortIcon("status")}
                  </button>
                </th>
                <th className="px-6 py-3.5">Interest</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("created_at")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Created {getSortIcon("created_at")}
                  </button>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={5} cols={9} />
            ) : (
              <tbody className="divide-y divide-line">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-brand-50/40 transition-colors cursor-pointer"
                    onClick={() => navigate(`/leads/${lead.display_id || lead.id}`)}
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/leads/${lead.display_id || lead.id}`}
                        className="font-bold text-ink hover:text-brand-600 text-sm block"
                      >
                        {lead.name}
                      </Link>
                      <span className="text-muted text-[11px] block mt-0.5">#{lead.display_id || lead.id}</span>
                    </td>
                    <td className="px-6 py-4 text-muted font-medium tabular-nums">{lead.mobile}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-ink">{lead.requirement_formatted || `${lead.requirement_type} · ${lead.property_type}`}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-700 tabular-nums">
                      {lead.budget_formatted || formatBudgetRange(lead.budget_min, lead.budget_max)}
                    </td>
                    <td className="px-6 py-4 text-ink font-medium">{lead.location}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-paper text-ink font-semibold text-[11px] border border-line">
                        {lead.interest_level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums whitespace-nowrap">
                      {formatRelativeTime(lead.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/leads/${lead.display_id || lead.id}`}
                        className="btn-ghost text-xs py-1 px-2.5 text-brand-600 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Enquiry
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {!isLoading && leads.length === 0 && (
            <EmptyState
              title="No leads assigned"
              description="This agent currently has no assigned enquiries matching the selected filters."
              icon={Users}
            />
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-line px-6 py-3 bg-surface-hover">
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
