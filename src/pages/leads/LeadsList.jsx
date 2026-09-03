import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { selectFilteredLeads, selectLeadFilters, setFilter } from "../../store/leadsSlice";
import { LEAD_STATUSES, REQUIREMENT_TYPES, AGENTS } from "../../data/dummyData";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatBudgetRange, formatRelativeTime } from "../../utils/format";

export default function LeadsList() {
  const dispatch = useDispatch();
  const leads = useSelector(selectFilteredLeads);
  const filters = useSelector(selectLeadFilters);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-9"
            placeholder="Search by name, mobile or lead ID"
            value={filters.query}
            onChange={(e) => dispatch(setFilter({ query: e.target.value }))}
          />
        </div>
        <select
          className="input sm:w-52"
          value={filters.status}
          onChange={(e) => dispatch(setFilter({ status: e.target.value }))}
        >
          <option value="All">All statuses</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="input sm:w-44"
          value={filters.requirementType}
          onChange={(e) => dispatch(setFilter({ requirementType: e.target.value }))}
        >
          <option value="All">Buy / Sell / Rent</option>
          {REQUIREMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-line">
                <th className="font-medium px-5 py-3">Lead</th>
                <th className="font-medium px-5 py-3">Requirement</th>
                <th className="font-medium px-5 py-3">Budget</th>
                <th className="font-medium px-5 py-3">Location</th>
                <th className="font-medium px-5 py-3">Status</th>
                <th className="font-medium px-5 py-3">Agent</th>
                <th className="font-medium px-5 py-3">Last activity</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const agent = AGENTS.find((a) => a.id === lead.assignedTo);
                return (
                  <tr key={lead.id} className="border-b border-line last:border-0 hover:bg-brand-50/40">
                    <td className="px-5 py-3.5">
                      <Link to={`/leads/${lead.id}`} className="font-medium text-ink hover:text-brand-500">
                        {lead.name}
                      </Link>
                      <p className="text-xs text-muted mt-0.5">{lead.mobile}</p>
                    </td>
                    <td className="px-5 py-3.5 text-ink">
                      {lead.requirementType} · {lead.propertyType}
                    </td>
                    <td className="px-5 py-3.5 text-muted">{formatBudgetRange(lead.budgetMin, lead.budgetMax)}</td>
                    <td className="px-5 py-3.5 text-muted">{lead.location}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3.5 text-muted">{agent ? agent.name : "Unassigned"}</td>
                    <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatRelativeTime(lead.lastActivityAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {leads.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-sm font-medium text-ink">No leads match this filter</p>
              <p className="text-sm text-muted mt-1">Try clearing the search or choosing a different status.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
