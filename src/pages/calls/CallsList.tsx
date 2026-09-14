import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, Mic, RefreshCw, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import {
  fetchCalls,
  setCallFilter,
  setCallPage,
  setCallOrdering,
  selectFilteredCalls,
  selectCallFilters,
  selectCallsLoading,
  selectCallsError,
  selectCallsTotalCount,
  selectCallsCurrentPage,
  selectCallsPageSize,
} from "../../store/callsSlice";
import type { AppDispatch } from "../../store/store";
import { CALL_STATUSES } from "../../lib/api/types";
import type { CallStatus } from "../../lib/api/types";
import StatusBadge from "../../components/ui/StatusBadge";
import Pagination from "../../components/ui/Pagination";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { formatDateTime, formatDuration } from "../../utils/format";

type SortField = "from_number" | "duration_sec" | "status" | "started_at";

export default function CallsList() {
  const dispatch = useDispatch<AppDispatch>();
  const calls = useSelector(selectFilteredCalls);
  const filters = useSelector(selectCallFilters);
  const isLoading = useSelector(selectCallsLoading);
  const error = useSelector(selectCallsError);
  const totalCount = useSelector(selectCallsTotalCount);
  const currentPage = useSelector(selectCallsCurrentPage);
  const pageSize = useSelector(selectCallsPageSize);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const loadCalls = useCallback(() => {
    const params: Record<string, string | number | boolean | undefined | null> = {
      page: currentPage,
      page_size: pageSize,
    };
    if (filters.query) params.search = filters.query;
    if (filters.status !== "All") params.status = filters.status;
    if (filters.ordering) params.ordering = filters.ordering;
    dispatch(fetchCalls(params as Parameters<typeof fetchCalls>[0]));
  }, [dispatch, currentPage, pageSize, filters.query, filters.status, filters.ordering]);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const handleSearchChange = (value: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      dispatch(setCallFilter({ query: value }));
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
    dispatch(setCallOrdering(newOrdering));
  };

  const getSortIcon = (field: SortField) => {
    if (filters.ordering === field) return <ChevronUp size={13} className="text-brand-600 font-bold" />;
    if (filters.ordering === `-${field}`) return <ChevronDown size={13} className="text-brand-600 font-bold" />;
    return <ArrowUpDown size={12} className="opacity-40" />;
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 animate-in">
      {/* ─── Header & Toolbar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface p-4 rounded-md border border-line shadow-xs">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10 text-xs py-2 rounded-sm"
            placeholder="Search by Call ID, mobile number, or linked enquiry..."
            defaultValue={filters.query}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select
            className="input text-xs py-2 sm:w-44 rounded-sm"
            value={filters.status}
            onChange={(e) => dispatch(setCallFilter({ status: e.target.value as CallStatus | "All" }))}
          >
            <option value="All">All Statuses</option>
            {CALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={loadCalls}
            className="btn-secondary text-xs p-2 shrink-0"
            title="Refresh Call Log"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-brand-600" : ""} />
          </button>
        </div>
      </div>

      {/* ─── Error Alert ─── */}
      {error && <ErrorState message={error} onRetry={loadCalls} />}

      {/* ─── Call Log Table ─── */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-muted text-muted font-semibold border-b border-line uppercase tracking-wider">
                <th className="px-6 py-3.5">Call ID</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("from_number")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    From Number {getSortIcon("from_number")}
                  </button>
                </th>
                <th className="px-6 py-3.5">Linked Lead</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("duration_sec")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Duration {getSortIcon("duration_sec")}
                  </button>
                </th>
                <th className="px-6 py-3.5">Audio Recording</th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("status")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Status {getSortIcon("status")}
                  </button>
                </th>
                <th className="px-6 py-3.5">
                  <button
                    onClick={() => handleSort("started_at")}
                    className="inline-flex items-center gap-1.5 hover:text-ink transition-colors uppercase"
                  >
                    Started Time {getSortIcon("started_at")}
                  </button>
                </th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton rows={6} cols={7} />
            ) : (
              <tbody className="divide-y divide-line">
                {calls.map((call) => (
                  <tr
                    key={call.id}
                    className="hover:bg-brand-50/40 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-brand-600">
                      <Link
                        to={`/calls/${call.display_id || call.id}`}
                        className="hover:underline"
                      >
                        {call.display_id || call.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-ink tabular-nums">{call.from_number}</td>
                    <td className="px-6 py-4">
                      {call.lead_name ? (
                        <Link
                          to={`/leads/${call.lead}`}
                          className="font-medium text-ink hover:text-brand-600 transition-colors"
                        >
                          {call.lead_name}
                        </Link>
                      ) : (
                        <span className="text-muted/60">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted font-medium tabular-nums">
                      {formatDuration(call.duration_sec)}
                    </td>
                    <td className="px-6 py-4">
                      {call.recording_available ? (
                        <span className="inline-flex items-center gap-1.5 text-brand-700 font-semibold bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                          <Mic size={12} className="text-brand-600" />
                          Audio Ready
                        </span>
                      ) : (
                        <span className="text-xs text-muted/60">Unavailable</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={call.status} />
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums whitespace-nowrap">
                      {formatDateTime(call.started_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>

          {!isLoading && calls.length === 0 && (
            <EmptyState
              title="No calls found"
              description={
                filters.query || filters.status !== "All"
                  ? "Try clearing your search or status filter."
                  : "Call records will display here automatically when telephony webhooks are received."
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
              onPageChange={(page) => dispatch(setCallPage(page))}
            />
          </div>
        )}
      </div>
    </div>
  );
}

