import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RotateCw, AlertTriangle, MessageCircle, RefreshCw, Send, CheckCheck, Clock, ExternalLink } from "lucide-react";
import {
  fetchWhatsappMessages,
  resendWhatsappMessage,
  setWhatsappFilter,
  setWhatsappPage,
  clearResendError,
  selectFilteredWhatsapp,
  selectWhatsappFilter,
  selectWhatsappLoading,
  selectWhatsappError,
  selectWhatsappResendingId,
  selectWhatsappResendError,
  selectWhatsappTotalCount,
  selectWhatsappCurrentPage,
  selectWhatsappPageSize,
} from "../store/whatsappSlice";
import { showToast } from "../store/uiSlice";
import type { AppDispatch } from "../store/store";
import { WHATSAPP_STATUSES } from "../lib/api/types";
import type { WhatsAppStatus, WhatsAppMessage } from "../lib/api/types";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import { TableSkeleton } from "../components/ui/Skeleton";
import { formatDateTime } from "../utils/format";

const STATUSES: (WhatsAppStatus | "All")[] = ["All", ...WHATSAPP_STATUSES];

function MessageCard({
  message,
  isResending,
  onResend,
}: {
  message: WhatsAppMessage;
  isResending: boolean;
  onResend: (id: string) => void;
}) {
  const isFailed = message.status === "Failed";

  return (
    <div className="card p-5 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-4 flex-wrap pb-3 border-b border-line">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to={`/leads/${message.lead}`}
              className="text-base font-semibold text-ink hover:text-brand-600 transition-colors inline-flex items-center gap-1.5"
            >
              {message.lead_name}
              <ExternalLink size={13} className="text-muted opacity-70" />
            </Link>
            <StatusBadge status={message.status} />
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-50/80 px-2.5 py-0.5 text-xs font-medium text-brand-700 border border-brand-200/60">
              Template: {message.template}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted flex-wrap tabular-nums">
            <span className="flex items-center gap-1">
              <Send size={12} className="text-muted" />
              Sent: {formatDateTime(message.sent_at)}
            </span>
            {message.delivered_at && (
              <span className="flex items-center gap-1 text-emerald-700">
                <CheckCheck size={12} />
                Delivered: {formatDateTime(message.delivered_at)}
              </span>
            )}
            {message.read_at && (
              <span className="flex items-center gap-1 text-brand-600">
                <CheckCheck size={12} className="text-brand-600" />
                Read: {formatDateTime(message.read_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3.5 bg-paper rounded-md p-3.5 border border-line/60">
        <p className="text-sm text-ink leading-relaxed whitespace-pre-line font-sans">{message.body}</p>
      </div>

      {isFailed && (
        <div className="mt-3.5 flex items-center justify-between gap-3 rounded-md bg-brick-50/90 border border-brick-200 px-4 py-3">
          <p className="text-xs font-medium text-brick-700 flex items-center gap-2">
            <AlertTriangle size={14} className="shrink-0 text-brick-600" />
            <span>Failure Reason: {message.failure_reason || "Delivery failed via gateway"}</span>
          </p>
          <button
            onClick={() => onResend(message.id)}
            disabled={isResending}
            className="btn-ghost text-xs font-semibold text-brick-700 hover:bg-brick-100/80 hover:text-brick-800 shrink-0 border border-brick-300/60 shadow-xs"
          >
            <RotateCw
              size={13}
              className={isResending ? "animate-spin" : ""}
            />
            {isResending ? "Resending..." : "Resend Message"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function WhatsAppPage() {
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector(selectFilteredWhatsapp);
  const filter = useSelector(selectWhatsappFilter);
  const isLoading = useSelector(selectWhatsappLoading);
  const error = useSelector(selectWhatsappError);
  const resendingId = useSelector(selectWhatsappResendingId);
  const resendError = useSelector(selectWhatsappResendError);
  const totalCount = useSelector(selectWhatsappTotalCount);
  const currentPage = useSelector(selectWhatsappCurrentPage);
  const pageSize = useSelector(selectWhatsappPageSize);

  const loadMessages = useCallback(() => {
    const params: Record<string, string | number | undefined> = {
      page: currentPage,
      page_size: pageSize,
    };
    if (filter !== "All") params.status = filter;
    dispatch(fetchWhatsappMessages(params as Parameters<typeof fetchWhatsappMessages>[0]));
  }, [dispatch, filter, currentPage, pageSize]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (resendError) {
      dispatch(showToast({ tone: "error", message: resendError }));
      dispatch(clearResendError());
    }
  }, [resendError, dispatch]);

  const handleResend = (displayId: string) => {
    dispatch(resendWhatsappMessage(displayId)).unwrap().then(() => {
      dispatch(showToast({ tone: "success", message: "Message resent successfully" }));
    }).catch(() => {
      // Error toast handled by useEffect watching resendError
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2.5">
            <MessageCircle className="text-brand-600" size={24} />
            WhatsApp Follow-up Logs
          </h1>
          <p className="text-sm text-muted mt-1">
            Automated WhatsApp property detail packages and call summary follow-ups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadMessages}
            className="btn-secondary"
            title="Refresh WhatsApp Messages"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin text-brand-600" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ─── Status Filter Tabs ─── */}
      <div className="flex items-center justify-between border-b border-line overflow-x-auto gap-2 pt-1 pb-0.5">
        <div className="flex items-center gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => dispatch(setWhatsappFilter(s))}
              className={`tab text-xs capitalize ${filter === s ? "tab-active font-semibold" : "tab-inactive"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted font-medium tabular-nums hidden sm:inline-block">
          Total Messages: {totalCount}
        </span>
      </div>

      {/* ─── Error ─── */}
      {error && <ErrorState message={error} onRetry={loadMessages} />}

      {/* ─── Messages List ─── */}
      {isLoading ? (
        <div className="space-y-4">
          <TableSkeleton rows={4} cols={1} />
        </div>
      ) : messages.length === 0 ? (
        <div className="card p-12">
          <EmptyState
            title={
              filter === "All"
                ? "No WhatsApp messages sent yet"
                : `No ${filter.toLowerCase()} WhatsApp messages`
            }
            description={
              filter === "All"
                ? "Automated WhatsApp follow-up messages will appear here once AI calls trigger property brochures or summary messages."
                : "Try selecting a different status filter above."
            }
            icon={MessageCircle}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              isResending={resendingId === m.id}
              onResend={handleResend}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={(page) => dispatch(setWhatsappPage(page))}
        />
      )}
    </div>
  );
}

