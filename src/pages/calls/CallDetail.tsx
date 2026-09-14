import { useEffect, useCallback, useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Mic,
  User,
  Bot,
  RefreshCw,
  ArrowLeft,
  CalendarClock,
  Volume2,
  MicOff,
  ShieldAlert,
  AlertTriangle,
} from "lucide-react";
import {
  fetchCallById,
  fetchCallTranscript,
  fetchCallSummary,
  selectCallById,
  selectCallTranscript,
  selectCallSummary,
  selectCallsLoading,
  selectTranscriptLoading,
  selectSummaryLoading,
  selectCallsError,
  clearCallDetail,
} from "../../store/callsSlice";
import type { AppDispatch } from "../../store/store";
import type { Call, TranscriptTurn } from "../../lib/api/types";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { formatDateTime, formatDuration } from "../../utils/format";

export default function CallDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const call = useSelector(selectCallById(id || ""));
  const transcript = useSelector(selectCallTranscript);
  const summary = useSelector(selectCallSummary);
  const isLoading = useSelector(selectCallsLoading);
  const callsError = useSelector(selectCallsError);
  const transcriptLoading = useSelector(selectTranscriptLoading);
  const summaryLoading = useSelector(selectSummaryLoading);

  const transcriptTurns = transcript?.turns ?? [];
  const summaryKeyPoints = summary?.key_points ?? [];
  const transcriptFullText = transcript?.full_text ?? "";

  const is403 = callsError?.includes("403") || callsError?.toLowerCase().includes("permission");

  const loadCallData = useCallback(() => {
    if (id) {
      dispatch(fetchCallTranscript(id));
      dispatch(fetchCallSummary(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id) {
      if (!call) {
        dispatch(fetchCallById(id));
      }
      loadCallData();
    }
    return () => {
      dispatch(clearCallDetail());
    };
  }, [dispatch, id, loadCallData, call]);

  if (isLoading && !call) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 animate-pulse">
            <div className="h-6 bg-line rounded w-48 mb-4" />
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-line">
              {[...Array(3)].map((_, i) => (
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

  if (!call && !isLoading) {
    return <Navigate to="/calls" replace />;
  }

  if (!call) return null;

  return (
    <div className="space-y-6 animate-in">
      {/* ─── Top Breadcrumb Navigation ─── */}
      <div className="flex items-center gap-2 text-xs font-semibold text-muted">
        <Link to="/calls" className="hover:text-brand-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Call Log
        </Link>
        <span>/</span>
        <span className="text-ink font-bold">{call.display_id || call.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Main Content Column ─── */}
        <div className="lg:col-span-2 space-y-6">
          {/* ─── Call Overview Banner ─── */}
          <div className="card p-6">
            <div className="flex items-start justify-between flex-wrap gap-4 pb-4 border-b border-line">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  {call.direction || "Inbound"} Telephony Call {call.provider ? `· ${call.provider}` : ""}
                </span>
                <h2 className="text-2xl font-extrabold text-ink tracking-tight tabular-nums mt-0.5">
                  {call.from_number}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={call.status} />
                <button
                  onClick={loadCallData}
                  className="btn-secondary text-xs p-2 shrink-0"
                  title="Refresh Call Details"
                >
                  <RefreshCw size={14} className={transcriptLoading ? "animate-spin text-brand-600" : ""} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Duration</p>
                <p className="text-sm font-bold text-ink mt-1 tabular-nums">
                  {call.duration_formatted || formatDuration(call.duration_sec)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Started Time</p>
                <p className="text-sm font-bold text-ink mt-1 tabular-nums">
                  {formatDateTime(call.started_at)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Recording Status</p>
                <p className="text-sm font-bold text-ink mt-1 flex items-center gap-1.5">
                  {call.recording_status === "Available" || call.recording_available ? (
                    <span className="inline-flex items-center gap-1 text-brand-700 font-semibold bg-brand-50 px-2 py-0.5 rounded text-xs border border-brand-200">
                      <Mic size={13} className="text-brand-600" /> Available
                    </span>
                  ) : (
                    <span className="text-muted/60 text-xs font-normal">Recording Unavailable</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ─── Call Recording Player ─── */}
          <CallRecordingPlayer call={call} is403={is403} />

          {/* ─── Conversation Timeline / Transcript ─── */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-line">
              <h3 className="section-title font-bold text-lg flex items-center gap-2">
                <Bot size={18} className="text-brand-600" />
                Live Call Transcript
              </h3>
              {transcriptLoading && (
                <span className="text-xs font-medium text-brand-600 animate-pulse">Loading turns...</span>
              )}
            </div>

            {!transcript && !transcriptLoading ? (
              <EmptyState
                title="Transcript Unavailable"
                description="The call was completed, but no transcript is available for this call record."
              />
            ) : transcriptTurns.length === 0 && !transcriptFullText ? (
              <EmptyState
                title="No Conversation Detected"
                description="The call ended before speech audio turns were detected by the STT engine."
              />
            ) : transcriptTurns.length > 0 ? (
              <div className="space-y-4 pt-2">
                {transcriptTurns.map((turn: TranscriptTurn, i: number) => {
                  const isAI = turn.speaker === "AI";
                  return (
                    <div key={i} className={`flex gap-3.5 ${isAI ? "" : "flex-row-reverse"}`}>
                      {/* Speaker Badge */}
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-xs border ${
                          isAI
                            ? "bg-brand-600 text-white border-brand-700"
                            : "bg-gold-500 text-brand-900 border-gold-600"
                        }`}
                      >
                        {isAI ? <Bot size={16} /> : <User size={16} />}
                      </div>

                      {/* Bubble */}
                      <div className={`max-w-xl ${isAI ? "text-left" : "text-right"}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold ${isAI ? "text-brand-700" : "text-ink"}`}>
                            {isAI ? "Riya (AI Assistant)" : "Caller"}
                          </span>
                          {turn.timestamp && (
                            <span className="text-[11px] text-muted tabular-nums">
                              {formatDateTime(turn.timestamp)}
                            </span>
                          )}
                        </div>
                        <div
                          className={`rounded-md p-3.5 text-xs leading-relaxed shadow-xs ${
                            isAI
                              ? "bg-brand-50/70 border border-brand-200 text-ink"
                              : "bg-surface-muted border border-line text-ink"
                          }`}
                        >
                          {turn.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md bg-surface-muted p-4 border border-line">
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink font-mono">
                  {transcriptFullText}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── Sidebar Column (Intelligence & Linked Lead) ─── */}
        <div className="space-y-6">
          {/* Linked Lead Card */}
          {call.lead && (
            <div className="card p-5 border-l-4 border-l-brand-600">
              <h3 className="section-title text-xs font-bold uppercase tracking-wider text-muted mb-2">
                Linked Enquiry
              </h3>
              <Link
                to={`/leads/${call.lead}`}
                className="text-sm font-bold text-brand-600 hover:underline flex items-center gap-1.5"
              >
                {call.lead_name || `Enquiry #${call.lead}`}
                <ArrowLeft size={13} className="rotate-180" />
              </Link>
            </div>
          )}

          {/* AI Intelligence & Call Summary */}
          <div className="card p-6">
            <h3 className="section-title font-bold text-base mb-4 pb-3 border-b border-line flex items-center gap-2">
              <Bot size={18} className="text-brand-600" />
              AI Call Intelligence
            </h3>

            {summaryLoading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i}>
                    <div className="h-3 bg-line rounded w-20 mb-1" />
                    <div className="h-4 bg-line rounded w-full" />
                  </div>
                ))}
              </div>
            ) : summary ? (
              <div className="space-y-4 text-xs">
                {summary.requirement && (
                  <div>
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Requirement</span>
                    <p className="text-xs font-semibold text-ink mt-0.5 leading-relaxed">{summary.requirement}</p>
                  </div>
                )}
                {summary.budget_text && (
                  <div>
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Budget</span>
                    <p className="text-xs font-semibold text-ink mt-0.5">{summary.budget_text}</p>
                  </div>
                )}
                {summary.location && (
                  <div>
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Location</span>
                    <p className="text-xs font-semibold text-ink mt-0.5">{summary.location}</p>
                  </div>
                )}
                {summary.interest_level && (
                  <div>
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Interest Level</span>
                    <p className="text-xs font-semibold text-ink mt-0.5">
                      <span className="inline-block px-2 py-0.5 rounded bg-gold-100 text-gold-700 font-bold border border-gold-300">
                        {summary.interest_level}
                      </span>
                    </p>
                  </div>
                )}
                {summaryKeyPoints.length > 0 && (
                  <div className="pt-2 border-t border-line">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Key Takeaways</span>
                    <ul className="list-disc list-inside text-ink mt-1 space-y-1 font-medium">
                      {summaryKeyPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.suggested_action && (
                  <div className="pt-3 border-t border-line">
                    <span className="text-[11px] font-semibold text-muted uppercase tracking-wider">Suggested Next Action</span>
                    <p className="text-xs font-bold text-brand-700 mt-1 bg-brand-50 p-2.5 rounded border border-brand-200">
                      {summary.suggested_action}
                    </p>
                  </div>
                )}
                {summary.follow_up_date && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted pt-2">
                    <CalendarClock size={14} className="text-brand-600" />
                    <span>Follow-up: {formatDateTime(summary.follow_up_date)}</span>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="Summary Processing"
                description="AI structured analysis will populate as soon as call post-processing completes."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CallRecordingPlayer({ call, is403 }: { call: Call; is403?: boolean }) {
  const [playbackError, setPlaybackError] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  if (is403) {
    return (
      <div className="card p-5 border-l-4 border-l-brick-500 bg-brick-50/40">
        <div className="flex items-center gap-3">
          <ShieldAlert className="text-brick-600 shrink-0" size={20} />
          <div>
            <h4 className="text-xs font-bold text-brick-900 uppercase tracking-wider">Permission Restricted</h4>
            <p className="text-xs text-brick-700 mt-0.5 font-medium">
              You don't have permission to access this recording.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasStatusAvailable = call.recording_status === "Available" || call.recording_available === true;
  const hasUrl = Boolean(call.recording_url && call.recording_url.trim() !== "");

  if (!hasStatusAvailable || !hasUrl) {
    return (
      <div className="card p-5 bg-paper border border-line">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-surface-muted text-muted flex items-center justify-center shrink-0 border border-line">
            <MicOff size={16} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Recording Unavailable</h4>
            <p className="text-xs text-muted mt-0.5">The recording for this call is not currently available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 bg-paper border border-line space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={16} className="text-brand-600" />
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider">Call Recording</h4>
        </div>
        <span className="text-xs font-mono font-semibold text-muted bg-surface px-2.5 py-0.5 rounded border border-line">
          {call.duration_formatted || formatDuration(call.duration_sec)}
        </span>
      </div>

      {playbackError ? (
        <div className="flex items-center justify-between p-3.5 rounded bg-brick-50 border border-brick-200 text-brick-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-brick-600 shrink-0" />
            <span className="font-semibold">Unable to play recording</span>
          </div>
          <button
            onClick={() => {
              setPlaybackError(false);
              setIsLoadingAudio(true);
            }}
            className="btn-secondary text-xs py-1 px-3 text-brick-800 border-brick-300 hover:bg-brick-100 font-semibold"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <audio
            controls
            controlsList="nodownload"
            preload="metadata"
            className="w-full h-10 rounded focus:outline-hidden"
            onLoadStart={() => setIsLoadingAudio(true)}
            onCanPlay={() => setIsLoadingAudio(false)}
            onError={() => {
              setIsLoadingAudio(false);
              setPlaybackError(true);
            }}
          >
            <source src={call.recording_url} />
            Your browser does not support native audio playback.
          </audio>
          {isLoadingAudio && (
            <p className="text-[11px] text-brand-600 animate-pulse font-semibold">Loading recording audio...</p>
          )}
        </div>
      )}
    </div>
  );
}
