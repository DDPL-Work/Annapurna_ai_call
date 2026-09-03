import { useParams, Link, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { PhoneCall, MessageCircle, CalendarClock, MapPin } from "lucide-react";
import { selectLeadById, updateLeadStatus, assignLead } from "../../store/leadsSlice";
import { selectCallsByLead } from "../../store/callsSlice";
import { selectFollowupsByLead } from "../../store/followupsSlice";
import { selectWhatsappByLead } from "../../store/whatsappSlice";
import { LEAD_STATUSES, AGENTS } from "../../data/dummyData";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatBudgetRange, formatDateTime, formatDuration } from "../../utils/format";

export default function LeadDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const lead = useSelector(selectLeadById(id));
  const calls = useSelector(selectCallsByLead(id));
  const followups = useSelector(selectFollowupsByLead(id));
  const messages = useSelector(selectWhatsappByLead(id));

  if (!lead) return <Navigate to="/leads" replace />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="card p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-xl text-ink">
                {lead.requirementType} · {lead.propertyType}
              </h2>
              <p className="text-sm text-muted flex items-center gap-1.5 mt-1">
                <MapPin size={13} /> {lead.location}
              </p>
            </div>
            <StatusBadge status={lead.status} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-line">
            <div>
              <p className="text-xs text-muted">Budget</p>
              <p className="text-sm font-medium text-ink mt-0.5">{formatBudgetRange(lead.budgetMin, lead.budgetMax)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Timeline</p>
              <p className="text-sm font-medium text-ink mt-0.5">{lead.timeline || "Not captured"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Interest level</p>
              <p className="text-sm font-medium text-ink mt-0.5">{lead.interestLevel}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Source</p>
              <p className="text-sm font-medium text-ink mt-0.5">{lead.source}</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-3">Call history</h3>
          <div className="space-y-3">
            {calls.map((call) => (
              <Link
                key={call.id}
                to={`/calls/${call.id}`}
                className="flex items-center justify-between gap-3 rounded-sm border border-line px-4 py-3 hover:border-brand-500/40 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-sm bg-brand-50 flex items-center justify-center shrink-0">
                    <PhoneCall size={14} className="text-brand-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{call.id}</p>
                    <p className="text-xs text-muted">{formatDateTime(call.startedAt)} &middot; {formatDuration(call.durationSec)}</p>
                  </div>
                </div>
                <StatusBadge status={call.status} />
              </Link>
            ))}
            {calls.length === 0 && <p className="text-sm text-muted">No calls logged for this lead yet.</p>}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-3">WhatsApp activity</h3>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="rounded-sm border border-line px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted flex items-center gap-1.5">
                    <MessageCircle size={13} /> {formatDateTime(m.sentAt)}
                  </p>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-sm text-ink mt-2 leading-relaxed">{m.body}</p>
              </div>
            ))}
            {messages.length === 0 && <p className="text-sm text-muted">No WhatsApp messages sent yet.</p>}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-3">Manage lead</h3>
          <label className="label">Status</label>
          <select
            className="input mb-4"
            value={lead.status}
            onChange={(e) => dispatch(updateLeadStatus({ id: lead.id, status: e.target.value }))}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <label className="label">Assigned agent</label>
          <select
            className="input"
            value={lead.assignedTo || ""}
            onChange={(e) => dispatch(assignLead({ id: lead.id, agentId: e.target.value || null }))}
          >
            <option value="">Unassigned</option>
            {AGENTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-3">Contact</h3>
          <p className="text-sm text-ink">{lead.name}</p>
          <p className="text-sm text-muted mt-0.5">{lead.mobile}</p>
          <p className="text-xs text-muted mt-3">Lead ID: {lead.id}</p>
          <p className="text-xs text-muted">Captured: {formatDateTime(lead.createdAt)}</p>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-3 flex items-center gap-2">
            <CalendarClock size={16} className="text-brand-500" /> Follow-ups
          </h3>
          <div className="space-y-3">
            {followups.map((fu) => (
              <div key={fu.id} className="border-b border-line last:border-0 pb-3 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink">{fu.type}</p>
                  <StatusBadge status={fu.status} />
                </div>
                <p className="text-xs text-muted mt-1">{fu.note}</p>
                <p className="text-xs text-muted mt-1">{formatDateTime(fu.dueAt)}</p>
              </div>
            ))}
            {followups.length === 0 && <p className="text-sm text-muted">No follow-ups scheduled.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
