import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Check, Clock3 } from "lucide-react";
import { selectFollowups, completeFollowup, snoozeFollowup } from "../store/followupsSlice";
import StatusBadge from "../components/ui/StatusBadge";
import { formatDateTime } from "../utils/format";

export default function Followups() {
  const dispatch = useDispatch();
  const followups = useSelector(selectFollowups);
  const sorted = [...followups].sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted border-b border-line">
              <th className="font-medium px-5 py-3">Lead</th>
              <th className="font-medium px-5 py-3">Type</th>
              <th className="font-medium px-5 py-3">Note</th>
              <th className="font-medium px-5 py-3">Due</th>
              <th className="font-medium px-5 py-3">Status</th>
              <th className="font-medium px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((fu) => (
              <tr key={fu.id} className="border-b border-line last:border-0 hover:bg-brand-50/40">
                <td className="px-5 py-3.5">
                  <Link to={`/leads/${fu.leadId}`} className="font-medium text-ink hover:text-brand-500">
                    {fu.leadName}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-muted">{fu.type}</td>
                <td className="px-5 py-3.5 text-ink max-w-xs">{fu.note}</td>
                <td className="px-5 py-3.5 text-muted whitespace-nowrap">{formatDateTime(fu.dueAt)}</td>
                <td className="px-5 py-3.5">
                  <StatusBadge status={fu.status} />
                </td>
                <td className="px-5 py-3.5">
                  {fu.status === "Pending" ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => dispatch(snoozeFollowup({ id: fu.id, hours: 2 }))}
                        className="text-xs text-muted hover:text-ink inline-flex items-center gap-1 border border-line rounded-sm px-2 py-1"
                      >
                        <Clock3 size={12} /> +2h
                      </button>
                      <button
                        onClick={() => dispatch(completeFollowup(fu.id))}
                        className="text-xs text-white bg-brand-500 hover:bg-brand-600 rounded-sm px-2 py-1 inline-flex items-center gap-1"
                      >
                        <Check size={12} /> Done
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-muted block text-right">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
