import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Navigate, Link } from "react-router-dom";
import {
  AlertTriangle,
  MapPin,
  RefreshCw,
  Edit3,
  PhoneCall,
  MessageCircle,
  Save,
  X,
  CalendarClock,
  Clock,
  UserCheck,
  CheckCircle2,
  Building2,
  Tag,
  DollarSign
} from "lucide-react";
import {
  fetchLeadById,
  updateLead,
  clearCurrentLead,
  selectCurrentLead,
  selectLeadsLoading,
  selectLeadsError,
} from "../../store/leadsSlice";
import { fetchFollowups, selectFollowupsByLead } from "../../store/followupsSlice";
import { fetchWhatsappMessages, selectWhatsappByLead } from "../../store/whatsappSlice";
import { fetchAgents, selectAgents } from "../../store/dashboardSlice";
import type { AppDispatch } from "../../store/store";
import { LEAD_STATUSES } from "../../lib/api/types";
import type { LeadStatus, UpdateLeadRequest } from "../../lib/api/types";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import ErrorState from "../../components/ui/ErrorState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { formatDateTime, formatBudgetRange } from "../../utils/format";

const PIPELINE_STAGES: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Needs Human Follow-up",
  "Follow-up Scheduled",
  "Converted",
];

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const lead = useSelector(selectCurrentLead);
  const isLoading = useSelector(selectLeadsLoading);
  const error = useSelector(selectLeadsError);
  const followups = useSelector(selectFollowupsByLead(lead?.id ?? ""));
  const messages = useSelector(selectWhatsappByLead(lead?.id ?? ""));
  const agents = useSelector(selectAgents);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateLeadRequest>({});

  useEffect(() => {
    if (id) {
      dispatch(fetchLeadById(id));
      dispatch(fetchAgents());
    }
    return () => {
      dispatch(clearCurrentLead());
    };
  }, [dispatch, id]);

  useEffect(() => {
    if (lead?.id != null) {
      dispatch(fetchFollowups({ lead: lead.id }));
      dispatch(fetchWhatsappMessages({ lead: lead.id }));
    }
  }, [dispatch, lead?.id]);

  useEffect(() => {
    if (lead && isEditing) {
      setEditForm({
        status: lead.status,
        assigned_to: lead.assigned_to,
        interest_level: lead.interest_level,
        notes: lead.notes,
      });
    }
  }, [lead, isEditing]);

  const handleSave = async () => {
    if (!lead) return;
    await dispatch(
      updateLead({
        displayId: lead.display_id,
        data: editForm,
      })
    );
    setIsEditing(false);
  };

  const handleRefresh = () => {
    if (id) {
      dispatch(fetchLeadById(id));
      if (lead?.id != null) {
        dispatch(fetchFollowups({ lead: lead.id }));
        dispatch(fetchWhatsappMessages({ lead: lead.id }));
      }
    }
  };

  if (isLoading && !lead) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 animate-pulse">
            <div className="h-6 bg-line rounded w-48 mb-4" />
            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-line">
              {[...Array(4)].map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-line rounded w-16 mb-2" />
                  <div className="h-4 bg-line rounded w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !lead) {
    return <ErrorState message={error} onRetry={handleRefresh} />;
  }

  if (!lead && !isLoading) {
    return <Navigate to="/leads" replace />;
  }

  if (!lead) return null;

  // Determine current pipeline stage index
  const currentStageIndex = PIPELINE_STAGES.indexOf(lead.status);

  return (
    <div className="space-y-6 animate-in">
      {/* ─── Human Callback Alert ─── */}
      {lead.status === "Needs Human Follow-up" && (
        <div className="rounded-md bg-gold-100 border border-gold-300 px-5 py-4 flex items-center gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-full bg-gold-500 text-brand-900 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-ink">
              Human Agent Follow-up Required
            </p>
            <p className="text-xs text-ink/75 mt-0.5">
              Riya (AI Assistant) flagged this enquiry for manual agent callback. Assign an executive or schedule a visit slot below.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Main Column ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ─── Lead Header Banner ─── */}
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap pb-4 border-b border-line">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Enquiry Profile #{lead.display_id || lead.id}
                </span>
                <h2 className="text-2xl font-extrabold text-ink tracking-tight mt-0.5">
                  {lead.name}
                </h2>
                <p className="text-xs text-muted font-medium flex items-center gap-2 mt-1">
                  <MapPin size={13} className="text-brand-600" /> {lead.location}
                  <span>·</span>
                  <span className="tabular-nums font-semibold text-ink">{lead.mobile}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={lead.status} />
                <button
                  onClick={handleRefresh}
                  className="btn-secondary text-xs p-2 shrink-0"
                  title="Refresh"
                >
                  <RefreshCw size={14} />
                </button>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-secondary text-xs py-1.5 px-3 shrink-0 font-semibold"
                  >
                    <Edit3 size={13} />
                    Edit Details
                  </button>
                )}
              </div>
            </div>

            {/* ─── Pipeline Progress Bar ─── */}
            <div className="mt-5 pt-1">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
                Pipeline Stage Progression
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-1 bg-line p-1 rounded-md border border-line">
                {PIPELINE_STAGES.map((stg, i) => {
                  const isActive = stg === lead.status;
                  const isPassed = currentStageIndex > -1 && i <= currentStageIndex;
                  return (
                    <div
                      key={stg}
                      className={`text-center py-2 px-1 text-[11px] font-bold rounded-xs transition-colors truncate ${
                        isActive
                          ? "bg-brand-600 text-white shadow-xs"
                          : isPassed
                          ? "bg-brand-100 text-brand-800"
                          : "bg-surface text-muted/60"
                      }`}
                      title={stg}
                    >
                      {stg}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Requirement Summary Cells ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-line">
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Requirement</span>
                <p className="text-sm font-bold text-ink mt-0.5">{lead.requirement_type} · {lead.property_type}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Budget</span>
                <p className="text-sm font-bold text-brand-700 mt-0.5 tabular-nums">
                  {formatBudgetRange(lead.budget_min, lead.budget_max)}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Timeline</span>
                <p className="text-sm font-bold text-ink mt-0.5">{lead.timeline || "Immediate"}</p>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider block">Interest Level</span>
                <p className="text-sm font-bold text-ink mt-0.5">{lead.interest_level}</p>
              </div>
            </div>
          </div>

          {/* ─── Telephony Call History ─── */}
          <div className="card p-6">
            <h3 className="section-title font-bold text-base mb-4 pb-3 border-b border-line flex items-center gap-2">
              <PhoneCall size={16} className="text-brand-600" />
              Call History
            </h3>
            <div className="space-y-3">
              {followups
                .filter((f) => f.type === "Call")
                .map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface p-3.5 hover:border-brand-300 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-9 w-9 rounded-md bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-200">
                        <PhoneCall size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ink">{call.note || "Inbound Telephony Call"}</p>
                        <p className="text-[11px] text-muted font-medium tabular-nums mt-0.5">
                          {formatDateTime(call.due_at)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={call.status} />
                  </div>
                ))}
              {followups.filter((f) => f.type === "Call").length === 0 && (
                <EmptyState
                  title="No Call Activity Logged"
                  description="Telephony call records associated with this prospect will display here."
                />
              )}
            </div>
          </div>

          {/* ─── WhatsApp Activity ─── */}
          <div className="card p-6">
            <h3 className="section-title font-bold text-base mb-4 pb-3 border-b border-line flex items-center gap-2">
              <MessageCircle size={16} className="text-brand-600" />
              Automated WhatsApp History
            </h3>
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m.id} className="rounded-md border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-3 pb-2 border-b border-line/60">
                    <p className="text-xs font-bold text-ink flex items-center gap-2">
                      <MessageCircle size={13} className="text-brand-600" />
                      Template: {m.template}
                    </p>
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="bg-brand-50/50 p-3 rounded text-xs leading-relaxed text-ink mt-2 border border-brand-100">
                    {m.body}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted mt-2">
                    <span>Sent: {formatDateTime(m.sent_at)}</span>
                    {m.failure_reason && (
                      <span className="text-brick-600 font-semibold">{m.failure_reason}</span>
                    )}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <EmptyState
                  title="No WhatsApp Activity"
                  description="Automated messaging post-call updates will appear here."
                />
              )}
            </div>
          </div>
        </div>

        {/* ─── Sidebar Controls (Manage Lead & Contact) ─── */}
        <div className="space-y-6">
          {/* Manage Lead Settings */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
              <h3 className="section-title font-bold text-sm">Manage Enquiry</h3>
              {isEditing && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleSave}
                    className="btn-primary text-xs py-1 px-2.5 font-semibold"
                  >
                    <Save size={13} /> Save
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary text-xs py-1 px-2"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="label">Status Pipeline</label>
                <select
                  className="input text-xs"
                  value={isEditing ? (editForm.status || lead.status) : lead.status}
                  onChange={(e) => {
                    if (isEditing) {
                      setEditForm((f) => ({ ...f, status: e.target.value as LeadStatus }));
                    } else {
                      dispatch(
                        updateLead({
                          displayId: lead.display_id,
                          data: { status: e.target.value as LeadStatus },
                        })
                      );
                    }
                  }}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Assigned Executive</label>
                <select
                  className="input text-xs"
                  value={isEditing ? (editForm.assigned_to ?? "") : (lead.assigned_to ?? "")}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    if (isEditing) {
                      setEditForm((f) => ({ ...f, assigned_to: val }));
                    } else {
                      dispatch(
                        updateLead({
                          displayId: lead.display_id,
                          data: { assigned_to: val },
                        })
                      );
                    }
                  }}
                >
                  <option value="">Unassigned</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="card p-6">
            <h3 className="section-title font-bold text-sm mb-3 pb-2 border-b border-line">
              Prospect Details
            </h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-muted font-medium">Name:</span>
                <p className="font-bold text-ink text-sm">{lead.name}</p>
              </div>
              <div>
                <span className="text-muted font-medium">Mobile:</span>
                <p className="font-bold text-ink tabular-nums">{lead.mobile}</p>
              </div>
              {lead.email && (
                <div>
                  <span className="text-muted font-medium">Email:</span>
                  <p className="font-semibold text-ink">{lead.email}</p>
                </div>
              )}
              <div className="pt-3 border-t border-line space-y-1 text-[11px] text-muted">
                <p>Enquiry ID: <strong className="text-ink">{lead.id}</strong></p>
                <p>Created: <span className="tabular-nums">{formatDateTime(lead.created_at)}</span></p>
                <p>Updated: <span className="tabular-nums">{formatDateTime(lead.updated_at)}</span></p>
              </div>
            </div>
          </div>

          {/* Follow-up Tasks */}
          <div className="card p-6">
            <h3 className="section-title font-bold text-sm mb-3 pb-2 border-b border-line flex items-center gap-2">
              <CalendarClock size={16} className="text-brand-600" />
              Scheduled Tasks
            </h3>
            <div className="space-y-3 text-xs">
              {followups
                .filter((f) => f.type !== "Call")
                .map((fu) => (
                  <div key={fu.id} className="border-b border-line pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink">{fu.type}</span>
                      <StatusBadge status={fu.status} />
                    </div>
                    <p className="text-xs text-muted mt-1">{fu.note}</p>
                    <p className="text-[11px] text-muted tabular-nums mt-1">{formatDateTime(fu.due_at)}</p>
                  </div>
                ))}
              {followups.filter((f) => f.type !== "Call").length === 0 && (
                <p className="text-xs text-muted">No scheduled follow-up tasks.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

