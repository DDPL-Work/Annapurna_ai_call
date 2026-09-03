import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search, Mic } from "lucide-react";
import { selectFilteredCalls, setCallFilter } from "../../store/callsSlice";
import { selectLeads } from "../../store/leadsSlice";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime, formatDuration } from "../../utils/format";

const STATUSES = ["All", "Completed", "Failed"];

export default function CallsList() {
  const dispatch = useDispatch();
  const calls = useSelector(selectFilteredCalls);
  const filters = useSelector((s) => s.calls.filters);
  const leads = useSelector(selectLeads);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search by call ID or number"
            value={filters.query}
            onChange={(e) => dispatch(setCallFilter({ query: e.target.value }))}
          />
        </div>
        <select
          className="input sm:w-48"
          value={filters.status}
          onChange={(e) => dispatch(setCallFilter({ status: e.target.value }))}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All statuses" : s}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-line">
                <th className="font-medium px-5 py-3">Call</th>
                <th className="font-medium px-5 py-3">Lead</th>
                <th className="font-medium px-5 py-3">From</th>
                <th className="font-medium px-5 py-3">Duration</th>
                <th className="font-medium px-5 py-3">Recording</th>
                <th className="font-medium px-5 py-3">Status</th>
                <th className="font-medium px-5 py-3">Started</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => {
                const lead = leads.find((l) => l.id === call.leadId);
                return (
                  <tr key={call.id} className="border-b border-line last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-3.5">
                      <Link to={`/calls/${call.id}`} className="font-medium text-brand-500 hover:underline">
                        {call.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      {lead ? (
                        <Link to={`/leads/${lead.id}`} className="text-ink hover:text-brand-500">
                          {lead.name}
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{call.fromNumber}</td>
                    <td className="px-5 py-3.5 text-muted">{formatDuration(call.durationSec)}</td>
                    <td className="px-5 py-3.5">
                      {call.recordingAvailable ? (
                        <span className="inline-flex items-center gap-1.5 text-brand-500 text-xs">
                          <Mic size={13} /> Available
                        </span>
                      ) : (
                        <span className="text-xs text-muted">Not available</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={call.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDateTime(call.startedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
