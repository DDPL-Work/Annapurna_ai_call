import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RotateCw, AlertTriangle } from "lucide-react";
import { selectFilteredWhatsapp, setWhatsappFilter, resendMessage } from "../store/whatsappSlice";
import StatusBadge from "../components/ui/StatusBadge";
import { formatDateTime } from "../utils/format";

const STATUSES = ["All", "Sent", "Delivered", "Read", "Failed"];

export default function WhatsAppPage() {
  const dispatch = useDispatch();
  const messages = useSelector(selectFilteredWhatsapp);
  const filter = useSelector((s) => s.whatsapp.filters.status);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => dispatch(setWhatsappFilter({ status: s }))}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filter === s
                ? "bg-brand-500 text-white border-brand-500"
                : "border-line text-muted hover:border-brand-500/40"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Link to={`/leads/${m.leadId}`} className="text-sm font-medium text-ink hover:text-brand-500">
                  {m.leadName}
                </Link>
                <p className="text-xs text-muted mt-0.5">
                  Template: {m.template} &middot; {formatDateTime(m.sentAt)}
                </p>
              </div>
              <StatusBadge status={m.status} />
            </div>
            <p className="text-sm text-ink mt-3 leading-relaxed">{m.body}</p>
            {m.status === "Failed" && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-sm bg-brick-100 px-3 py-2">
                <p className="text-xs text-brick-600 flex items-center gap-1.5">
                  <AlertTriangle size={13} /> {m.failureReason}
                </p>
                <button
                  onClick={() => dispatch(resendMessage(m.id))}
                  className="text-xs font-medium text-brick-600 hover:underline flex items-center gap-1"
                >
                  <RotateCw size={12} /> Resend
                </button>
              </div>
            )}
          </div>
        ))}
        {messages.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-sm font-medium text-ink">No messages with this status</p>
            <p className="text-sm text-muted mt-1">Choose a different filter above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
