import { useParams, Link, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Mic, User, Bot } from "lucide-react";
import { selectCallById } from "../../store/callsSlice";
import { selectLeadById } from "../../store/leadsSlice";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime, formatDuration } from "../../utils/format";

export default function CallDetail() {
  const { id } = useParams();
  const call = useSelector(selectCallById(id));
  const lead = useSelector(selectLeadById(call?.leadId));

  if (!call) return <Navigate to="/calls" replace />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 space-y-5">
        <div className="card p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-muted">Inbound call from</p>
              <p className="font-display text-xl text-ink">{call.fromNumber}</p>
            </div>
            <StatusBadge status={call.status} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-line">
            <div>
              <p className="text-xs text-muted">Duration</p>
              <p className="text-sm font-medium text-ink mt-0.5">{formatDuration(call.durationSec)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Started</p>
              <p className="text-sm font-medium text-ink mt-0.5">{formatDateTime(call.startedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Recording</p>
              <p className="text-sm font-medium text-ink mt-0.5 flex items-center gap-1.5">
                {call.recordingAvailable ? (
                  <>
                    <Mic size={14} className="text-brand-500" /> Available
                  </>
                ) : (
                  "Not available"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-4">Transcript</h3>
          {call.transcript.length === 0 ? (
            <p className="text-sm text-muted">
              No transcript available — the call failed to connect, so no conversation was recorded.
            </p>
          ) : (
            <div className="space-y-4">
              {call.transcript.map((turn, i) => (
                <div key={i} className="flex gap-3">
                  <div
                    className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
                      turn.speaker === "AI" ? "bg-brand-50 text-brand-500" : "bg-brass-100 text-brass-600"
                    }`}
                  >
                    {turn.speaker === "AI" ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  <div>
                    <p className="text-xs text-muted mb-0.5">{turn.speaker === "AI" ? "AI assistant" : "Customer"}</p>
                    <p className="text-sm text-ink leading-relaxed">{turn.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {lead && (
          <div className="card p-5">
            <h3 className="font-display text-lg text-ink mb-2">Linked lead</h3>
            <Link to={`/leads/${lead.id}`} className="text-sm font-medium text-brand-500 hover:underline">
              {lead.name}
            </Link>
            <p className="text-xs text-muted mt-1">{lead.mobile}</p>
          </div>
        )}

        <div className="card p-5">
          <h3 className="font-display text-lg text-ink mb-3">AI call summary</h3>
          {call.summary ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted">Requirement</p>
                <p className="text-ink mt-0.5">{call.summary.requirement}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Budget</p>
                <p className="text-ink mt-0.5">{call.summary.budget}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Location</p>
                <p className="text-ink mt-0.5">{call.summary.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Interest level</p>
                <p className="text-ink mt-0.5">{call.summary.interestLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Key points</p>
                <ul className="list-disc list-inside text-ink mt-0.5 space-y-0.5">
                  {call.summary.keyPoints.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-line">
                <p className="text-xs text-muted">Suggested next action</p>
                <p className="text-ink mt-0.5 font-medium">{call.summary.suggestedAction}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">No summary was generated for this call.</p>
          )}
        </div>
      </div>
    </div>
  );
}
