import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, CalendarClock, CheckCircle, AlertTriangle, RefreshCw, Plus } from "lucide-react";
import {
  fetchFollowups,
  setFollowupFilter,
  setFollowupPage,
  setFollowupOrdering,
  selectFilteredFollowups,
  selectFollowupFilters,
  selectFollowupsLoading,
  selectFollowupsError,
  selectFollowupsTotalCount,
  selectFollowupsCurrentPage,
  selectFollowupsPageSize,
} from "../store/followupsSlice";
import type { AppDispatch } from "../store/store";
import type { FollowupStatus, FollowupType } from "../lib/api/types";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { TableSkeleton } from "../components/ui/Skeleton";
import { formatDateTime } from "../utils/format";

type TabKey = "all" | "pending" | "completed" | "overdue" | "missed";

const TABS: { key: TabKey; label: string; color: string }[] = [
  { key: "all", label: "All", color: "text-muted" },
  { key: "pending", label: "Pending", color: "text-brass-600" },
  { key: "completed", label: "Completed", color: "text-moss-600" },
  { key: "overdue", label: "Overdue", color: "text-brick-500" },
  { key: "missed", label: "Missed", color: "text-muted" },
];

const STATUS_MAP: Record<TabKey, string | null> = {
  all: null,
  pending: "Pending",
  completed: "Completed",
  overdue: "Pending", // Overdue is a client-side filter on Pending items
  missed: "Missed",
};

function isOverdue(dueAt: string): boolean {
  const now = new Date();
  const due = new Date(dueAt);
  return due < now;
}

export default function Followups() {
  const dispatch = useDispatch<AppDispatch>();
  const followups = useSelector(selectFilteredFollowups);
  const filters = useSelector(selectFollowupFilters);
  const isLoading = useSelector(selectFollowupsLoading);
  const error = useSelector(selectFollowupsError);
  const totalCount = useSelector(selectFollowupsTotalCount);
  const currentPage = useSelector(selectFollowupsCurrentPage);
  const pageSize = useSelector(selectFollowupsPageSize);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const loadFollowups = useCallback(() => {
    const params: Record<string, string | number | boolean | undefined | null> = {
      page: currentPage,
      page_size: pageSize,
    };
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== "All") params.status = filters.status;
    if (filters.type && filters.type !== "All") params.followup_type = filters.type;
    if (filters.ordering) params.ordering = filters.ordering;
    dispatch(fetchFollowups(params as Parameters<typeof fetchFollowups>[0] || undefined));
  }, [dispatch, currentPage, pageSize, filters.search, filters.status, filters.type, filters.ordering]);

  useEffect(() => {
    loadFollowups();
  }, [loadFollowups]);

  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setFollowupFilter({ search: value }));
    }, 300);
  };

  const handleTabChange = (tab: TabKey) => {
    const status = STATUS_MAP[tab];
    const apiStatus = (tab === "all" || tab === "overdue") ? null : status;
    dispatch(setFollowupFilter({ status: apiStatus as FollowupStatus | "All" }));
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const activeTab = (filters.status ?? "all") as TabKey;

  return (
    <div className="space-y-6 animate-in">
      {/* ─── Status Tabs ─── */}
      <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto custom-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`tab ${activeTab === tab.key ? "tab-active" : "tab-inactive"}`}
          >
            {tab.key === "overdue" && <AlertTriangle size={13} className="text-brick-500 shrink-0" />}
            {tab.key === "completed" && <CheckCircle size={13} className="text-moss-500 shrink-0" />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Search & Type Filter Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-line shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10 text-xs py-2 rounded-sm"
            placeholder="Search follow-up notes, prospect name or contact..."
            defaultValue={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            className="input text-xs py-2 sm:w-44 rounded-sm"
            value={filters.type || ""}
            onChange={(e) =>
              dispatch(setFollowupFilter({ type: (e.target.value || "All") as FollowupType | "All" }))
            }
          >
            <option value="">All Action Types</option>
            <option value="Call">Phone Call</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Email">Email</option>
            <option value="Meeting">Site Visit / Meeting</option>
          </select>
          <button
            onClick={loadFollowups}
            className="btn-secondary text-xs p-2 shrink-0"
            title="Refresh Tasks"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-brand-600" : ""} />
          </button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {error && <ErrorState message={error} onRetry={loadFollowups} />}

      {/* ─── Follow-up Operational Cards List ─── */}
      <div className="space-y-3">
        {isLoading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : followups.length === 0 ? (
          <div className="card p-12">
            <EmptyState
              title="No Follow-up Tasks Found"
              description={
                filters.search || filters.status || filters.type
                  ? "Try selecting a different tab or clearing search filters."
                  : "Scheduled callbacks and operational tasks will display here."
              }
            />
          </div>
        ) : (
          followups.map((fu) => {
            const overdue = fu.status === "Pending" && isOverdue(fu.due_at);
            const overdueMinutes = overdue
              ? Math.floor((Date.now() - new Date(fu.due_at).getTime()) / (1000 * 60))
              : 0;

            return (
              <div
                key={fu.id}
                className={`card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  overdue ? "border-brick-300 bg-brick-50/20" : ""
                }`}
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-md flex items-center justify-center shrink-0 border ${
                      overdue
                        ? "bg-brick-100 text-brick-700 border-brick-300"
                        : "bg-brand-50 text-brand-700 border-brand-200"
                    }`}
                  >
                    <CalendarClock size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/leads/${fu.lead_display_id ?? fu.lead}`}
                        className="text-sm font-bold text-ink hover:text-brand-600 truncate"
                      >
                        {fu.lead_name || `Enquiry #${fu.lead}`}
                      </Link>
                      <StatusBadge status={fu.status} />
                      <StatusBadge status={fu.type} showDot={false} className="bg-surface-muted text-muted text-[10px]" />
                    </div>

                    {fu.note && (
                      <p className="text-xs text-ink/85 font-medium mt-1.5 leading-relaxed line-clamp-2">
                        {fu.note}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-[11px] font-medium text-muted">
                      <span className="tabular-nums">Due: {formatDateTime(fu.due_at)}</span>
                      {overdue && (
                        <span className="text-brick-600 font-bold flex items-center gap-1 bg-brick-100 px-2 py-0.5 rounded border border-brick-200">
                          <AlertTriangle size={11} /> Overdue by {overdueMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:text-right text-xs text-muted shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-line">
                  {fu.lead_mobile && (
                    <p className="font-bold text-ink tabular-nums text-xs">{fu.lead_mobile}</p>
                  )}
                  <p className="text-[11px] mt-0.5 text-muted">
                    Assigned: <strong className="text-ink font-semibold">{fu.assigned_to_name?.trim() || "Unassigned"}</strong>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="card p-3 bg-surface-hover">
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(page) => dispatch(setFollowupPage(page))}
          />
        </div>
      )}
    </div>
  );
}

