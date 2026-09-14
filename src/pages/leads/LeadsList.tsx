import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, RefreshCw, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import {
  fetchLeads,
  setFilter,
  setPage,
  setOrdering,
  selectFilteredLeads,
  selectLeadFilters,
  selectLeadsLoading,
  selectLeadsError,
  selectLeadsTotalCount,
  selectLeadsCurrentPage,
  selectLeadsPageSize,
} from "../../store/leadsSlice";
import { fetchAgents, selectAgents } from "../../store/dashboardSlice";
import type { AppDispatch } from "../../store/store";
import { LEAD_STATUSES, REQUIREMENT_TYPES } from "../../lib/api/types";
import type { LeadStatus, RequirementType } from "../../lib/api/types";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { formatBudgetRange, formatRelativeTime } from "../../utils/format";

type SortField = "name" | "status" | "created_at" | "last_activity_at" | "budget_min";

export default function LeadsList() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const leads = useSelector(selectFilteredLeads);
  const filters = useSelector(selectLeadFilters);
  const isLoading = useSelector(selectLeadsLoading);
  const error = useSelector(selectLeadsError);
  const totalCount = useSelector(selectLeadsTotalCount);
  const currentPage = useSelector(selectLeadsCurrentPage);
  const pageSize = useSelector(selectLeadsPageSize);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const agents = useSelector(selectAgents);

  // Build a lookup map: agent ID → agent name
  const agentNameMap = agents.reduce<Record<number, string>>((acc, a) => {
    acc[a.id] = a.name || a.username;
    return acc;
  }, {});

  const loadLeads = useCallback(() => {
    const params: Record<string, string | number | boolean | undefined | null> = {
      page: currentPage,
      page_size: pageSize,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status !== "All") params.status = filters.status;
    if (filters.requirementType !== "All") params.requirement_type = filters.requirementType;
    if (filters.ordering) params.ordering = filters.ordering;
    dispatch(fetchLeads(params as Parameters<typeof fetchLeads>[0]));
  }, [dispatch, currentPage, pageSize, filters.search, filters.status, filters.requirementType, filters.ordering]);

  useEffect(() => {
    loadLeads();
    dispatch(fetchAgents());
  }, [loadLeads]);

  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setFilter({ search: value }));
    }, 300);
  };

  const handleSort = (field: SortField) => {
    const currentOrdering = filters.ordering;
    let newOrdering: string;
    if (currentOrdering === field) {
      newOrdering = `-${field}`;
    } else if (currentOrdering === `-${field}`) {
      newOrdering = field;
    } else {
      newOrdering = field;
    }
    dispatch(setOrdering(newOrdering));
  };

  const getSortIcon = (field: SortField) => {
    if (filters.ordering === field) return <ChevronUp size={13} className="text-brand-600 font-bold" />;
    if (filters.ordering === `-${field}`) return <ChevronDown size={13} className="text-brand-600 font-bold" />;
    return <ArrowUpDown size={12} className="opacity-40" />;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 animate-in">
      {/* ─── Header & Search Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-line shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10 text-xs py-2 rounded-sm"
            placeholder="Search by prospect name, mobile number, or locality..."
            defaultValue={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
          <select
            className="input text-xs py-2 w-36 sm:w-44 rounded-sm"
            value={filters.status}
            onChange={(e) => dispatch(setFilter({ status: e.target.value as LeadStatus | "All" }))}
          >
            <option value="All">All Statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="input text-xs py-2 w-36 sm:w-40 rounded-sm"
            value={filters.requirementType}
            onChange={(e) => dispatch(setFilter({ requirementType: e.target.value as RequirementType | "All" }))}
          >
            <option value="All">All Types</option>
            {REQUIREMENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button
            onClick={loadLeads}
            className="btn-secondary text-xs p-2 shrink-0"
            title="Refresh Enquiries"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-brand-600" : ""} />
          </button>
          <button
            onClick={() => navigate("/leads/new")}
            className="btn-primary text-xs font-semibold py-2 px-3.5 shrink-0 shadow-xs"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span className="hidden sm:inline">New Enquiry</span>
          </button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {error && <ErrorState message={error} onRetry={loadLeads} />}

      {/* ─── Enquiries Operational Table ─── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-muted text-muted font-semibold border-b border-line uppercase tracking-wider">
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("name")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Prospect / Contact {getSortIcon("name")}
                  </button>
                </th>
                <th className="px-6 py-3.5">Requirement</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("budget_min")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Budget {getSortIcon("budget_min")}
                  </button>
                </th>
                <th className="px-6 py-3.5">Locality</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("status")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Status {getSortIcon("status")}
                  </button>
                </th>
                <th className="px-6 py-3.5">Assigned Agent</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("last_activity_at")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Last Activity {getSortIcon("last_activity_at")}
                  </button>
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={6} cols={7} />
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
                      <span className="text-muted font-medium tabular-nums text-[11px] mt-0.5 block">
                        {lead.mobile}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-ink">
                        {lead.requirement_type}
                      </span>
                      <span className="text-muted block text-[11px] mt-0.5">
                        {lead.property_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-700 tabular-nums">
                      {formatBudgetRange(lead.budget_min, lead.budget_max)}
                    </td>
                    <td className="px-6 py-4 text-ink font-medium">{lead.location}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 text-muted font-medium">
                      {lead.assigned_to_name || lead.assigned_agent_name || (lead.assigned_to ? agentNameMap[lead.assigned_to] : null) || (
                        <span className="text-muted/50 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums whitespace-nowrap">
                      {formatRelativeTime(lead.last_activity_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {!isLoading && leads.length === 0 && (
            <EmptyState
              title="No enquiries found"
              description={
                filters.search || filters.status !== "All" || filters.requirementType !== "All"
                  ? "Try clearing search keywords or selecting different status filters."
                  : "No real-estate enquiries have been recorded yet."
              }
              action={
                !filters.search && filters.status === "All" && filters.requirementType === "All"
                  ? { label: "+ Create New Enquiry", onClick: () => navigate("/leads/new") }
                  : undefined
              }
            />
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-line px-6 py-3 bg-surface-hover">
            <Pagination
              currentPage={currentPage}
              totalCount={totalCount}
              pageSize={pageSize}
              onPageChange={(page) => dispatch(setPage(page))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

